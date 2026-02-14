import { supabase } from './db';

async function checkUser() {
    const email = 'test20260214@yopmail.com';
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        console.log('Error or User not found:', error.message);
    } else {
        console.log('User found:', data);
    }
}

checkUser();
