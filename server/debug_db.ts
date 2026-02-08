import { supabase } from './db.js';

async function main() {
    const email = 'test1@test.com';
    console.log(`Checking user: ${email}`);
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
    } else {
        console.log('User Data:', JSON.stringify(user, null, 2));
    }
    process.exit(0);
}

main();
