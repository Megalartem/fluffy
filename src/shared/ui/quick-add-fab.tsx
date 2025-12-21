"use client";

export function QuickAddFAB({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Добавить транзакцию"
      title="Добавить транзакцию"
      onClick={onClick}
      className="
        fixed z-40
        bottom-6 right-6
        rounded-full
        w-14 h-14
        bg-black text-white
        text-2xl font-semibold
        shadow-lg
        hover:scale-105 active:scale-95
        transition
      "
    >
      +
    </button>
  );
}
