import express from 'express';
import db from '../db';

const router = express.Router();

router.get('/', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const result = (settings as { key: string, value: string }[]).reduce((acc: any, s) => {
        acc[s.key] = s.value === 'true';
        return acc;
    }, {});
    res.json(result);
});

router.post('/', (req, res) => {
    const { key, value } = req.body;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
    res.json({ success: true });
});

export default router;
