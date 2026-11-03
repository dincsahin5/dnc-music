import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  List,
  KeyRound,
  Gauge,
  Maximize2,
  Minimize2,
  Sun,
  Disc,
} from 'lucide-react';

export default function StageModeView({
  songs,
  currentSongIndex,
  onSelectSongIndex,
  onClose,
  categories,
}) {
  const [fontSize, setFontSize] = useState(22);
  const [imageScale, setImageScale] = useState(1);
  const [showSongList, setShowSongList] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWakeLocked, setIsWakeLocked] = useState(false);
  const wakeLockRef = useRef(null);

  const currentSong = songs[currentSongIndex];
  const category = categories.find((c) => c.id === currentSong?.categoryId);

  // Keep phone screen awake during stage performance
  useEffect(() => {
    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setIsWakeLocked(true);
          wakeLockRef.current.addEventListener('release', () => {
            setIsWakeLocked(false);
          });
        } catch (err) {
          console.warn('WakeLock unavailable:', err);
        }
      }
    }

    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  // Keyboard navigation on stage
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSongIndex, songs.length]);

  const goToNext = () => {
    if (currentSongIndex < songs.length - 1) {
      onSelectSongIndex(currentSongIndex + 1);
      setImageScale(1);
    }
  };

  const goToPrev = () => {
    if (currentSongIndex > 0) {
      onSelectSongIndex(currentSongIndex - 1);
      setImageScale(1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col select-none overflow-hidden font-sans">
      {/* Top Console Bar */}
      <div className="shrink-0 bg-[#060709] border-b border-white/[0.08] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-2xl">
        {/* Left: Quick Nav & Index */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={goToPrev}
            disabled={currentSongIndex === 0}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] active:bg-white/[0.1] disabled:opacity-20 text-xs font-bold transition-all border border-white/10"
            title="Önceki Şarkı"
          >
            <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4 text-amber-400" />
          </button>

          <span className="text-[11px] sm:text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            {currentSongIndex + 1}/{songs.length}
          </span>

          <button
            onClick={goToNext}
            disabled={currentSongIndex === songs.length - 1}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] active:bg-white/[0.1] disabled:opacity-20 text-xs font-bold transition-all border border-white/10"
            title="Sonraki Şarkı"
          >
            <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4 text-amber-400" />
          </button>
        </div>

        {/* Center: DNC MUSIC Stage Song Header */}
        <div className="text-center flex-1 min-w-0 px-2">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-black tracking-[0.25em] text-amber-500 uppercase">
              DNC STAGE CONSOLE
            </span>
          </div>
          <h1 className="text-base sm:text-2xl font-black text-white uppercase tracking-wide truncate drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {currentSong.title}
          </h1>
          {currentSong.artist && (
            <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-widest truncate">
              {currentSong.artist}
            </p>
          )}
        </div>

        {/* Right: Stage Controls & Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Repertoire Songlist Drawer */}
          <button
            onClick={() => setShowSongList(!showSongList)}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              showSongList
                ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-white/[0.05] text-neutral-300 border-white/10'
            }`}
            title="Şarkı Listesi"
          >
            <List className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Akış</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/[0.05] active:bg-white/10 text-neutral-300 border border-white/10 hidden xs:flex"
            title="Tam Ekran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-950/40 active:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-bold transition-all"
            title="Sahnenden Çık (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hardware Illuminated Stage Ribbon */}
      <div className="shrink-0 bg-[#090a0e] border-b border-white/[0.06] px-3 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 flex-nowrap shrink-0">
          {category && (
            <span
              className="text-[10px] font-black px-2.5 py-0.5 rounded-md text-white uppercase whitespace-nowrap shadow-sm"
              style={{
                backgroundColor: category.color || '#f59e0b',
                boxShadow: `0 0 10px ${category.color || '#f59e0b'}50`,
              }}
            >
              {category.name}
            </span>
          )}

          {currentSong.key && (
            <span className="flex items-center gap-1 font-mono font-black px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              TON: {currentSong.key}
            </span>
          )}

          {currentSong.capo && currentSong.capo !== 'Yok' && (
            <span className="font-mono font-bold px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs whitespace-nowrap">
              CAPO {currentSong.capo}
            </span>
          )}

          {currentSong.bpm && (
            <span className="flex items-center gap-1 font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs whitespace-nowrap">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              {currentSong.bpm} BPM
            </span>
          )}

          {isWakeLocked && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap">
              <Sun className="w-3 h-3 text-emerald-400 animate-pulse" /> Ekran Uyanık
            </span>
          )}
        </div>

        {/* Zoom & Font Controls */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {currentSong.imageData ? (
            <div className="flex items-center gap-1 bg-[#101117] px-2 py-1 rounded-xl border border-white/10">
              <button
                onClick={() => setImageScale((s) => Math.max(0.6, s - 0.2))}
                className="p-1 text-neutral-400 hover:text-amber-400"
                title="Küçült"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-neutral-300 font-bold px-1">
                %{Math.round(imageScale * 100)}
              </span>
              <button
                onClick={() => setImageScale((s) => Math.min(2.5, s + 0.2))}
                className="p-1 text-neutral-400 hover:text-amber-400"
                title="Büyüt"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setImageScale(1)}
                className="p-1 text-neutral-400 hover:text-amber-400"
                title="Sıfırla"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#101117] px-2 py-1 rounded-xl border border-white/10">
              <button
                onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                className="px-2 py-0.5 font-bold text-neutral-400 hover:text-amber-400 text-xs"
              >
                A-
              </button>
              <span className="font-mono text-[10px] text-neutral-300 font-bold px-1">
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize((s) => Math.min(36, s + 2))}
                className="px-2 py-0.5 font-bold text-neutral-400 hover:text-amber-400 text-xs"
              >
                A+
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prova / Sahne Notları */}
      {currentSong.notes && (
        <div className="bg-amber-950/30 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-300 flex items-center gap-2">
          <span className="font-black text-amber-400 shrink-0">💡 NOT:</span>
          <span className="truncate italic font-medium">{currentSong.notes}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 sm:p-8 flex justify-center items-start">
          {currentSong.imageData ? (
            <div className="w-full flex justify-center py-2">
              <img
                src={currentSong.imageData}
                alt={currentSong.title}
                style={{ transform: `scale(${imageScale})`, transformOrigin: 'top center' }}
                className="max-w-full h-auto rounded-xl shadow-2xl transition-transform duration-100 border border-white/10"
              />
            </div>
          ) : currentSong.content ? (
            <div className="w-full max-w-4xl bg-[#08080c]/90 p-5 sm:p-10 rounded-2xl border border-white/10 shadow-2xl">
              <pre
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
                className="whitespace-pre-wrap font-mono text-neutral-100 font-bold tracking-wide select-text"
              >
                {currentSong.content}
              </pre>
            </div>
          ) : (
            <div className="text-center text-neutral-500 mt-20">
              <p className="text-base font-bold">Bu parça için henüz içerik eklenmemiş.</p>
            </div>
          )}
        </div>

        {/* Floating Mobile Next / Prev Buttons */}
        <div className="sm:hidden fixed bottom-5 left-4 right-4 flex items-center justify-between pointer-events-none z-40">
          <button
            onClick={goToPrev}
            disabled={currentSongIndex === 0}
            className="pointer-events-auto p-4 rounded-full bg-[#12131a]/95 text-amber-400 border border-amber-500/40 shadow-[0_0_20px_rgba(0,0,0,0.8)] active:scale-90 transition-all disabled:opacity-0"
            title="Önceki Şarkı"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>

          <button
            onClick={goToNext}
            disabled={currentSongIndex === songs.length - 1}
            className="pointer-events-auto p-4 rounded-full bg-[#12131a]/95 text-amber-400 border border-amber-500/40 shadow-[0_0_20px_rgba(0,0,0,0.8)] active:scale-90 transition-all disabled:opacity-0"
            title="Sonraki Şarkı"
          >
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Fast Song Drawer */}
        {showSongList && (
          <div className="absolute right-0 top-0 bottom-0 w-72 sm:w-88 bg-[#090a0f]/98 border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-150 backdrop-blur-xl">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <h3 className="font-black text-xs uppercase tracking-wider text-amber-400">
                  Sahne Akışı ({songs.length})
                </h3>
              </div>
              <button
                onClick={() => setShowSongList(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {songs.map((song, idx) => {
                const isSelected = idx === currentSongIndex;
                const cat = categories.find((c) => c.id === song.categoryId);

                return (
                  <button
                    key={song.id}
                    onClick={() => {
                      onSelectSongIndex(idx);
                      setImageScale(1);
                      setShowSongList(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-2 border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-[#101117] active:bg-[#181922] border-white/[0.05] text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs font-bold text-neutral-500 w-4">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-black uppercase truncate">
                          {song.title}
                        </div>
                        {cat && (
                          <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {cat.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {song.key && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        {song.key}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
