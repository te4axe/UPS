let isInitialized = false;
let initError: any = null;
let app: any = null;
let initPromise: Promise<void> | null = null;

async function initApp() {
  // Use dynamic import so it returns the actual module error if it fails
  const express = (await import('express')).default;
  const session = (await import('express-session')).default;
  const connectPgSimple = (await import('connect-pg-simple')).default;
  const { registerRoutes } = await import('../server/routes.js');
  const { pool } = await import('../server/db.js');

  const localApp = express();

  const PgSession = connectPgSimple(session);
  const isProduction = process.env.NODE_ENV === 'production';

  localApp.set('trust proxy', 1);

  localApp.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'ultra-pc-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    }
  }));

  localApp.use(express.json());
  localApp.use(express.urlencoded({ extended: false }));

  localApp.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  await registerRoutes(localApp);
  app = localApp;
}

export default async (req: any, res: any) => {
  if (!initPromise) {
    initPromise = initApp();
  }

  try {
    await initPromise;
    app(req, res, () => {
      res.status(404).json({ message: 'API route not found' });
    });
  } catch (err: any) {
    console.error('SERVER INIT CRASH:', err);
    res.status(500).json({ 
      message: 'Server Initialization Crash', 
      error: err.message, 
      stack: err.stack 
    });
  }
};
