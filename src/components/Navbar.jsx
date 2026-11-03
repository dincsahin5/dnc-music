import React, { useState } from 'react';
import { Plus, Search, Layers, Play, X, LogOut, Users, Sparkles, Disc } from 'lucide-react';

export default function Navbar({
  currentUser,
  onLogout,
  searchTerm,
  setSearchTerm,
  onOpenAddModal,
  onOpenCategoryModal,
  onOpenFriendsModal,
  onStartStageMode,
  songCount,
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#07070a]/85 backdrop-blur-xl px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand: DNC MUSIC with Equalizer */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-300" />
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[#1b1712] via-[#0d0e12] to-[#1a140b] border border-amber-500/40 flex items-center justify-center text-amber-400 font-black shadow-inner">
              <Disc className="w-5 h-5 text-amber-400 animate-spin-slow" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tighter bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                  DNC
                </span>
                <span className="text-xs sm:text-sm font-extrabold tracking-[0.25em] bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent uppercase">
                  MUSIC
                </span>
              </div>

              {/* Animated mini equalizer bars */}
              <div className="hidden sm:flex items-end gap-0.5 h-3.5 px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                <span className="w-0.5 bg-amber-400 rounded-full eq-bar-1" />
                <span className="w-0.5 bg-amber-400 rounded-full eq-bar-2" />
                <span className="w-0.5 bg-amber-400 rounded-full eq-bar-3" />
                <span className="w-0.5 bg-amber-400 rounded-full eq-bar-4" />
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 font-mono">
                {songCount} Parça
              </span>
            </div>

            {currentUser && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="text-white font-bold truncate">{currentUser.name}</span>
                <span className="text-neutral-500 text-[10px] hidden md:inline">• {currentUser.instrument}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cinematic Search Bar */}
        <div className="hidden md:block relative flex-1 max-w-xs lg:max-w-md mx-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Şarkı, türkü, makam veya akor ara..."
            className="w-full bg-[#0c0d12]/90 border border-white/10 rounded-xl pl-10 pr-8 py-2 text-xs font-medium text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 shadow-inner transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-neutral-300 border border-white/10"
            title="Arama"
          >
            {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Friends Repertoire */}
          <button
            onClick={onOpenFriendsModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.12] text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Müzisyen Arkadaşlarının Repertuvarı"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Arkadaşlarım</span>
          </button>

          {/* Categories Button */}
          <button
            onClick={onOpenCategoryModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/10 text-xs font-semibold transition-all active:scale-95"
            title="Kategorileri Düzenle"
          >
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            <span>Kategoriler</span>
          </button>

          {/* Stage Mode Button (Glowing Neon) */}
          <button
            onClick={onStartStageMode}
            disabled={songCount === 0}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all disabled:opacity-40"
            title="Canlı Sahne Modu"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Sahne</span>
          </button>

          {/* Add Song Button */}
          <button
            onClick={onOpenAddModal}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black text-xs font-black shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Şarkı Ekle</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/[0.04] hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Çıkış Yap / Kullanıcı Değiştir"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search */}
      {mobileSearchOpen && (
        <div className="md:hidden mt-2.5 pt-2.5 border-t border-white/10 animate-in slide-in-from-top-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Şarkı, türkü, makam ara..."
              className="w-full bg-[#0d0e12] border border-amber-500/40 rounded-xl pl-9 pr-8 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
