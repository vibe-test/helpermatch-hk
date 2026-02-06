import express from 'express';
import { supabase } from '../db';
import { z } from 'zod';

const router = express.Router();

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['employer', 'helper']),
});

router.post('/login', async (req, res) => {
    console.log('Login attempt for:', req.body?.email);
    try {
        const { email, password } = LoginSchema.parse(req.body);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = RegisterSchema.parse(req.body);

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const id = `u-${Date.now()}`;
        const { error: insertError } = await supabase
            .from('users')
            .insert([{
                id,
                name,
                email,
                password,
                role,
                status: 'approved' // Setting to approved for easier testing, or 'pending' if you want admin approval
            }]);

        if (insertError) throw insertError;

        res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors[0].message });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

export default router;

