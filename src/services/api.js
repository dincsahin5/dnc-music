// API client for communicating with the central backend server

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('musician_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiRegister({ username, password, name, instrument }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, name, instrument }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Kayıt başarısız oldu.');
  localStorage.setItem('musician_auth_token', data.token);
  localStorage.setItem('musician_active_user', JSON.stringify(data.user));
  return data;
}

export async function apiLogin(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Giriş başarısız oldu.');
  localStorage.setItem('musician_auth_token', data.token);
  localStorage.setItem('musician_active_user', JSON.stringify(data.user));
  return data;
}

export async function apiGetMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

export function apiLogout() {
  localStorage.removeItem('musician_auth_token');
  localStorage.removeItem('musician_active_user');
}

export async function apiGetCategories() {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Kategoriler alınamadı.');
  return await res.json();
}

export async function apiSaveCategory(category) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error('Kategori kaydedilemedi.');
  return await res.json();
}

export async function apiDeleteCategory(id) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Kategori silinemedi.');
  return await res.json();
}

export async function apiGetSongs() {
  const res = await fetch(`${API_BASE}/songs`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Şarkılar alınamadı.');
  return await res.json();
}

export async function apiSaveSong(song) {
  const res = await fetch(`${API_BASE}/songs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(song),
  });
  if (!res.ok) throw new Error('Şarkı kaydedilemedi.');
  return await res.json();
}

export async function apiDeleteSong(id) {
  const res = await fetch(`${API_BASE}/songs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Şarkı silinemedi.');
  return await res.json();
}

// Musician Friends & Repertoire Sharing
export async function apiGetMusicians() {
  const res = await fetch(`${API_BASE}/musicians`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Müzisyenler listesi alınamadı.');
  return await res.json();
}

export async function apiGetFriendRepertoire(userId) {
  const res = await fetch(`${API_BASE}/musicians/${userId}/repertoire`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Arkadaş repertuvarı alınamadı.');
  return await res.json();
}

export async function apiCopySong(songId) {
  const res = await fetch(`${API_BASE}/songs/copy`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ songId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Şarkı kopyalanamadı.');
  return data;
}
