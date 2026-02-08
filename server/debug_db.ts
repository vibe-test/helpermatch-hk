import { supabase } from './db.js';

async function main() {
    const { data: users, error } = await supabase.from('users').select('email, role, status');
    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('All users in DB:', JSON.stringify(users, null, 2));
        console.log('Test user:', JSON.stringify(users.find((u: any) => u.email === 'test@test.com'), null, 2));
    }
    process.exit(0);
}

main();
