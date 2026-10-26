import { DatabaseSync } from 'node:sqlite';
import path from 'path';

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), 'donations.db');
    dbInstance = new DatabaseSync(dbPath);

    // Initialize Schema
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY,
        donor_name TEXT,
        message TEXT,
        base_amount INTEGER NOT NULL,
        unique_code INTEGER DEFAULT 0,
        amount INTEGER NOT NULL,
        qris_string TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        expires_at INTEGER,
        paid_at INTEGER,
        issuer TEXT,
        transaction_id TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
      CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount, created_at);

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS static_links (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at INTEGER
      );
    `);

    // Migration helper for existing databases
    try {
      dbInstance.exec('ALTER TABLE donations ADD COLUMN expires_at INTEGER;');
    } catch (_) {}

    // Default settings
    const initSetting = (key, val) => {
      const existing = dbInstance.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      if (!existing) {
        dbInstance.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, val);
      }
    };

    initSetting('store_name', 'Ngecode Aje');
    initSetting('unique_code_enabled', '1');
    initSetting('unique_code_max', '99');
    initSetting('api_key', process.env.API_KEY || 'ngecodeaje-secret-2026');

    // Default static link 4253472e
    const existingLink = dbInstance.prepare('SELECT id FROM static_links WHERE id = ?').get('4253472e');
    if (!existingLink) {
      dbInstance.prepare('INSERT INTO static_links (id, title, created_at) VALUES (?, ?, ?)').run('4253472e', 'Ngecode Aje - Pembayaran QRIS', Math.floor(Date.now() / 1000));
    }
  }
  return dbInstance;
}

export function getSetting(key, fallback = '') {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

export function setSetting(key, value) {
  const db = getDb();
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value));
}
