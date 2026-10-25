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
        paid_at INTEGER,
        issuer TEXT,
        transaction_id TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
      CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount, created_at);
    `);
  }
  return dbInstance;
}
