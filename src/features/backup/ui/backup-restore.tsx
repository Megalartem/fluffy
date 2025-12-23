/**
 * BackupRestore - Complete backup/restore management component
 *
 * Features:
 * - Export and import in one place
 * - Auto-backup scheduling
 * - Backup history
 * - Safety warnings
 */

import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { BackupExport } from "./backup-export";
import { BackupImport } from "./backup-import";

interface BackupRestoreProps {
  onExport?: () => Promise<Blob>;
  onImport?: (file: File) => Promise<{
    imported: number;
    skipped: number;
    errors: Array<{ item: string; reason: string }>;
  }>;
  autoBackupEnabled?: boolean;
  onAutoBackupChange?: (enabled: boolean) => void;
}

export function BackupRestore({
  onExport,
  onImport,
  autoBackupEnabled = false,
  onAutoBackupChange,
}: BackupRestoreProps) {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [showWarning, setShowWarning] = useState(false);

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="font-medium text-orange-900">⚠️ Важно</div>
        <p className="text-sm text-orange-700 mt-1">
          Регулярно создавайте резервные копии ваших данных. В случае потери
          данных мы не можем гарантировать их восстановление.
        </p>
      </div>

      {/* Auto-backup toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <div className="font-medium text-gray-900">Автоматическая резервная копия</div>
          <p className="text-sm text-gray-600 mt-1">
            Создавайте резервную копию автоматически каждый день
          </p>
        </div>
        <button
          onClick={() => onAutoBackupChange?.(!autoBackupEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoBackupEnabled ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoBackupEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("export")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "export"
              ? "border-black text-black"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Экспорт
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "import"
              ? "border-black text-black"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Импорт
        </button>
      </div>

      {/* Content */}
      <div className="min-h-64">
        {activeTab === "export" ? (
          <BackupExport onExport={onExport} />
        ) : (
          <div className="space-y-4">
            {showWarning ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-medium text-red-900 mb-2">
                  ⚠️ Осторожно!
                </div>
                <p className="text-sm text-red-700 mb-4">
                  Импорт данных перезапишет существующие данные. Эта операция
                  может быть необратима.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowWarning(false)}
                    variant="secondary"
                    size="sm"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={() => {
                      setShowWarning(false);
                      // Continue with import
                    }}
                    variant="danger"
                    size="sm"
                  >
                    Я понимаю, продолжить
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => setShowWarning(true)}
                  variant="danger"
                  size="md"
                >
                  Начать импорт
                </Button>
                <BackupImport onImport={onImport} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
