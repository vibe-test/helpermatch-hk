import express from 'express';
import { supabase } from '../db';
import { z } from 'zod';

const router = express.Router();

const SettingsSchema = z.object({
    employerPrice: z.number().min(0),
    helperPrice: z.number().min(0),
    paymentEnabled: z.boolean(),
    membershipDurationDays: z.number().min(1)
});

// Get system settings
router.get('/', async (req, res) => {
    try {
        const { data: settings, error } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
        }

        // Return default settings if none exist
        if (!settings) {
            return res.json({
                employerPrice: 38800, // HK$388 in cents
                helperPrice: 38800,
                paymentEnabled: true,
                membershipDurationDays: 365
            });
        }

        res.json(settings);
    } catch (error: any) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update system settings
router.put('/', async (req, res) => {
    try {
        const body = SettingsSchema.parse(req.body);

        // Check if settings exist
        const { data: existing } = await supabase
            .from('settings')
            .select('id')
            .single();

        let result;
        if (existing) {
            // Update existing settings
            const { data, error } = await supabase
                .from('settings')
                .update(body)
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Insert new settings
            const { data, error } = await supabase
                .from('settings')
                .insert([body])
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.json(result);
    } catch (error: any) {
        console.error('Error updating settings:', error);
        res.status(400).json({ error: error.message || 'Invalid input' });
    }
});

export default router;
