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
    apiVersion: '2025-01-27.acacia', // Use latest API version or let it default if unsure
}) : null;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.post('/create-checkout-session', async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: 'Stripe Secret Key is missing in environment variables.' });
    }

    try {
        const { userId, planId } = req.body; // planId could be 'premium_monthly' etc.

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Create a Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'hkd',
                        product_data: {
                            name: 'Premium Access - View All Helpers',
                            description: 'Unlocks full access to helper profiles',
                        },
                        unit_amount: 38800, // Amount in cents (HK$388.00)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/payment/cancel`,
            metadata: {
                userId: userId.toString(),
                type: 'unlock_helper_view'
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

            // Update user permissions in DB
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({ canViewHelpers: 1, canViewJobs: 1 })
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
