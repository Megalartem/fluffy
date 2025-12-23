/**
 * TransactionFormActions - Save and Delete buttons
 */

interface TransactionFormActionsProps {
  mode: "create" | "edit";
  saving: boolean;
  onSave: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function TransactionFormActions({
  mode,
  saving,
  onSave,
  onDelete,
  onClose,
}: TransactionFormActionsProps) {
  return (
    <div className="flex gap-2">
      {mode === "edit" && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={saving}
          className="flex-1 rounded-xl border border-red-500 bg-white px-4 py-3 font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
        >
          Удалить
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        className="flex-1 rounded-xl border px-4 py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
      >
        Отмена
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex-1 rounded-xl bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? "Сохранение..." : "Сохранить"}
      </button>
    </div>
  );
}
