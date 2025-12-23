"use client";

import { useEffect, useRef, useState } from "react";
import type { Notice } from "@/features/notifications/model/types";

export function NotificationsBell({
    notices,
    onDismiss,
}: {
    notices: Notice[];
    onDismiss: (n: Notice) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    // close on outside click
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!open) return;
            const el = rootRef.current;
            if (!el) return;
            if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);

    // close on Esc
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const count = notices.length;

    return (
        <div className="relative" ref={rootRef}>
            <button className="relative inline-flex items-center gap-2 rounded-xl border px-3 py-2"
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Уведомления"
                title="Уведомления"
            >
                {/* simple bell glyph */}
                <span className="text-lg leading-none">🔔</span>

                {count > 0 ? (
                    <span className="min-w-6 h-6 px-2 rounded-full bg-black text-white text-xs flex items-center justify-center">
                        {count}
                    </span>
                ) : null}
            </button>

            {open ? (
                <>
                    {/* backdrop */}
                    <button
                        type="button"
                        className="fixed inset-0 z-40 cursor-default"
                        aria-label="Close notifications"
                        onClick={() => setOpen(false)}
                    />

                    {/* panel */}
                    <div className="absolute right-0 mt-2 w-[320px] z-50 rounded-2xl border bg-white shadow-lg">
                        <div className="p-4 flex items-center justify-between gap-2">
                            <div className="font-semibold">Уведомления</div>

                            <div className="flex items-center gap-2">
                                {notices.length > 0 ? (
                                    <button
                                        className="rounded-lg border px-2 py-1 text-sm disabled:opacity-50"
                                        type="button"
                                        disabled={processing}
                                        onClick={async () => {
                                            setProcessing(true);
                                            try {
                                                // dismiss all sequentially to keep it safe
                                                for (const n of notices) {
                                                    await onDismiss(n);
                                                }
                                            } finally {
                                                setProcessing(false);
                                            }
                                        }}
                                        title="Отметить все как прочитанные"
                                    >
                                        {processing ? "…" : "Прочитать всё"}
                                    </button>
                                ) : null}

                                <button
                                    className="rounded-lg border px-2 py-1 text-sm"
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    disabled={processing}
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>


                        <div className="border-t" />

                        <div className="max-h-[360px] overflow-auto p-2">
                            {count === 0 ? (
                                <div className="p-4 text-sm opacity-70">Пока тихо ✨</div>
                            ) : (
                                <div className="space-y-2">
                                    {notices.map((n) => (
                                        <div key={n.id} className="rounded-2xl border p-3">
                                            <div className="font-semibold">{n.title}</div>
                                            <div className="text-sm opacity-80 mt-1">{n.message}</div>

                                            <div className="mt-3 flex justify-end">
                                                <button
                                                    className="rounded-xl border px-3 py-2 text-sm"
                                                    type="button"
                                                    onClick={async () => {
                                                        await onDismiss(n);
                                                    }}
                                                >
                                                    Ок, понял
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
