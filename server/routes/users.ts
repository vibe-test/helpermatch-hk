import express from 'express';
import db from '../db';
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

router.get('/', (req, res) => {
    const users = db.prepare('SELECT id, name, email, role, status, canViewHelpers, canViewJobs, createdAt FROM users ORDER BY createdAt DESC, id DESC').all();
    res.json(users);
});

router.get('/:id', (req, res) => {
    const user = db.prepare('SELECT id, name, email, role, status, canViewHelpers, canViewJobs FROM users WHERE id = ?').get(req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

router.put('/:id', (req, res) => {
    try {
        const body = UserUpdateSchema.parse(req.body);
        const canViewHelpers = body.canViewHelpers === true || body.canViewHelpers === 1 ? 1 : 0;
        const canViewJobs = body.canViewJobs === true || body.canViewJobs === 1 ? 1 : 0;

        const result = db.prepare('UPDATE users SET name = ?, email = ?, role = ?, status = ?, canViewHelpers = ?, canViewJobs = ? WHERE id = ?')
            .run(body.name, body.email, body.role, body.status, canViewHelpers, canViewJobs, req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ id: req.params.id, ...body });
    } catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});

router.delete('/:id', (req, res) => {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
});

export default router;
