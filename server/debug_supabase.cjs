require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- USERS ---');
    const { data: users, error: userError } = await supabase.from('users').select('*');
    if (userError) console.error(userError);
    else console.log(JSON.stringify(users, null, 2));

    console.log('\n--- HELPERS ---');
    const { data: helpers, error: helperError } = await supabase.from('helpers').select('*');
    if (helperError) console.error(helperError);
    else console.log(JSON.stringify(helpers, null, 2));
}

debug();
