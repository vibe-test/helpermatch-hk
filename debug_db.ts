import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'server', 'helpermatch.db');
const db = new Database(dbPath);

const user = db.prepare('SELECT id, name, email, role, status FROM users WHERE email = ?').get('test@test.com');
console.log('User status in DB:', JSON.stringify(user, null, 2));

const allUsers = db.prepare('SELECT email, role, status FROM users').all();
console.log('All users:', JSON.stringify(allUsers, null, 2));
