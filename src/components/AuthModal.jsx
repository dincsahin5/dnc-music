import React, { useState } from 'react';
import { Lock, User, Disc, Sparkles, ArrowRight } from 'lucide-react';
import { apiLogin, apiRegister } from '../services/api';

export default function AuthModal({ isOpen, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [instrument, setInstrument] = useState('Bağlama / Solist');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!username.trim() || !password.trim() || !name.trim()) {
          throw new Error('Lütfen tüm zorunlu alanları doldurun.');
        }
        const data = await apiRegister({
          username,
          password,
          name,
          instrument,
        });
        onLoginSuccess(data.user);
      } else {
        if (!username.trim() || !password.trim()) {
          throw new Error('Kullanıcı adı ve şifrenizi girin.');
        }
        const data = await apiLogin(username, password);
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'İşlem başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u, p) => {
    setError('');
    setLoading(true);
    try {
      const data = await apiLogin(u, p);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#12131b] via-[#0d0e14] to-[#07070a] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden p-6 sm:p-8">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 relative">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-black mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.35)] mb-3.5">
            <Disc className="w-8 h-8 stroke-[2.2] animate-spin-slow" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="text-2xl font-black tracking-tighter text-white">DNC</span>
            <span className="text-base font-extrabold tracking-[0.25em] text-amber-400 uppercase">MUSIC</span>
          </div>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Sahne & Repertuvar Sistemi
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#07070a] p-1 rounded-xl mb-6 border border-white/[0.08] relative">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Yeni Müzisyen Kaydı
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-300 font-semibold text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative">
          {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Ad Soyad / Sahne Adı
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Hasan Yılmaz"
                  className="w-full bg-[#08080c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/80"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Enstrüman / Rol
                </label>
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  className="w-full bg-[#08080c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-500/80"
                >
                  <option value="Bağlama / Solist">Bağlama & Solist</option>
                  <option value="Klavye / Piyanist">Klavye & Piyanist</option>
                  <option value="Davul / Ritim">Davul / Ritim / Perküsyon</option>
                  <option value="Klarnet / Zurna">Klarnet & Zurna</option>
                  <option value="Gitar & Bas">Gitar & Bas</option>
                  <option value="Solist">Solist</option>
                  <option value="Diğer">Diğer Müzisyen</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Örn: ahmet"
                className="w-full bg-[#08080c] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/80 lowercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#08080c] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/80"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all mt-2"
          >
            {loading ? 'Bağlanıyor...' : isRegister ? 'Hesap Oluştur ve Başla' : 'Sisteme Giriş Yap'}
          </button>
        </form>

        {/* Demo Musician Quick Switchers */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">
            ⚡ Hızlı Test İçin Hazır Müzisyen Hesapları:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('ahmet', '123')}
              className="p-2.5 rounded-xl bg-[#08080c] hover:bg-[#12131a] border border-white/[0.06] hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="text-xs font-black text-white group-hover:text-amber-400 truncate">
                Ahmet (Bağlama)
              </div>
              <div className="text-[10px] font-mono text-neutral-500">ahmet / 123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('serkan', '123')}
              className="p-2.5 rounded-xl bg-[#08080c] hover:bg-[#12131a] border border-white/[0.06] hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="text-xs font-black text-white group-hover:text-amber-400 truncate">
                Serkan (Klavye)
              </div>
              <div className="text-[10px] font-mono text-neutral-500">serkan / 123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
