import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, seedInitialData, DEFAULT_CATEGORIES } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'musician-repertoire-super-secret-key-2026';
const PORT = process.env.PORT || 3001;

const app = express();

// High limits for large chord screenshots (200MB per upload)
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Seed initial database
seedInitialData();

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Giriş yapmanız gerekiyor.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Oturum süresi doldu, lütfen tekrar giriş yapın.' });
  }
}

// 1. REGISTER
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, name, instrument } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Kullanıcı adı, şifre ve isim zorunludur.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
    if (existing) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });
    }

    const id = `user-${Date.now()}`;
    const hashedPassword = bcrypt.hashSync(password.trim(), 8);
    const createdAt = Date.now();

    db.prepare(`
      INSERT INTO users (id, username, password, name, instrument, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, cleanUsername, hashedPassword, name.trim(), instrument?.trim() || 'Müzisyen', createdAt);

    // Initialize 4 default categories for this user
    for (const cat of DEFAULT_CATEGORIES) {
      db.prepare(`
        INSERT INTO categories (id, userId, name, color, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(`cat-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${id}`, id, cat.name, cat.color, createdAt);
    }

    const token = jwt.sign({ id, username: cleanUsername, name: name.trim() }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id,
        username: cleanUsername,
        name: name.trim(),
        instrument: instrument?.trim() || 'Müzisyen',
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Kayıt sırasında hata oluştu.' });
  }
});

// 2. LOGIN
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername);

    if (!user || !bcrypt.compareSync(password.trim(), user.password)) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı!' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        instrument: user.instrument,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Giriş sırasında hata oluştu.' });
  }
});

// 3. ME (Get current user info)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, name, instrument FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
  }
  res.json({ user });
});

// 4. GET CATEGORIES FOR LOGGED IN USER
app.get('/api/categories', authMiddleware, (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories WHERE userId = ? ORDER BY createdAt ASC').all(req.user.id);
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Kategoriler yüklenemedi.' });
  }
});

// 5. SAVE / UPDATE CATEGORY
app.post('/api/categories', authMiddleware, (req, res) => {
  try {
    const { id, name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Kategori adı gerekli.' });

    const catId = id || `cat-${Date.now()}`;
    const existing = db.prepare('SELECT id FROM categories WHERE id = ? AND userId = ?').get(catId, req.user.id);

    if (existing) {
      db.prepare('UPDATE categories SET name = ?, color = ? WHERE id = ? AND userId = ?')
        .run(name.trim(), color || '#f59e0b', catId, req.user.id);
    } else {
      db.prepare('INSERT INTO categories (id, userId, name, color, createdAt) VALUES (?, ?, ?, ?, ?)')
        .run(catId, req.user.id, name.trim(), color || '#f59e0b', Date.now());
    }

    const saved = db.prepare('SELECT * FROM categories WHERE id = ?').get(catId);
    res.json(saved);
  } catch (err) {
    console.error('Save category error:', err);
    res.status(500).json({ error: 'Kategori kaydedilemedi.' });
  }
});

// 6. DELETE CATEGORY
app.delete('/api/categories/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM categories WHERE id = ? AND userId = ?').run(id, req.user.id);
    // Also delete songs in this category
    db.prepare('DELETE FROM songs WHERE categoryId = ? AND userId = ?').run(id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Kategori silinemedi.' });
  }
});

// 7. GET SONGS FOR LOGGED IN USER
app.get('/api/songs', authMiddleware, (req, res) => {
  try {
    const songs = db.prepare('SELECT * FROM songs WHERE userId = ? ORDER BY updatedAt DESC').all(req.user.id);
    res.json(songs);
  } catch (err) {
    console.error('Get songs error:', err);
    res.status(500).json({ error: 'Şarkılar yüklenemedi.' });
  }
});

// 8. SAVE / UPDATE SONG
app.post('/api/songs', authMiddleware, (req, res) => {
  try {
    const { id, categoryId, title, artist, type, content, imageData, key, capo, bpm, notes } = req.body;
    if (!title) return res.status(400).json({ error: 'Şarkı başlığı zorunludur.' });

    const songId = id || `song-${Date.now()}`;
    const now = Date.now();
    const existing = db.prepare('SELECT id FROM songs WHERE id = ? AND userId = ?').get(songId, req.user.id);

    if (existing) {
      db.prepare(`
        UPDATE songs SET
          categoryId = ?,
          title = ?,
          artist = ?,
          type = ?,
          content = ?,
          imageData = ?,
          key = ?,
          capo = ?,
          bpm = ?,
          notes = ?,
          updatedAt = ?
        WHERE id = ? AND userId = ?
      `).run(
        categoryId,
        title.trim().toUpperCase(),
        artist?.trim() || '',
        type || (imageData ? 'image' : 'text'),
        content?.trim() || '',
        imageData || null,
        key?.trim() || '',
        capo?.trim() || 'Yok',
        bpm?.trim() || '',
        notes?.trim() || '',
        now,
        songId,
        req.user.id
      );
    } else {
      db.prepare(`
        INSERT INTO songs (
          id, userId, categoryId, title, artist, type, content, imageData, key, capo, bpm, notes, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        songId,
        req.user.id,
        categoryId,
        title.trim().toUpperCase(),
        artist?.trim() || '',
        type || (imageData ? 'image' : 'text'),
        content?.trim() || '',
        imageData || null,
        key?.trim() || '',
        capo?.trim() || 'Yok',
        bpm?.trim() || '',
        notes?.trim() || '',
        now
      );
    }

    const saved = db.prepare('SELECT * FROM songs WHERE id = ?').get(songId);
    res.json(saved);
  } catch (err) {
    console.error('Save song error:', err);
    res.status(500).json({ error: 'Şarkı kaydedilemedi.' });
  }
});

// 9. DELETE SONG
app.delete('/api/songs/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM songs WHERE id = ? AND userId = ?').run(id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete song error:', err);
    res.status(500).json({ error: 'Şarkı silinemedi.' });
  }
});

// 10. GET ALL MUSICIANS (For exploring friends' repertoires)
app.get('/api/musicians', authMiddleware, (req, res) => {
  try {
    const musicians = db.prepare(`
      SELECT u.id, u.username, u.name, u.instrument, COUNT(s.id) as songCount
      FROM users u
      LEFT JOIN songs s ON s.userId = u.id
      GROUP BY u.id
      ORDER BY u.name ASC
    `).all();
    res.json(musicians);
  } catch (err) {
    console.error('Get musicians error:', err);
    res.status(500).json({ error: 'Müzisyenler yüklenemedi.' });
  }
});

// 11. GET A FRIEND'S REPERTOIRE
app.get('/api/musicians/:id/repertoire', authMiddleware, (req, res) => {
  try {
    const targetUserId = req.params.id;
    const musician = db.prepare('SELECT id, username, name, instrument FROM users WHERE id = ?').get(targetUserId);
    if (!musician) {
      return res.status(404).json({ error: 'Müzisyen bulunamadı.' });
    }

    const categories = db.prepare('SELECT * FROM categories WHERE userId = ? ORDER BY createdAt ASC').all(targetUserId);
    const songs = db.prepare('SELECT * FROM songs WHERE userId = ? ORDER BY updatedAt DESC').all(targetUserId);

    res.json({
      musician,
      categories,
      songs,
    });
  } catch (err) {
    console.error('Get friend repertoire error:', err);
    res.status(500).json({ error: 'Arkadaş repertuvarı yüklenemedi.' });
  }
});

// 12. COPY SONG FROM FRIEND TO OWN REPERTOIRE
app.post('/api/songs/copy', authMiddleware, (req, res) => {
  try {
    const { songId } = req.body;
    const sourceSong = db.prepare('SELECT * FROM songs WHERE id = ?').get(songId);
    if (!sourceSong) {
      return res.status(404).json({ error: 'Kaynak şarkı bulunamadı.' });
    }

    // Find or pick a category for the current user (e.g. matching name or first category)
    const sourceCategory = db.prepare('SELECT name FROM categories WHERE id = ?').get(sourceSong.categoryId);
    const targetCategories = db.prepare('SELECT id, name FROM categories WHERE userId = ?').all(req.user.id);
    
    let targetCatId = targetCategories[0]?.id;
    if (sourceCategory) {
      const match = targetCategories.find(c => c.name.toLowerCase() === sourceCategory.name.toLowerCase());
      if (match) targetCatId = match.id;
    }

    const newSongId = `song-${Date.now()}`;
    db.prepare(`
      INSERT INTO songs (
        id, userId, categoryId, title, artist, type, content, imageData, key, capo, bpm, notes, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newSongId,
      req.user.id,
      targetCatId,
      sourceSong.title,
      sourceSong.artist,
      sourceSong.type,
      sourceSong.content,
      sourceSong.imageData,
      sourceSong.key,
      sourceSong.capo,
      sourceSong.bpm,
      sourceSong.notes ? `[${sourceSong.artist || 'Arkadaştan'} Kopyalandı] ${sourceSong.notes}` : 'Arkadaşın repertuvarından kopyalandı.',
      Date.now()
    );

    const saved = db.prepare('SELECT * FROM songs WHERE id = ?').get(newSongId);
    res.json(saved);
  } catch (err) {
    console.error('Copy song error:', err);
    res.status(500).json({ error: 'Şarkı kopyalanamadı.' });
  }
});

// Root status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
