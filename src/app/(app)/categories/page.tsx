"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/features/categories/model/types";
import { Modal } from "@/shared/ui/modal";
import { useCategories } from "@/features/categories/hooks/use-categories";

export default function CategoriesPage() {
  const { items, loading, load, create, rename, remove } = useCategories();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addCategory() {
    if (!name.trim()) return;
    await create(name);
    setCreateOpen(false);
    setName("");
  }

  async function renameCategory(cat: Category) {
    const newName = prompt("Новое название категории:", cat.name);
    if (!newName) return;
    await rename(cat.id, newName);
  }

  async function deleteCategory(cat: Category) {
    const ok = confirm(`Удалить категорию "${cat.name}"?`);
    if (!ok) return;
    await remove(cat.id);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Категории</h1>
        <button className="rounded-2xl bg-black text-white px-4 py-2 font-semibold" onClick={() => setCreateOpen(true)}>
          Добавить
        </button>
      </div>

      {loading ? <div>Loading…</div> : null}

      {!loading && items.length === 0 ? (
        <div className="rounded-2xl border p-6">
          <div className="font-semibold">Пока пусто</div>
          <div className="opacity-70 mt-1">Добавь первую категорию — или используй дефолтные.</div>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="space-y-2">
          {items.map((c) => (
            <div key={c.id} className="rounded-2xl border p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm opacity-70">{c.isDefault ? "default" : "custom"}</div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-xl border px-3 py-2" onClick={() => renameCategory(c)} type="button">
                  Редактировать
                </button>
                <button className="rounded-xl border px-3 py-2" onClick={() => deleteCategory(c)} type="button">
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Modal open={createOpen} title="Новая категория" onClose={() => setCreateOpen(false)}>
        <div className="space-y-3">
          <label className="text-sm opacity-70">Название</label>
          <input
            className="w-full rounded-xl border px-3 py-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="например: Такси"
          />
          <button className="w-full rounded-2xl bg-black text-white py-3 font-semibold" onClick={addCategory}>
            Создать
          </button>
        </div>
      </Modal>
    </div>
  );
}
