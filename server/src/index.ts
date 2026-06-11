import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import syncRouter from "./sync.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Custom GET route for mobile OAuth flow to bridge Better Auth's POST requirement
app.get("/api/auth/signin/google", async (req, res) => {
  const redirectUrl = (req.query.redirect_url as string) || 'exp://192.168.1.7:8081/--/auth-callback';
  
  try {
    const baseUrl = process.env.BETTER_AUTH_URL || `http://${req.headers.host}`;
    const baReq = await fetch(`${baseUrl}/api/auth/sign-in/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "google", callbackURL: redirectUrl })
    });
    
    const baRes = await baReq.json();
    
    // Forward the cookies (especially the state cookie) from Better Auth to the browser
    const setCookies = baReq.headers.getSetCookie();
    if (setCookies && setCookies.length > 0) {
      res.setHeader('Set-Cookie', setCookies);
    }

    if (baRes.url) {
      res.redirect(baRes.url);
    } else {
      res.status(400).send("Failed to get Google OAuth URL: " + JSON.stringify(baRes));
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Mount better-auth routes
app.all(/^\/api\/auth/, (req, res) => {
  console.log(`[Auth Request] ${req.method} ${req.url} (originalUrl: ${req.originalUrl})`);
  return toNodeHandler(auth)(req, res);
});

// Mount sync routes
app.use("/api/sync", syncRouter);

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3001;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server listening on port ${port} at 0.0.0.0`);
  });
}
