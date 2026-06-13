import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import syncRouter from './sync.js';

const app = express();

app.use(express.json());

// Mount better-auth handler for all /api/auth/* routes
// The @better-auth/expo plugin handles mobile OAuth flows automatically
app.all(/^\/api\/auth/, toNodeHandler(auth));

// Mount sync routes
app.use('/api/sync', syncRouter);

// Health check
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3001;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server listening on port ${port} at 0.0.0.0`);
  });
}
