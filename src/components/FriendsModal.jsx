import React, { useState, useEffect } from 'react';
import { X, Users, User, Music, ChevronRight, Copy, Check, Play, Search, ArrowLeft } from 'lucide-react';
import { apiGetMusicians, apiGetFriendRepertoire, apiCopySong } from '../services/api';

export default function FriendsModal({ isOpen, onClose, onLaunchStageWithFriendSong, onSongCopied, currentUserId }) {
  const [musicians, setMusicians] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendData, setFriendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copySuccessId, setCopySuccessId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadMusicians();
      setSelectedFriend(null);
      setFriendData(null);
      setSelectedCatId(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  const loadMusicians = async () => {
    setLoading(true);
    try {
      const list = await apiGetMusicians();
      setMusicians(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMusician = async (musician) => {
    setSelectedFriend(musician);
    setLoading(true);
    try {
      const data = await apiGetFriendRepertoire(musician.id);
      setFriendData(data);
      setSelectedCatId(null);
    } catch (err) {
      alert('Repertuvar yüklenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (songId) => {
    try {
      const copied = await apiCopySong(songId);
      setCopySuccessId(songId);
      setTimeout(() => setCopySuccessId(null), 2500);
      if (onSongCopied) onSongCopied(copied);
    } catch (err) {
      alert('Şarkı kopyalanamadı: ' + err.message);
    }
  };

  if (!isOpen) return null;

  // Filter friend's songs
  const filteredSongs = friendData?.songs?.filter((s) => {
    const matchesCat = !selectedCatId || s.categoryId === selectedCatId;
    const matchesSearch =
      !searchTerm.trim() ||
      s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            {selectedFriend ? (
              <button
                onClick={() => {
                  setSelectedFriend(null);
                  setFriendData(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors mr-1"
                title="Geri Dön"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
                {selectedFriend ? `${selectedFriend.name} Repertuvarı` : 'Müzisyen Arkadaşlarım'}
              </h2>
              <p className="text-[10px] text-neutral-400">
                {selectedFriend
                  ? `@${selectedFriend.username} • ${selectedFriend.instrument}`
                  : 'Arkadaşının hazırladığı şarkıları gör, sahneye çık veya kendi listene kopyala'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && (
            <div className="py-12 text-center text-xs text-neutral-400 font-bold flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Yükleniyor...</span>
            </div>
          )}

          {/* VIEW 1: LIST OF MUSICIANS */}
          {!loading && !selectedFriend && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Kayıtlı Müzisyenler ({musicians.length})
              </p>

              {musicians.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs italic">
                  Henüz başka müzisyen bulunamadı.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {musicians.map((m) => {
                    const isSelf = m.id === currentUserId;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMusician(m)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelf
                            ? 'bg-neutral-950/40 border-neutral-800/80 hover:border-neutral-700'
                            : 'bg-neutral-950/80 hover:bg-neutral-950 border-neutral-800 hover:border-amber-500/50 group'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-neutral-800 group-hover:bg-amber-500/20 text-neutral-300 group-hover:text-amber-400 flex items-center justify-center shrink-0 transition-colors font-black">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black text-white group-hover:text-amber-400 uppercase truncate transition-colors flex items-center gap-1.5">
                              {m.name}
                              {isSelf && (
                                <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded font-normal lowercase">
                                  (sen)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {m.instrument || 'Müzisyen'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold text-neutral-400 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800">
                            {m.songCount} Parça
                          </span>
                          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: SELECTED FRIEND'S REPERTOIRE */}
          {!loading && selectedFriend && friendData && (
            <div className="space-y-4">
              {/* Filter & Search Bar in Friend's Songs */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`${selectedFriend.name} şarkılarında ara...`}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    onClick={() => setSelectedCatId(null)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedCatId === null
                        ? 'bg-amber-500 text-black'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Tümü ({friendData.songs.length})
                  </button>
                  {friendData.categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCatId(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                        selectedCatId === c.id
                          ? 'bg-amber-500 text-black'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Friend's Song List */}
              {filteredSongs.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs italic">
                  Bu aramaya uygun şarkı bulunamadı.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSongs.map((song) => {
                    const cat = friendData.categories.find((c) => c.id === song.categoryId);
                    const isCopied = copySuccessId === song.id;

                    return (
                      <div
                        key={song.id}
                        className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {cat && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase"
                                style={{ backgroundColor: cat.color || '#f59e0b' }}
                              >
                                {cat.name}
                              </span>
                            )}
                            {song.key && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                Ton: {song.key}
                              </span>
                            )}
                            {song.bpm && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                                {song.bpm} BPM
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-black text-white uppercase tracking-wide truncate">
                            {song.title}
                          </h4>
                          {song.artist && (
                            <p className="text-[11px] text-neutral-400 uppercase mt-0.5 truncate">
                              {song.artist}
                            </p>
                          )}
                        </div>

                        {/* Actions: Stage & Copy */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => {
                              onLaunchStageWithFriendSong(song, friendData.songs, friendData.categories);
                              onClose();
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all active:scale-95"
                            title="Bu şarkıyla sahne görünümünü aç"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Sahne</span>
                          </button>

                          <button
                            onClick={() => handleCopy(song.id)}
                            disabled={isCopied}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                              isCopied
                                ? 'bg-emerald-500 text-black'
                                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                            }`}
                            title="Bu şarkıyı kendi repertuvarına kopyala"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Kopyalandı!' : 'Listeme Al'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
