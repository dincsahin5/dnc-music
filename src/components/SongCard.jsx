import React from 'react';
import { Image as ImageIcon, FileText, Play, Edit3, Trash2, KeyRound, Gauge, Radio } from 'lucide-react';

export default function SongCard({ song, category, onPlay, onEdit, onDelete }) {
  const hasImage = Boolean(song.imageData);

  return (
    <div
      onClick={onPlay}
      className="group relative flex flex-col justify-between bg-gradient-to-b from-[#111218]/90 to-[#0a0a0e]/95 backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-xl hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] transition-all duration-300 cursor-pointer overflow-hidden touch-manipulation"
    >
      {/* Subtle background ambient glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />

      {/* Top Header: Category & Musician Key/Capo/BPM Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {category ? (
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-lg text-white uppercase tracking-wider shadow-sm truncate max-w-[140px]"
              style={{
                backgroundColor: category.color || '#f59e0b',
                boxShadow: `0 0 12px ${category.color || '#f59e0b'}40`,
              }}
            >
              {category.name}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/5 text-neutral-400 uppercase">
              Genel
            </span>
          )}

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {song.key && (
              <span className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-mono">
                <KeyRound className="w-3 h-3 text-amber-400" />
                {song.key}
              </span>
            )}
            {song.capo && song.capo !== 'Yok' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/40 font-mono">
                Capo {song.capo}
              </span>
            )}
            {song.bpm && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/40 font-mono">
                <Gauge className="w-3 h-3 text-blue-400" />
                {song.bpm}
              </span>
            )}
          </div>
        </div>

        {/* BÜYÜK VE BELİRGİN SİNEMATİK BAŞLIK */}
        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
          {song.title}
        </h2>

        {song.artist && (
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5 mb-2.5">
            {song.artist}
          </p>
        )}

        {/* Preview Frame */}
        <div className="mt-2.5 rounded-xl bg-[#060609]/90 border border-white/[0.06] p-3 h-32 flex flex-col justify-center relative overflow-hidden group-hover:border-white/20 transition-all shadow-inner">
          {hasImage ? (
            <div className="w-full h-full relative flex items-center justify-center">
              <img
                src={song.imageData}
                alt={song.title}
                className="w-full h-full object-contain filter brightness-90 contrast-105 group-hover:brightness-100 transition-all"
              />
              <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-[#09090d]/90 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-md border border-amber-500/30 backdrop-blur-sm">
                <ImageIcon className="w-3 h-3" />
                Görsel
              </div>
            </div>
          ) : song.content ? (
            <div className="w-full h-full overflow-hidden text-[11px] font-mono text-neutral-400 leading-relaxed select-none">
              <pre className="whitespace-pre-wrap font-mono line-clamp-5 text-neutral-300">
                {song.content}
              </pre>
              <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-[#09090d]/90 text-neutral-400 text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-sm">
                <FileText className="w-3 h-3" />
                Metin
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-neutral-500 italic">
              Henüz akor veya söz eklenmemiş
            </div>
          )}
        </div>

        {/* Rehearsal Notes */}
        {song.notes && (
          <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-amber-500/[0.04] border border-amber-500/20 text-[11px] text-amber-300/90 line-clamp-1 italic">
            💡 {song.notes}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Sahne Modu</span>
        </button>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
            title="Düzenle"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
