import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Mock auth route for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@ultrapc.com' && password === 'admin123') {
    res.json({
      id: 1,
      email: 'admin@ultrapc.com',
      firstName: 'Admin',
      lastName: 'Ultra PC',
      role: 'admin'
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/auth/me', (req, res) => {
  res.status(401).json({ message: 'Non connecté' });
});

// Serve static files from client/dist
app.use(express.static(join(__dirname, 'client', 'dist')));

// Fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Ultra PC System v3.0 running on http://localhost:${PORT}`);
  console.log('Basic server mode - Login with admin@ultrapc.com / admin123');
});