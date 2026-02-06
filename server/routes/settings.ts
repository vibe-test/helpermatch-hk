import express from 'express';
import { supabase } from '../db';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { data: settings, error } = await supabase
            .from('settings')
            .select('*');

        if (error) {
            // If table doesn't exist yet, return empty object instead of 500
            if (error.code === '42P01') return res.json({});
            throw error;
        }

        const result = (settings || []).reduce((acc: any, s) => {
            acc[s.key] = s.value === 'true';
            return acc;
        }, {});
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { key, value } = req.body;
        const { error } = await supabase
            .from('settings')
            .upsert({ key, value: String(value) }, { onConflict: 'key' });

        if (error) throw error;
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

