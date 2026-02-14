import express from 'express';
import { supabase } from '../db';
import { sendResetPasswordEmail } from '../utils/email';

const router = express.Router();

// Google OAuth callback endpoint
router.post('/google', async (req, res) => {
    try {
        const { credential, role } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        // Decode the Google JWT token (in production, verify with Google's library)
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
                .toString()
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const googleUser = JSON.parse(jsonPayload);

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', googleUser.email)
            .single();

        if (existingUser) {
            // User exists, log them in
            const { password: _, ...userWithoutPassword } = existingUser;
            return res.json({ user: userWithoutPassword });
        }

        // Create new user
        const id = `u-${Date.now()}`;
        const { error: insertError } = await supabase
            .from('users')
            .insert([{
                id,
                name: googleUser.name || googleUser.email.split('@')[0],
                email: googleUser.email,
                password: `google_${googleUser.sub}`, // Store Google ID as password placeholder
                role: role || 'employer',
                status: 'approved',
                canViewHelpers: 0,
                canViewJobs: 0,
                authProvider: 'google'
            }]);

        if (insertError) throw insertError;

        // Fetch the newly created user
        const { data: newUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (newUser) {
            const { password: _, ...userWithoutPassword } = newUser;
            return res.status(201).json({ user: userWithoutPassword });
        }

        res.status(500).json({ error: 'Failed to create user' });

    } catch (error: any) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
    }
});

// Forgot password - Send reset email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const { data: user } = await supabase
            .from('users')
            .select('id, email, name, authProvider')
            .eq('email', email)
            .single();

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
        }

        if (user.authProvider === 'google') {
            return res.status(400).json({ error: 'This account uses Google Sign-In. Please login with Google.' });
        }

        // Generate reset token
        const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

        // Store reset token
        const { error } = await supabase
            .from('users')
            .update({
                resetToken,
                resetTokenExpiry: resetExpiry
            })
            .eq('id', user.id);

        if (error) throw error;

        // Send actual email
        await sendResetPasswordEmail(user.email, resetToken, user.name);

        res.json({
            message: 'If an account exists with this email, a password reset link has been sent.',
            // Keep this for dev if needed, or remove it
            devToken: process.env.NODE_ENV === 'production' ? undefined : resetToken
        });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Find user with valid token
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('resetToken', token)
            .single();

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Check if token is expired
        if (new Date(user.resetTokenExpiry) < new Date()) {
            return res.status(400).json({ error: 'Reset token has expired' });
        }

        // Update password and clear reset token
        const { error } = await supabase
            .from('users')
            .update({
                password: newPassword,
                resetToken: null,
                resetTokenExpiry: null
            })
            .eq('id', user.id);

        if (error) throw error;

        res.json({ message: 'Password reset successful. You can now login with your new password.' });

    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

export default router;
