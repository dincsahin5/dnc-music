import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Tag } from 'lucide-react';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export default function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
  onDeleteCategory,
  songs,
}) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onSaveCategory({
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: newCatColor,
    });

    setNewCatName('');
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color || PRESET_COLORS[0]);
  };

  const handleUpdate = (catId) => {
    if (!editName.trim()) return;

    onSaveCategory({
      id: catId,
      name: editName.trim(),
      color: editColor,
    });

    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <Tag className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black uppercase tracking-wide text-white">
              Kategorileri Yönet
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Add New Category Form */}
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Yeni Kategori Oluştur
            </h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Örn: Akustik Bar, 2000ler Türkçe Pop..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2 text-xs font-semibold text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />

              <div className="flex items-center gap-1.5 justify-between px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-xl">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      newCatColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!newCatName.trim()}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                <span>Ekle</span>
              </button>
            </div>
          </form>

          {/* List Existing Categories */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Mevcut Kategoriler ({categories.length})
            </h3>

            {categories.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-2">
                Henüz hiç kategori oluşturulmadı.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const songCount = songs.filter((s) => s.categoryId === cat.id).length;
                  const isEditing = editingId === cat.id;

                  if (isEditing) {
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-amber-500/50"
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1 text-xs text-white"
                        />
                        <div className="flex items-center gap-1">
                          {PRESET_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditColor(c)}
                              style={{ backgroundColor: c }}
                              className={`w-4 h-4 rounded-full ${
                                editColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-50'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                          title="Kaydet"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                          title="İptal"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow"
                          style={{ backgroundColor: cat.color || '#f59e0b' }}
                        />
                        <span className="text-xs font-bold text-white tracking-wide">
                          {cat.name}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800">
                          {songCount} şarkı
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `"${cat.name}" kategorisini silmek istediğine emin misin? (İçindeki şarkılar silinir)`
                              )
                            ) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-all"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
