import { sendResetPasswordEmail } from './utils/email';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    console.log('--- Email Configuration Test ---');
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_HOST:', process.env.SMTP_HOST);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ Error: SMTP_USER or SMTP_PASS is missing in .env');
        process.exit(1);
    }

    try {
        console.log('⏳ Sending test email to', process.env.SMTP_USER, '...');
        await sendResetPasswordEmail(
            process.env.SMTP_USER as string,
            'test-token-12345',
            'Tester Name'
        );
        console.log('✅ Success! Please check your inbox (including Spam folder).');
    } catch (error) {
        console.error('❌ Failed to send email:');
        console.error(error);
    }
}

test();
