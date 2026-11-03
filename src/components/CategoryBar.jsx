import React from 'react';
import { Plus } from 'lucide-react';

export default function CategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
  onQuickAddCategory,
  songs
}) {
  const getCategoryCount = (catId) => {
    if (!catId) return songs.length;
    return songs.filter((s) => s.categoryId === catId).length;
  };

  return (
    <div className="w-full py-3 border-b border-white/[0.06] bg-[#08080c]/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 flex-nowrap">
          {/* All Songs Button */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] font-black'
                : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] border border-white/[0.08]'
            }`}
          >
            <span>Tüm Repertuvar</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold ${
                selectedCategory === null ? 'bg-black/20 text-neutral-950' : 'bg-white/10 text-neutral-400'
              }`}
            >
              {songs.length}
            </span>
          </button>

          {/* User Categories (Halay, Oyun Havası, Türkü, Uzun Hava) */}
          {categories.map((cat) => {
            const count = getCategoryCount(cat.id);
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'border-transparent text-white shadow-lg'
                    : 'bg-[#0e0f14]/80 text-neutral-300 hover:bg-[#161720] border-white/[0.08] hover:border-white/20'
                }`}
                style={{
                  backgroundColor: isSelected ? cat.color || '#f59e0b' : undefined,
                  boxShadow: isSelected ? `0 0 20px ${cat.color || '#f59e0b'}50` : undefined,
                }}
              >
                {!isSelected && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px]"
                    style={{
                      backgroundColor: cat.color || '#f59e0b',
                      color: cat.color || '#f59e0b',
                    }}
                  />
                )}
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold ${
                    isSelected ? 'bg-black/25 text-white' : 'bg-white/[0.06] text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Quick Add Category */}
          <button
            onClick={onQuickAddCategory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.02] hover:bg-white/[0.06] text-neutral-400 hover:text-amber-400 border border-dashed border-white/15 hover:border-amber-500/50 transition-all whitespace-nowrap"
            title="Kategori Ekle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kategori</span>
          </button>
        </div>
      </div>
    </div>
  );
}
