const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'server', 'helpermatch.db');
const db = new Database(dbPath);
const users = db.prepare('SELECT email, role, status FROM users').all();
console.log(JSON.stringify(users, null, 2));
db.close();
