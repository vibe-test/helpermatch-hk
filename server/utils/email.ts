import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using SMTP settings from environment variables
// Note: User needs to provide these in their .env file
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send a password reset email to the user
 */
export const sendResetPasswordEmail = async (email: string, token: string, name: string) => {
    // If SMTP is not configured, log to console and return
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials not configured. Email not sent.');
        console.log(`[DEV] Reset token for ${email}: ${token}`);
        return { skipped: true, token };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}?resetToken=${token}`;
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@helpermatch.hk';

    const mailOptions = {
        from: `"HelperMatch HK" <${fromEmail}>`,
        to: email,
        subject: 'Reset Your Password - HelperMatch HK',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563eb; text-align: center;">HelperMatch HK</h2>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                <p>Hello ${name},</p>
                <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                <p>To reset your password, please click the button below or use the reset token provided in the application:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p><strong>Your Reset Token:</strong> <code style="background: #f4f4f4; padding: 5px 10px; border-radius: 4px;">${token}</code></p>
                <p>This link and token will expire in 1 hour.</p>
                <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666; text-align: center;">&copy; ${new Date().getFullYear()} HelperMatch HK. All rights reserved.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/**
 * Send a welcome email to the user after registration
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
    // If SMTP is not configured, log to console and return
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials not configured. Welcome email not sent.');
        return { skipped: true };
    }

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@helpermatch.hk';

    const mailOptions = {
        from: `"HelperMatch HK" <${fromEmail}>`,
        to: email,
        subject: 'Welcome to HelperMatch HK!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563eb; text-align: center;">Welcome to HelperMatch HK!</h2>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                <p>Hello ${name},</p>
                <p>Thank you for registering with HelperMatch HK. Your account has been successfully created.</p>
                <p>You can now log in to your account and start searching for helpers or job opportunities.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                </div>
                <p>If you have any questions, feel free to reply to this email.</p>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666; text-align: center;">&copy; ${new Date().getFullYear()} HelperMatch HK. All rights reserved.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't throw error here to avoid blocking registration if email fails
        return { error };
    }
};
