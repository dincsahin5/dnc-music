import React from 'react';
import { Home, Layers, Plus, Play, Users } from 'lucide-react';

export default function MobileBottomNav({
  onOpenAddModal,
  onOpenCategoryModal,
  onOpenFriendsModal,
  onStartStageMode,
  onResetCategoryFilter,
  selectedCategory,
  songCount,
}) {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07070a]/92 backdrop-blur-2xl border-t border-white/[0.08] px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* All Songs / Home */}
        <button
          onClick={onResetCategoryFilter}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            selectedCategory === null ? 'text-amber-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Repertuvar</span>
        </button>

        {/* Friends Repertoire */}
        <button
          onClick={onOpenFriendsModal}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-neutral-400 active:text-amber-400 transition-all"
        >
          <Users className="w-5 h-5 text-amber-500/80" />
          <span className="text-[10px] tracking-tight">Arkadaşlar</span>
        </button>

        {/* Center Big Add Button (Cinematic Gold Glow) */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center -mt-6 w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] border-2 border-[#07070a] active:scale-90 transition-transform"
          title="Yeni Şarkı Ekle"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>

        {/* Categories */}
        <button
          onClick={onOpenCategoryModal}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-neutral-400 active:text-amber-400 transition-all"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Kategori</span>
        </button>

        {/* Stage Mode (Neon Green Glow) */}
        <button
          onClick={onStartStageMode}
          disabled={songCount === 0}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-emerald-400 active:text-emerald-300 disabled:opacity-40 transition-all"
        >
          <Play className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-black uppercase tracking-wider">Sahne</span>
        </button>
      </div>
    </div>
  );
}
