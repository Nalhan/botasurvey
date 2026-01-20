import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

const sqlite = new Database('db.sqlite');
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
// Using path.join(process.cwd(), 'drizzle') to ensure it works across environments
migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
