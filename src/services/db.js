// IndexedDB multi-user service for storing musician accounts and isolated repertoires

const DB_NAME = 'MusicianRepertoireDB';
const DB_VERSION = 3; // upgraded for multi-user support
const STORE_USERS = 'users';
const STORE_SONGS = 'songs';
const STORE_CATEGORIES = 'categories';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        const catStore = db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
        catStore.createIndex('userId', 'userId', { unique: false });
      } else {
        const catStore = request.transaction.objectStore(STORE_CATEGORIES);
        if (!catStore.indexNames.contains('userId')) {
          catStore.createIndex('userId', 'userId', { unique: false });
        }
      }

      if (!db.objectStoreNames.contains(STORE_SONGS)) {
        const songStore = db.createObjectStore(STORE_SONGS, { keyPath: 'id' });
        songStore.createIndex('categoryId', 'categoryId', { unique: false });
        songStore.createIndex('userId', 'userId', { unique: false });
      } else {
        const songStore = request.transaction.objectStore(STORE_SONGS);
        if (!songStore.indexNames.contains('userId')) {
          songStore.createIndex('userId', 'userId', { unique: false });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Starter standard categories for each musician
export const DEFAULT_CATEGORIES = [
  { id: 'cat-halay', name: 'Halay', color: '#f59e0b' },       // Amber
  { id: 'cat-oyun', name: 'Oyun Havası', color: '#10b981' }, // Yeşil
  { id: 'cat-turku', name: 'Türkü', color: '#3b82f6' },      // Mavi
  { id: 'cat-uzun', name: 'Uzun Hava', color: '#8b5cf6' },   // Mor
];

// Initial demo musician users
const DEMO_USERS = [
  {
    id: 'user-ahmet',
    username: 'ahmet',
    password: '123',
    name: 'Ahmet (Bağlama & Solist)',
    instrument: 'Bağlama / Solist',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'user-serkan',
    username: 'serkan',
    password: '123',
    name: 'Serkan (Klavye & Piyanist)',
    instrument: 'Klavye / Piyanist',
    createdAt: Date.now() - 43200000,
  }
];

const DEMO_SONGS = [
  {
    id: 'song-halay-1',
    userId: 'user-ahmet',
    title: 'ŞEMMAME / DELİLO (HALAY POTPORİ)',
    artist: 'Anonim',
    categoryId: 'cat-halay',
    type: 'text',
    key: 'Dm',
    capo: 'Yok',
    bpm: '135',
    notes: 'Tempolu başla, 3. turda ritim hızlanır. Zurna/Klavye solosuyla geçiş.',
    content: `[Ritim: 2/4 Hızlı Halay]
Dm                Gm
Şemmame bûka kurda
C                 Dm
Şemmame bûka kurda
Dm                Gm
Delilo delilo hey canê
C                 Dm
Delilo delilo hey canê

[Akorlar / Dizi]
Dm - Gm - C - Dm (Döngü)
* Halay başı mendili sallarken tempoyu diri tutun!`,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'song-turku-1',
    userId: 'user-ahmet',
    title: 'MİHRİBAN',
    artist: 'Musa Eroğlu',
    categoryId: 'cat-turku',
    type: 'text',
    key: 'Am',
    capo: 'Yok',
    bpm: '82',
    notes: 'Girişte solo bağlama serbest, ardından usul girer.',
    content: `[Sözler]
Am                   Dm
Sarı saçlarına deli gönlümü
G                    C
Bağlamışlar çözülmüyor Mihriban
Dm                   Am
Ayrılıktan zor belleme ölümü
E                    Am
Görmeyince sezilmiyor Mihriban...`,
    updatedAt: Date.now() - 900000,
  },
  {
    id: 'song-oyun-serkan',
    userId: 'user-serkan',
    title: 'ANKARA’NIN BAĞLARI',
    artist: 'Coşkun Sabah / Anonim',
    categoryId: 'cat-oyun',
    type: 'text',
    key: 'Am',
    capo: 'Yok',
    bpm: '128',
    notes: 'Serkan klavye intro sesini Korg Pa4x üzerinden ayarla.',
    content: `[Giriş: Klavye / Elektro]
Am - G - F - Em (x2)

[Sözler]
Am                      G
Ankara'nın bağları da büklüm büklüm yolları
F                       Em
Ne zaman sarhoş oldun da kaldıramıyon kolları

[Nakarat]
Am                   G
Kostak yeri vay vay, aslan yeri vay vay
F                    Em
Gözün aydın olsun da aldım seni vay vay!`,
    updatedAt: Date.now() - 1800000,
  }
];

export async function initDatabase() {
  const users = await getUsers();
  if (users.length === 0) {
    for (const u of DEMO_USERS) {
      await registerUser(u);
    }
  }

  // Ensure default demo songs exist with userId
  const songs = await getRawAllSongs();
  if (songs.length === 0 || !songs.some(s => s.userId)) {
    for (const s of DEMO_SONGS) {
      await saveSong(s);
    }
  }
}

// USER OPERATIONS
export async function getUsers() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_USERS, 'readonly');
    const store = tx.objectStore(STORE_USERS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function registerUser({ username, password, name, instrument }) {
  const cleanUsername = username.trim().toLowerCase();
  const users = await getUsers();
  
  if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
    throw new Error('Bu kullanıcı adı zaten kullanılıyor.');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username: cleanUsername,
    password: password.trim(),
    name: name?.trim() || username.trim(),
    instrument: instrument?.trim() || 'Müzisyen',
    createdAt: Date.now(),
  };

  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_USERS, 'readwrite');
    const store = tx.objectStore(STORE_USERS);
    const request = store.put(newUser);
    request.onsuccess = () => resolve(newUser);
    request.onerror = () => reject(request.error);
  });

  // Assign default categories for this user
  for (const cat of DEFAULT_CATEGORIES) {
    await saveCategory({
      ...cat,
      id: `${cat.id}-${newUser.id}`,
      userId: newUser.id,
    });
  }

  return newUser;
}

export async function loginUser(username, password) {
  const users = await getUsers();
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  const user = users.find(
    (u) => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
  );

  if (!user) {
    throw new Error('Kullanıcı adı veya şifre hatalı!');
  }

  return user;
}

// CATEGORY OPERATIONS (Scoped to User)
export async function getCategoriesForUser(userId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CATEGORIES, 'readonly');
    const store = tx.objectStore(STORE_CATEGORIES);
    const index = store.index('userId');
    const request = index.getAll(IDBKeyRange.only(userId));
    
    request.onsuccess = async () => {
      let results = request.result || [];
      // If user has no categories yet, create default 4 categories
      if (results.length === 0) {
        for (const cat of DEFAULT_CATEGORIES) {
          const newCat = {
            ...cat,
            id: `${cat.id}-${userId}`,
            userId: userId,
          };
          await saveCategory(newCat);
          results.push(newCat);
        }
      }
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveCategory(category) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CATEGORIES, 'readwrite');
    const store = tx.objectStore(STORE_CATEGORIES);
    const request = store.put(category);
    request.onsuccess = () => resolve(category);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCategory(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_CATEGORIES, STORE_SONGS], 'readwrite');
    const catStore = tx.objectStore(STORE_CATEGORIES);
    const songStore = tx.objectStore(STORE_SONGS);
    
    catStore.delete(id);

    const index = songStore.index('categoryId');
    const request = index.openCursor(IDBKeyRange.only(id));
    
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// SONG OPERATIONS (Scoped to User)
export async function getSongsForUser(userId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readonly');
    const store = tx.objectStore(STORE_SONGS);
    const index = store.index('userId');
    const request = index.getAll(IDBKeyRange.only(userId));
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function getRawAllSongs() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readonly');
    const store = tx.objectStore(STORE_SONGS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSong(song) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readwrite');
    const store = tx.objectStore(STORE_SONGS);
    const toSave = {
      ...song,
      updatedAt: Date.now()
    };
    const request = store.put(toSave);
    request.onsuccess = () => resolve(toSave);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSong(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readwrite');
    const store = tx.objectStore(STORE_SONGS);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}
