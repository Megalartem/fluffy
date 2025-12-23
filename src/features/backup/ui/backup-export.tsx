/**
 * BackupExport - Component for exporting workspace data
 *
 * Features:
 * - Progress indicator
 * - File size display
 * - Success/error feedback
 * - Download link
 */

import React, { useState } from "react";
import { Button } from "@/shared/ui/button";

interface BackupExportProps {
  onExport?: () => Promise<Blob>;
  fileName?: string;
}

export function BackupExport({
  onExport,
  fileName = "workspace-backup.json",
}: BackupExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileSize, setFileSize] = useState<number | null>(null);

  async function handleExport() {
    try {
      setIsExporting(true);
      setError(null);
      setSuccess(false);

      const blob = await onExport?.();
      if (!blob) return;

      setFileSize(blob.size);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка при экспорте";
      setError(message);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-gray-900">Экспорт данных</h3>
        <p className="text-sm text-gray-600 mt-1">
          Скачайте резервную копию всех ваших данных в формате JSON
        </p>
      </div>

      {fileSize && (
        <div className="p-3 bg-blue-50 rounded-lg text-sm">
          Размер файла: {(fileSize / 1024).toFixed(2)} КБ
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✓ Резервная копия скачана успешно
        </div>
      )}

      <Button
        onClick={handleExport}
        loading={isExporting}
        disabled={isExporting}
        variant="primary"
        size="md"
      >
        {isExporting ? "Экспортирование..." : "Скачать резервную копию"}
      </Button>
    </div>
  );
}
