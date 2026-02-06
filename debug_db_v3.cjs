const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'server', 'helpermatch.db');
const db = new Database(dbPath);

console.log('--- USERS ---');
console.log(JSON.stringify(db.prepare('SELECT id, email, role, status FROM users').all(), null, 2));

console.log('\n--- HELPERS ---');
console.log(JSON.stringify(db.prepare('SELECT id, name, status, userId FROM helpers').all(), null, 2));

console.log('\n--- JOBS ---');
console.log(JSON.stringify(db.prepare('SELECT id, title, status, userId FROM jobs').all(), null, 2));
