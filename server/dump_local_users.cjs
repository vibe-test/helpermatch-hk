const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'helpermatch.db');
const db = new Database(dbPath);

console.log('--- USERS IN LOCAL DB ---');
const users = db.prepare('SELECT email, password, role FROM users').all();
users.forEach(u => {
    console.log(`Email: ${u.email}`);
    console.log(`Password: ${u.password}`);
    console.log(`Role: ${u.role}`);
    console.log('---------------------------');
});
