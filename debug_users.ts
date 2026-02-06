import db from './server/db.ts';
const users = db.prepare('SELECT id, name, email, role, status FROM users').all();
console.log(JSON.stringify(users, null, 2));
