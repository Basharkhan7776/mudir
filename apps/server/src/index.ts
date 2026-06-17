import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import syncRouter from "./sync.js";
import os from "os";

const app = express();

app.use(express.json());

// The @better-auth/expo plugin handles mobile OAuth flows automatically
app.all(/^\/api\/auth/, toNodeHandler(auth));

// Mount sync routes
app.use("/api/sync", syncRouter);

app.get("/", (_req, res) => {
  res.status(301).redirect("https://mudir.basharkhan.com");
});

// Health check
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3001;
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
    console.log(`\nLocal URLs for development:`);
    console.log(`  http://localhost:${port}`);

    // Log local IP addresses
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === "IPv4" && !iface.internal) {
          console.log(`  http://${iface.address}:${port}`);
        }
      }
    }
    console.log();
  });
}
