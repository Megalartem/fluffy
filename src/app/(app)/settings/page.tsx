"use client";

import { useRef, useState } from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import { BackupService } from "@/features/backup/model/service";

function downloadJson(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function SettingsPage() {
    const { workspaceId } = useWorkspace();
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [busy, setBusy] = useState(false);
    const [mode, setMode] = useState<"replace" | "merge">("replace");


    async function exportData() {
        setBusy(true);
        try {
            const backup = await new BackupService().exportWorkspace(workspaceId);
            downloadJson(`budget-backup-${backup.workspaceId}-${backup.exportedAt.slice(0, 10)}.json`, backup);
        } finally {
            setBusy(false);
        }
    }

    async function importData(file: File) {
        setBusy(true);
        try {
            const txt = await file.text();
            const json = JSON.parse(txt);

            const ok = confirm(
                mode === "replace"
                    ? "Импорт заменит текущие данные в приложении. Продолжить?"
                    : "Импорт добавит/обновит данные (merge). Продолжить?"
            );
            if (!ok) return;


            await new BackupService().importWorkspace(workspaceId, json, mode);


            alert("Импорт завершён. Сейчас обновлю страницу.");
            window.location.reload();
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Настройки</h1>

            <div className="rounded-2xl border p-4 space-y-3">
                <div className="font-semibold">Резервная копия</div>
                <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="importMode"
                            checked={mode === "replace"}
                            onChange={() => setMode("replace")}
                        />
                        Replace (заменить данные)
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="importMode"
                            checked={mode === "merge"}
                            onChange={() => setMode("merge")}
                        />
                        Merge (добавить/обновить)
                    </label>
                </div>

                <div className="text-sm opacity-70">
                    Экспортируй данные в JSON, чтобы хранить их у себя и переносить между устройствами.
                </div>

                <div className="flex gap-2">
                    <button
                        className="rounded-2xl bg-black text-white px-4 py-2 font-semibold disabled:opacity-50"
                        onClick={exportData}
                        disabled={busy}
                        type="button"
                    >
                        Экспорт
                    </button>

                    <button
                        className="rounded-2xl border px-4 py-2 font-semibold disabled:opacity-50"
                        onClick={() => fileRef.current?.click()}
                        disabled={busy}
                        type="button"
                    >
                        Импорт
                    </button>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) importData(f);
                            e.currentTarget.value = "";
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
