import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import SongCard from './components/SongCard';
import SongEditorModal from './components/SongEditorModal';
import StageModeView from './components/StageModeView';
import CategoryManagerModal from './components/CategoryManagerModal';
import MobileBottomNav from './components/MobileBottomNav';
import AuthModal from './components/AuthModal';
import FriendsModal from './components/FriendsModal';
import {
  apiGetCategories,
  apiSaveCategory,
  apiDeleteCategory,
  apiGetSongs,
  apiSaveSong,
  apiDeleteSong,
  apiGetMe,
  apiLogout,
} from './services/api';
import { Plus, Music2, Download, Upload, Filter, UserCircle, LogOut } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('musician_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);

  // Stage mode state
  const [isStageModeOpen, setIsStageModeOpen] = useState(false);
  const [stageSongIndex, setStageSongIndex] = useState(0);
  const [stageCustomPlaylist, setStageCustomPlaylist] = useState(null); // for playing friend's songs
  const [stageCustomCategories, setStageCustomCategories] = useState(null);

  // Initial user check
  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('musician_auth_token');
      if (token && currentUser) {
        try {
          const verified = await apiGetMe();
          if (verified) {
            setCurrentUser(verified);
            await loadUserData();
          } else {
            handleLogout();
          }
        } catch (err) {
          console.warn('Session verification failed:', err);
          handleLogout();
        }
      } else {
        setIsAuthModalOpen(true);
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const [cats, sngs] = await Promise.all([apiGetCategories(), apiGetSongs()]);
      setCategories(cats || []);
      setSongs(sngs || []);
      setSelectedCategoryId(null);
    } catch (err) {
      console.error('Failed to load user data from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    await loadUserData();
  };

  const handleLogout = () => {
    apiLogout();
    setCurrentUser(null);
    setSongs([]);
    setCategories([]);
    setIsProfileModalOpen(false);
    setIsAuthModalOpen(true);
  };

  // Filtered songs
  const filteredSongs = useMemo(() => {
    let result = songs;

    if (selectedCategoryId) {
      result = result.filter((s) => s.categoryId === selectedCategoryId);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((s) => {
        return (
          s.title?.toLowerCase().includes(q) ||
          s.artist?.toLowerCase().includes(q) ||
          s.key?.toLowerCase().includes(q) ||
          s.bpm?.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q) ||
          s.content?.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [songs, selectedCategoryId, searchTerm]);

  // Song operations
  const handleSaveSong = async (songData) => {
    try {
      const saved = await apiSaveSong(songData);
      setSongs((prev) => {
        const idx = prev.findIndex((s) => s.id === saved.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
    } catch (err) {
      alert('Şarkı kaydedilirken bir hata oluştu: ' + err.message);
    }
  };

  const handleDeleteSong = async (id) => {
    if (window.confirm('Bu şarkıyı repertuvardan silmek istediğine emin misin?')) {
      try {
        await apiDeleteSong(id);
        setSongs((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        alert('Şarkı silinirken hata oluştu: ' + err.message);
      }
    }
  };

  const handleEditSong = (song) => {
    setEditingSong(song);
    setIsEditorOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingSong(null);
    setIsEditorOpen(true);
  };

  // Category operations
  const handleSaveCategory = async (categoryData) => {
    try {
      const saved = await apiSaveCategory(categoryData);
      setCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [...prev, saved];
      });
    } catch (err) {
      alert('Kategori kaydedilemedi: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await apiDeleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSongs((prev) => prev.filter((s) => s.categoryId !== id));
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
    } catch (err) {
      alert('Kategori silinemedi: ' + err.message);
    }
  };

  // Stage mode triggers
  const handleStartStageFromSong = (song) => {
    const idx = filteredSongs.findIndex((s) => s.id === song.id);
    setStageCustomPlaylist(null);
    setStageCustomCategories(null);
    setStageSongIndex(idx !== -1 ? idx : 0);
    setIsStageModeOpen(true);
  };

  const handleStartStageGeneral = () => {
    if (filteredSongs.length > 0) {
      setStageCustomPlaylist(null);
      setStageCustomCategories(null);
      setStageSongIndex(0);
      setIsStageModeOpen(true);
    }
  };

  const handleLaunchStageWithFriendSong = (song, friendSongs, friendCategories) => {
    const idx = friendSongs.findIndex((s) => s.id === song.id);
    setStageCustomPlaylist(friendSongs);
    setStageCustomCategories(friendCategories);
    setStageSongIndex(idx !== -1 ? idx : 0);
    setIsStageModeOpen(true);
  };

  const handleSongCopied = (copiedSong) => {
    setSongs((prev) => [copiedSong, ...prev]);
  };

  // Export / Backup
  const handleExportBackup = () => {
    const data = {
      user: currentUser ? { username: currentUser.username, name: currentUser.name } : null,
      categories,
      songs,
      exportDate: new Date().toISOString(),
      version: '3.0-cloud',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentUser?.username || 'repertuvar'}-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Backup
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.categories && Array.isArray(data.categories)) {
          for (const cat of data.categories) {
            await apiSaveCategory(cat);
          }
        }
        if (data.songs && Array.isArray(data.songs)) {
          for (const song of data.songs) {
            await apiSaveSong(song);
          }
        }
        await loadUserData();
        alert('Repertuvar başarıyla içe aktarıldı ve sunucuya senkronize edildi!');
      } catch (err) {
        alert('Dosya okunurken bir hata oluştu: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-neutral-400">Sunucuya bağlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] bg-stage-mesh text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenAddModal={handleOpenAddModal}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onOpenFriendsModal={() => setIsFriendsModalOpen(true)}
        onStartStageMode={handleStartStageGeneral}
        songCount={songs.length}
      />

      {/* Category Filter Horizontal Pills */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onQuickAddCategory={() => setIsCategoryModalOpen(true)}
        songs={songs}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-8">
        {/* Info header when searching or filtered */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800/60">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              {selectedCategoryId
                ? `${categories.find((c) => c.id === selectedCategoryId)?.name || 'Kategori'}`
                : `${currentUser?.name ? `${currentUser.name} Repertuvarı` : 'Tüm Şarkılar'}`}
              <span className="text-[11px] font-bold text-neutral-400 font-mono">
                ({filteredSongs.length})
              </span>
            </h2>
            {searchTerm && (
              <span className="text-[11px] text-amber-400/90 font-medium bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 truncate max-w-[150px]">
                "{searchTerm}"
              </span>
            )}
          </div>

          {/* Backup / Export Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] font-semibold text-neutral-400 hover:text-white border border-neutral-800 transition-all"
              title="Repertuvarını yedekle"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Yedek İndir</span>
            </button>

            <label
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[11px] font-semibold text-neutral-400 hover:text-white border border-neutral-800 transition-all cursor-pointer"
              title="Yedek dosyasından şarkı yükle"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Yedek Yükle</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Songs Grid */}
        {filteredSongs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {filteredSongs.map((song) => {
              const cat = categories.find((c) => c.id === song.categoryId);
              return (
                <SongCard
                  key={song.id}
                  song={song}
                  category={cat}
                  onPlay={() => handleStartStageFromSong(song)}
                  onEdit={() => handleEditSong(song)}
                  onDelete={() => handleDeleteSong(song.id)}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-neutral-800 rounded-3xl bg-neutral-950/40">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
              <Music2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wide">
              {searchTerm
                ? 'Şarkı Bulunamadı'
                : 'Bu Kategoride Henüz Şarkın Yok'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs mt-1 mb-5">
              İnternetten aldığın akor ekran görüntüsünü yapıştır veya hemen sözlerini yazarak kendi repertuvarına ekle.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Hemen Şarkı Ekle</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        onOpenAddModal={handleOpenAddModal}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onOpenFriendsModal={() => setIsFriendsModalOpen(true)}
        onStartStageMode={handleStartStageGeneral}
        onResetCategoryFilter={() => setSelectedCategoryId(null)}
        selectedCategory={selectedCategoryId}
        songCount={songs.length}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      <SongEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveSong}
        categories={categories}
        initialSong={editingSong}
        activeCategoryId={selectedCategoryId}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        songs={songs}
      />

      {/* Mobile User Profile & Switcher Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm sm:hidden">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <UserCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white">
                {currentUser?.name || 'Müzisyen'}
              </h3>
              <p className="text-xs text-amber-400 font-semibold mt-0.5">
                @{currentUser?.username} • {currentUser?.instrument}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Kayıtlı Şarkı: <span className="font-bold text-white">{songs.length}</span>
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Repertuvarı Yedekle (İndir)</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-red-950/60 text-red-300 border border-red-800/40 font-black text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap / Hesap Değiştir</span>
              </button>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="text-xs text-neutral-400 hover:text-white pt-1 block mx-auto"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      <FriendsModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        onLaunchStageWithFriendSong={handleLaunchStageWithFriendSong}
        onSongCopied={handleSongCopied}
        currentUserId={currentUser?.id}
      />

      {/* Stage Live Mode View */}
      {isStageModeOpen && (
        <StageModeView
          songs={stageCustomPlaylist || filteredSongs}
          currentSongIndex={stageSongIndex}
          onSelectSongIndex={setStageSongIndex}
          onClose={() => {
            setIsStageModeOpen(false);
            setStageCustomPlaylist(null);
            setStageCustomCategories(null);
          }}
          categories={stageCustomCategories || categories}
        />
      )}
    </div>
  );
}
