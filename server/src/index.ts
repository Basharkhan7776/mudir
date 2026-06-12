import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import syncRouter from './sync.js';

const app = express();

app.use(express.json());

// Custom GET route for mobile OAuth flow
// Mobile app opens this URL in a browser. We bridge it to Better Auth's POST-based social sign-in,
// then redirect the browser to Google. After Google auth, Better Auth redirects to /api/auth/mobile-callback
// which extracts the session token from the cookie and sends it to the app via deep link.
app.get('/api/auth/signin/google', async (req, res) => {
  const finalRedirectUrl = (req.query.redirect_url as string) || 'mudir://auth-callback';

  try {
    const baseUrl = process.env.BETTER_AUTH_URL || `http://${req.headers.host}`;
    const bridgeCallbackUrl = `${baseUrl}/api/auth/mobile-callback?redirect_url=${encodeURIComponent(finalRedirectUrl)}`;

    const baReq = await fetch(`${baseUrl}/api/auth/sign-in/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'google', callbackURL: bridgeCallbackUrl }),
    });

    const baRes = await baReq.json();

    // Forward state cookie from Better Auth to the browser
    const setCookies = baReq.headers.getSetCookie();
    if (setCookies && setCookies.length > 0) {
      res.setHeader('Set-Cookie', setCookies);
    }

    if (baRes.url) {
      res.redirect(baRes.url);
    } else {
      console.error('[Auth] Failed to get OAuth URL:', baRes);
      res.status(400).send('Failed to initiate Google sign-in');
    }
  } catch (error) {
    console.error('[Auth] signin/google error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Bridge endpoint: extracts Better Auth session token from cookie and passes it to mobile app via deep link
app.get('/api/auth/mobile-callback', (req, res) => {
  const finalRedirectUrl = req.query.redirect_url as string;

  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
  const token = match ? match[1] : '';

  console.log('[Auth] mobile-callback token found:', !!token);

  if (finalRedirectUrl) {
    const separator = finalRedirectUrl.includes('?') ? '&' : '?';
    res.redirect(`${finalRedirectUrl}${separator}token=${encodeURIComponent(token)}`);
  } else {
    res.status(400).send('Missing redirect_url');
  }
});

// Custom get-session endpoint for mobile apps that use Bearer tokens
// Better Auth's toNodeHandler only reads cookies, so we convert the Bearer token to a cookie header
app.get('/api/auth/get-session', async (req, res) => {
  try {
    // Convert Bearer token to cookie so Better Auth can find the session
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Better Auth uses __Secure- prefix in production/HTTPS. We set both to be safe.
      req.headers.cookie = `better-auth.session_token=${token}; __Secure-better-auth.session_token=${token}`;
    }

    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      res.json(null);
      return;
    }

    res.json(session);
  } catch (error) {
    console.error('[Auth] get-session error:', error);
    res.json(null);
  }
});

// Custom sign-out endpoint for mobile apps
app.post('/api/auth/sign-out', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      req.headers.cookie = `better-auth.session_token=${token}; __Secure-better-auth.session_token=${token}`;
    }

    await auth.api.signOut({
      headers: req.headers as any,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('[Auth] sign-out error:', error);
    res.json({ success: true });
  }
});

// Mount better-auth handler for all other /api/auth/* routes
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
