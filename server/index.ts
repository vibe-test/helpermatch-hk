import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helperRoutes from './routes/helpers';
import jobRoutes from './routes/jobs';
import aiRoutes from './routes/ai';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import paymentRoutes from './routes/payments';
import settingsRoutes from './routes/settings';
import oauthRoutes from './routes/oauth';
import messageRoutes from './routes/messages';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/helpers', helperRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/messages', messageRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TEMPORARY: Admin Recovery
app.get('/api/recover-admin', async (req, res) => {
    const { supabase } = await import('./db');
    const { data } = await supabase.from('users').select('email, password').eq('role', 'admin');
    res.json(data);
});

// Serve static files from the Vite build output (dist)
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// For any other GET request, send back index.html for React routing
app.get('*', (req, res) => {
    // Only serve index.html if it's not an API route
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
            // If the file doesn't exist (e.g. build hasn't run), show a friendly message
            res.status(200).send('<h1>HelperMatch Backend is Running</h1><p>API is available at /api. Please run "npm run build" in the frontend to serve the UI from here.</p>');
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
