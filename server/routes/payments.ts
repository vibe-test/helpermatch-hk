import express from 'express';
import Stripe from 'stripe';
import { supabase } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripeKey = process.env.STRIPE_SECRET_KEY || '';

// If no key is provided, we can log a warning or return an error on usage, 
// but we should still initialize the router so the server doesn't crash.
const stripe = stripeKey ? new Stripe(stripeKey, {
    apiVersion: '2026-01-28.clover',
}) : null;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.post('/create-checkout-session', async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: 'Stripe Secret Key is missing in environment variables.' });
    }

    try {
        const { userId, planId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch system settings
        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .single();

        // Default settings if none exist
        const employerPrice = settings?.employerPrice || 38800;
        const helperPrice = settings?.helperPrice || 38800;
        const paymentEnabled = settings?.paymentEnabled !== false; // default true

        if (!paymentEnabled) {
            return res.status(403).json({ error: 'Payment system is currently disabled' });
        }

        // Get user to determine role
        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Determine price based on role
        const isHelper = user.role === 'helper' || planId === 'premium_helper';
        const price = isHelper ? helperPrice : employerPrice;
        const productName = isHelper
            ? 'Premium Access - View All Jobs'
            : 'Premium Access - View All Helpers';
        const productDescription = isHelper
            ? 'Unlocks full access to job postings'
            : 'Unlocks full access to helper profiles';

        // Create a Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'hkd',
                        product_data: {
                            name: productName,
                            description: productDescription,
                        },
                        unit_amount: price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/payment/cancel`,
            metadata: {
                userId: userId.toString(),
                type: isHelper ? 'unlock_job_view' : 'unlock_helper_view'
            },
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/verify-payment', async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: 'Stripe Secret Key is missing.' });
    }
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const userId = session.metadata?.userId;

            if (!userId) {
                return res.status(400).json({ error: 'User ID not found in session metadata' });
            }

            // Fetch system settings for membership duration
            const { data: settings } = await supabase
                .from('settings')
                .select('*')
                .single();

            const membershipDurationDays = settings?.membershipDurationDays || 365;

            // Calculate expiry date
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + membershipDurationDays);

            // Update user permissions in DB
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({
                    canViewHelpers: 1,
                    canViewJobs: 1,
                    membershipExpiry: expiryDate.toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (updateError) throw updateError;

            // Remove password before sending back
            if (updatedUser && updatedUser.password) {
                delete updatedUser.password;
            }

            res.json({ success: true, message: 'Payment verified', user: updatedUser });
        } else {
            res.status(400).json({ error: 'Payment not successful' });
        }
    } catch (error: any) {
        console.error('Verification Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
