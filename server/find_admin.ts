import { supabase } from './server/db';

async function findAdmin() {
    const { data: adminUsers, error } = await supabase
        .from('users')
        .select('name, email, password, role')
        .eq('role', 'admin');

    if (error) {
        console.error('Error finding admin:', error);
    } else if (adminUsers && adminUsers.length > 0) {
        console.log('--- Found Admin Users ---');
        adminUsers.forEach(admin => {
            console.log(`Name: ${admin.name}`);
            console.log(`Email: ${admin.email}`);
            console.log(`Password: ${admin.password}`);
            console.log('---------------------------');
        });
    } else {
        console.log('No admin users found.');
    }
}

findAdmin();
