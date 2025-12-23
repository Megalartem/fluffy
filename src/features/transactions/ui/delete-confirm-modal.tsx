/**
 * DeleteConfirmModal - Confirmation dialog for transaction deletion
 */

import { Modal } from "@/shared/ui/modal";

interface DeleteConfirmModalProps {
  open: boolean;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  open,
  saving,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <Modal open={open} title="Удалить запись?" onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-gray-600">
          Запись будет перемещена в архив. Это действие можно будет отменить позже.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-xl border px-4 py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {saving ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
