import express from 'express';
import { supabase } from '../db';
import { z } from 'zod';

const router = express.Router();

const UserUpdateSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(['user', 'admin', 'employer', 'helper']),
    status: z.enum(['pending', 'approved']),
    canViewHelpers: z.union([z.boolean(), z.number()]).optional(),
    canViewJobs: z.union([z.boolean(), z.number()]).optional(),
});

router.get('/', async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, status, canViewHelpers, canViewJobs, createdAt')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        res.json(users || []);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, status, canViewHelpers, canViewJobs')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const body = UserUpdateSchema.parse(req.body);
        const canViewHelpers = body.canViewHelpers === true || body.canViewHelpers === 1;
        const canViewJobs = body.canViewJobs === true || body.canViewJobs === 1;

        const { data, error } = await supabase
            .from('users')
            .update({
                name: body.name,
                email: body.email,
                role: body.role,
                status: body.status,
                canViewHelpers,
                canViewJobs
            })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(data[0]);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Invalid input' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

