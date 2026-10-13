import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import subjectRoutes from './routes/subjects.js';
import taskRoutes from './routes/tasks.js';
import examRoutes from './routes/exams.js';

const app = express();
const configuredOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like health checks, Postman, curl)
    if (!origin) return callback(null, true);

    // Allow configured origins, localhost, or any vercel.app domain
    if (
      configuredOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.vercel.app') ||
      configuredOrigins.length === 0
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.get('/', (_req, res) => res.json({ status: 'ok', message: 'SmartStudy API is active.', health: '/api/health' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'SmartStudy API' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'SmartStudy API' }));

// Mount routes on both /api and direct root prefixes to prevent 404 errors
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/subjects', subjectRoutes);
app.use('/subjects', subjectRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/tasks', taskRoutes);

app.use('/api/exams', examRoutes);
app.use('/exams', examRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`SmartStudy API running on ${port}`)))
  .catch((err) => { console.error('Startup failed:', err.message); process.exit(1); });
