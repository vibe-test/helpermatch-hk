import db from './db.ts';
const users = db.prepare('SELECT email, role, status FROM users').all();
console.log('All users in DB:', JSON.stringify(users, null, 2));
console.log('Test user:', JSON.stringify(users.find(u => u.email === 'test@test.com'), null, 2));
process.exit(0);
