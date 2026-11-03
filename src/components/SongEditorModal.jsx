import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Clipboard, Image as ImageIcon, FileText, Check, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export default function SongEditorModal({
  isOpen,
  onClose,
  onSave,
  categories,
  initialSong = null,
  activeCategoryId = null,
}) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [contentMode, setContentMode] = useState('image'); // 'image' or 'text'
  const [content, setContent] = useState('');
  const [imageData, setImageData] = useState(null);
  const [key, setKey] = useState('');
  const [capo, setCapo] = useState('Yok');
  const [bpm, setBpm] = useState('');
  const [notes, setNotes] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialSong) {
      setTitle(initialSong.title || '');
      setArtist(initialSong.artist || '');
      setCategoryId(initialSong.categoryId || (categories[0]?.id || ''));
      setContent(initialSong.content || '');
      setImageData(initialSong.imageData || null);
      setKey(initialSong.key || '');
      setCapo(initialSong.capo || 'Yok');
      setBpm(initialSong.bpm || '');
      setNotes(initialSong.notes || '');
      setContentMode(initialSong.imageData ? 'image' : 'text');
    } else {
      setTitle('');
      setArtist('');
      setCategoryId(activeCategoryId || categories[0]?.id || '');
      setContent('');
      setImageData(null);
      setKey('');
      setCapo('Yok');
      setBpm('');
      setNotes('');
      setContentMode('image');
    }
    setPasteSuccess(false);
  }, [initialSong, isOpen, activeCategoryId, categories]);

  // Global paste handler when modal is active
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            setImageData(event.target.result);
            setContentMode('image');
            setPasteSuccess(true);
            setTimeout(() => setPasteSuccess(false), 3000);
          };
          reader.readAsDataURL(blob);
          e.preventDefault();
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageData(event.target.result);
        setContentMode('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageData(event.target.result);
        setContentMode('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialSong?.id || `song-${Date.now()}`,
      title: title.trim().toUpperCase(),
      artist: artist.trim(),
      categoryId: categoryId || categories[0]?.id || 'default',
      type: imageData ? 'image' : 'text',
      content: content.trim(),
      imageData: imageData || null,
      key: key.trim(),
      capo: capo.trim(),
      bpm: bpm.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#13141c] via-[#0d0e14] to-[#07070a] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#090a0e]/80">
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse" />
              {initialSong ? 'Şarkıyı Düzenle' : 'DNC MUSIC • Repertuvara Şarkı Ekle'}
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              İster ekran görüntüsü yapıştırın (CTRL+V), ister söz ve akorları yazın
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title & Artist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                Şarkı Adı <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: ANKARA'NIN BAĞLARI VEYA ŞEMMAME"
                className="w-full bg-[#07070a] border border-white/10 rounded-xl px-4 py-2.5 text-base font-black text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 uppercase tracking-wide"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Sanatçı / Yöre
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Örn: Musa Eroğlu"
                className="w-full bg-[#07070a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Category & Stage Badges (Key, Capo, BPM) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#08080c] p-4 rounded-2xl border border-white/[0.06]">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-neutral-300 uppercase">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#101117] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300 uppercase">Ton (Key)</label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Örn: Am, Dm"
                className="w-full bg-[#101117] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-amber-400 placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300 uppercase">Capo</label>
              <input
                type="text"
                value={capo}
                onChange={(e) => setCapo(e.target.value)}
                placeholder="Yok veya 2"
                className="w-full bg-[#101117] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-purple-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300 uppercase">BPM</label>
              <input
                type="text"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="Örn: 128"
                className="w-full bg-[#101117] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-blue-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Mode Switch Tabs: Screenshot vs Text */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setContentMode('image')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    contentMode === 'image'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Ekran Görüntüsü / Görsel
                  {imageData && <Check className="w-3.5 h-3.5 stroke-[3] ml-0.5 text-emerald-950" />}
                </button>

                <button
                  type="button"
                  onClick={() => setContentMode('text')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    contentMode === 'text'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Akor & Söz Metni
                  {content.length > 0 && <Check className="w-3.5 h-3.5 stroke-[3] ml-0.5 text-emerald-950" />}
                </button>
              </div>

              {pasteSuccess && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Ekran görüntüsü yapıştırıldı!
                </span>
              )}
            </div>

            {/* SCREENSHOT / IMAGE MODE */}
            {contentMode === 'image' && (
              <div className="space-y-3">
                {imageData ? (
                  <div className="relative rounded-xl border border-neutral-700 bg-neutral-950 p-3 max-h-80 overflow-y-auto flex flex-col items-center">
                    <img
                      src={imageData}
                      alt="Ekran Görüntüsü Önizleme"
                      className="max-h-72 object-contain rounded-lg shadow-md"
                    />
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 transition-all"
                      >
                        Farklı Görsel Seç
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageData(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 transition-all"
                      >
                        Görseli Kaldır
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-700 hover:border-amber-500/70 rounded-2xl p-8 text-center bg-neutral-950/50 hover:bg-neutral-950/90 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-all">
                      <Clipboard className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        Siteden aldığın ekran görüntüsünü doğrudan buraya <span className="underline decoration-amber-500 underline-offset-4">CTRL + V</span> ile yapıştır!
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1">
                        Veya bir görsel dosyasını buraya sürükle bırak ya da tıklayıp bilgisayarından seç
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                      PNG, JPG, WEBP desteklenir (İnternetsiz de kalıcıdır)
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}

            {/* TEXT MODE */}
            {contentMode === 'text' && (
              <div className="space-y-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`[Giriş]
Am   Dm   E   Am

[Sözler]
Am             Dm
Şarkının sözleri ve akorlarını buraya yapıştırın...`}
                  rows={10}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-4 text-sm font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed"
                />
                <p className="text-[11px] text-neutral-400 italic">
                  İpucu: Sabit genişlikli font (monospace) kullanıldığı için akorların sözlerin üstündeki hizası bozulmaz.
                </p>
              </div>
            )}
          </div>

          {/* Rehearsal / Stage Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Prova & Sahne Notları</span>
              <span className="text-[10px] text-neutral-500 font-normal">(İsteğe bağlı)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Soloda distortion açılacak, nakaratta geri vokal 2. ses girer."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              {initialSong ? 'Güncellemeyi Kaydet' : 'Repertuvara Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
