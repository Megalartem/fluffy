/**
 * BackupImport - Component for importing workspace data
 *
 * Features:
 * - File validation
 * - Progress indicator
 * - Conflict resolution UI
 * - Success/error feedback
 */

import React, { useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface BackupImportProps {
  onImport?: (file: File) => Promise<{
    imported: number;
    skipped: number;
    errors: Array<{ item: string; reason: string }>;
  }>;
  acceptedFormats?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ item: string; reason: string }>;
}

export function BackupImport({
  onImport,
  acceptedFormats = ".json",
}: BackupImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes("json")) {
      setError("Только JSON файлы допускаются");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Размер файла не должен превышать 10 МБ");
      return;
    }

    setSelectedFile(file);
    setError(null);
  }

  async function handleImport() {
    if (!selectedFile || !onImport) return;

    try {
      setIsImporting(true);
      setError(null);

      const importResult = await onImport(selectedFile);
      setResult(importResult);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка при импорте";
      setError(message);
    } finally {
      setIsImporting(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-gray-900">Импорт данных</h3>
        <p className="text-sm text-gray-600 mt-1">
          Восстановите данные из резервной копии
        </p>
      </div>

      {!result ? (
        <>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="text-sm text-gray-600">
              <p className="font-medium">Кликните для выбора файла</p>
              <p className="text-xs mt-1">или перетащите файл сюда</p>
            </div>
          </div>

          {selectedFile && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                {selectedFile.name}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {(selectedFile.size / 1024).toFixed(2)} КБ
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleImport}
            loading={isImporting}
            disabled={isImporting || !selectedFile}
            variant="primary"
            size="md"
          >
            {isImporting ? "Импортирование..." : "Импортировать"}
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="font-medium text-green-900 mb-2">
              ✓ Импорт успешно завершен!
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <div>Импортировано записей: {result.imported}</div>
              {result.skipped > 0 && (
                <div>Пропущено: {result.skipped}</div>
              )}
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="font-medium text-yellow-900 mb-2">
                Обнаружены ошибки:
              </div>
              <ul className="text-xs text-yellow-700 space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i}>
                    {err.item}: {err.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={handleReset}
            variant="secondary"
            size="md"
          >
            Импортировать другой файл
          </Button>
        </div>
      )}
    </div>
  );
}
