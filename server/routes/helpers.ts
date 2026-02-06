import express from 'express';
import { supabase } from '../db';
import { z } from 'zod';

const router = express.Router();

const HelperSchema = z.object({
    userId: z.string().optional().nullable(),
    name: z.string(),
    age: z.number(),
    nationality: z.string(),
    experience: z.string(),
    salary: z.number(),
    skills: z.array(z.string()),
    languages: z.array(z.string()),
    imageUrl: z.string(),
    availability: z.string(),
    description: z.string(),
    status: z.enum(['pending', 'approved', 'rejected']).optional().default('pending'),
});

router.get('/', async (req, res) => {
    const isAdmin = req.query.admin === 'true' || req.query.role === 'admin';
    const userId = req.query.userId;
    const viewerId = req.query.viewerId;
    const userRole = req.query.role;

    // Privacy Control: Check if specific employer can see helpers
    if (!isAdmin && userRole === 'employer' && viewerId) {
        const { data: user } = await supabase
            .from('users')
            .select('canViewHelpers')
            .eq('id', viewerId)
            .single();

        if (user && user.canViewHelpers === false) {
            return res.json([]);
        }
    }

    let query = supabase.from('helpers').select('*');

    if (!isAdmin) {
        query = query.eq('status', 'approved');
    }

    if (userId) {
        query = query.eq('userId', userId);
    }

    const { data: helpers, error } = await query.order('createdAt', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(helpers || []);
});

router.get('/:id', async (req, res) => {
    const { data: helper, error } = await supabase
        .from('helpers')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error || !helper) {
        return res.status(404).json({ error: 'Helper not found' });
    }
    res.json(helper);
});

router.post('/', async (req, res) => {
    try {
        const body = HelperSchema.parse(req.body);
        const id = `h-${Date.now()}`;
        const newHelper = {
            id,
            ...body,
            status: 'pending'
        };

        const { data, error } = await supabase.from('helpers').insert([newHelper]).select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Invalid input' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const body = HelperSchema.parse(req.body);
        const { data, error } = await supabase
            .from('helpers')
            .update({
                name: body.name,
                age: body.age,
                nationality: body.nationality,
                experience: body.experience,
                salary: body.salary,
                skills: body.skills,
                languages: body.languages,
                imageUrl: body.imageUrl,
                availability: body.availability,
                status: body.status,
                description: body.description,
                userId: body.userId
            })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Helper not found' });
        }

        res.json(data[0]);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Invalid input' });
    }
});

router.delete('/:id', async (req, res) => {
    const { error } = await supabase.from('helpers').delete().eq('id', req.params.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Helper deleted successfully' });
});

export default router;

