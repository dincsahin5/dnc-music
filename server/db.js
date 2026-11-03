import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'repertoire.db');

export const db = new DatabaseSync(dbPath);

// Initialize tables
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    instrument TEXT,
    createdAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    createdAt INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    categoryId TEXT,
    title TEXT NOT NULL,
    artist TEXT,
    type TEXT,
    content TEXT,
    imageData TEXT,
    key TEXT,
    capo TEXT,
    bpm TEXT,
    notes TEXT,
    updatedAt INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_songs_user ON songs(userId);
  CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(userId);
`);

export const DEFAULT_CATEGORIES = [
  { name: 'Halay', color: '#f59e0b' },
  { name: 'Oyun Havası', color: '#10b981' },
  { name: 'Türkü', color: '#3b82f6' },
  { name: 'Uzun Hava', color: '#8b5cf6' },
];

export async function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('Seeding initial demo musicians...');
    const hashedPass = bcrypt.hashSync('123', 8);

    // 1. Ahmet
    const ahmetId = 'user-ahmet';
    db.prepare(`
      INSERT INTO users (id, username, password, name, instrument, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(ahmetId, 'ahmet', hashedPass, 'Ahmet (Bağlama & Solist)', 'Bağlama & Solist', Date.now());

    // 2. Serkan
    const serkanId = 'user-serkan';
    db.prepare(`
      INSERT INTO users (id, username, password, name, instrument, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(serkanId, 'serkan', hashedPass, 'Serkan (Klavye & Piyanist)', 'Klavye & Piyanist', Date.now());

    // Create categories for both
    for (const userId of [ahmetId, serkanId]) {
      for (const cat of DEFAULT_CATEGORIES) {
        db.prepare(`
          INSERT INTO categories (id, userId, name, color, createdAt)
          VALUES (?, ?, ?, ?, ?)
        `).run(`cat-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${userId}`, userId, cat.name, cat.color, Date.now());
      }
    }

    // Add demo songs for Ahmet
    db.prepare(`
      INSERT INTO songs (id, userId, categoryId, title, artist, type, content, key, capo, bpm, notes, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'song-1',
      ahmetId,
      `cat-halay-${ahmetId}`,
      'ŞEMMAME / DELİLO (HALAY POTPORİ)',
      'Anonim',
      'text',
      `[Ritim: 2/4 Hızlı Halay]
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
      'Dm',
      'Yok',
      '135',
      'Tempolu başla, 3. turda ritim hızlanır.',
      Date.now()
    );

    db.prepare(`
      INSERT INTO songs (id, userId, categoryId, title, artist, type, content, key, capo, bpm, notes, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'song-2',
      ahmetId,
      `cat-trkü-${ahmetId}`,
      'MİHRİBAN',
      'Musa Eroğlu',
      'text',
      `[Sözler]
Am                   Dm
Sarı saçlarına deli gönlümü
G                    C
Bağlamışlar çözülmüyor Mihriban
Dm                   Am
Ayrılıktan zor belleme ölümü
E                    Am
Görmeyince sezilmiyor Mihriban...`,
      'Am',
      'Yok',
      '82',
      'Girişte solo bağlama serbest, ardından usul girer.',
      Date.now()
    );

    // Add demo song for Serkan
    db.prepare(`
      INSERT INTO songs (id, userId, categoryId, title, artist, type, content, key, capo, bpm, notes, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'song-3',
      serkanId,
      `cat-oyunhavas-${serkanId}`,
      'ANKARA’NIN BAĞLARI',
      'Coşkun Sabah / Anonim',
      'text',
      `[Giriş: Klavye / Elektro]
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
      'Am',
      'Yok',
      '128',
      'Serkan klavye intro sesini Korg Pa4x üzerinden ayarla.',
      Date.now()
    );

    console.log('Database seeded successfully.');
  }
}
