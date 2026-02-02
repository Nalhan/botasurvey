import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || 'db.sqlite';

// Ensure directory exists if dbPath is in a subfolder
const dbDir = path.dirname(dbPath);
if (dbDir !== '.' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`Connecting to database at: ${dbPath}`);
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
// Using path.join(process.cwd(), 'drizzle') to ensure it works across environments
const migrationsFolder = path.join(process.cwd(), 'drizzle');
console.log(`Running migrations from: ${migrationsFolder}`);
try {
    migrate(db, { migrationsFolder });
    console.log('Migrations completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
}
