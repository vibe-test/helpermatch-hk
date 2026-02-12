import express from 'express';
import { supabase } from '../db';
import { z } from 'zod';

const router = express.Router();

const JobSchema = z.object({
    userId: z.string().optional().nullable(),
    title: z.string(),
    location: z.string(),
    salary: z.string(),
    requirements: z.array(z.string()),
    description: z.string(),
    expiryDate: z.string().optional().nullable(),
    status: z.enum(['pending', 'approved', 'rejected']).optional().default('pending'),
});

router.get('/', async (req, res) => {
    const isAdmin = req.query.admin === 'true' || req.query.role === 'admin';
    const userId = req.query.userId;
    const viewerId = req.query.viewerId;
    const userRole = req.query.role;

    // Privacy Control: Check if specific helper can see jobs
    if (!isAdmin && userRole === 'helper' && viewerId) {
        // 1. Check user table for manual permission
        const { data: user } = await supabase
            .from('users')
            .select('canViewJobs')
            .eq('id', viewerId)
            .single();

        const hasManualPermission = user && (user.canViewJobs === true || user.canViewJobs === 1);

        if (!hasManualPermission) {
            // 2. Check helper_profiles for approved profile
            const { data: profiles } = await supabase
                .from('helpers')
                .select('id')
                .eq('userId', viewerId)
                .eq('status', 'approved');

            const hasApprovedProfile = profiles && profiles.length > 0;

            if (!hasApprovedProfile) {
                return res.json([]);
            }
        }
    }

    let query = supabase.from('jobs').select('*');

    if (!isAdmin) {
        query = query.eq('status', 'approved');
    }

    if (userId) {
        query = query.eq('userId', userId);
    }

    const { data: jobs, error } = await query.order('createdAt', { ascending: false });

    if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
    }

    res.json(jobs || []);
});

router.post('/', async (req, res) => {
    try {
        const body = JobSchema.parse(req.body);
        const newJob = {
            ...body,
            status: 'pending',
            // id and createdAt will be handled by Supabase defaults
        };

        const { data, error } = await supabase.from('jobs').insert([newJob]).select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error: any) {
        console.error('Insert error:', error);
        res.status(400).json({ error: error.message || 'Invalid input' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const body = JobSchema.parse(req.body);
        const { data, error } = await supabase
            .from('jobs')
            .update({
                title: body.title,
                location: body.location,
                salary: body.salary,
                requirements: body.requirements,
                expiryDate: body.expiryDate,
                status: body.status,
                description: body.description,
                userId: body.userId
            })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(data[0]);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Invalid input' });
    }
});

router.delete('/:id', async (req, res) => {
    const { error } = await supabase.from('jobs').delete().eq('id', req.params.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Job deleted successfully' });
});

export default router;

