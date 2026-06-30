import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { expo } from "@better-auth/expo";
import { MongoClient, Db } from "mongodb";
import os from "os";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;

  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not defined");
    client = new MongoClient(uri);
    await client.connect();
  }

  db = client.db();
  return db;
}

// Automatically detect local IPs to add to trusted origins (dev only)
const getLocalIpOrigins = () => {
  if (process.env.NODE_ENV === 'production') return [];
  const origins: string[] = [];
  const interfaces = os.networkInterfaces();
  const port = process.env.PORT || 3001;
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        origins.push(`http://${iface.address}:${port}`);
      }
    }
  }
  return origins;
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  // CRITICAL for production OAuth:
  // - Set BETTER_AUTH_URL=https://apimudir.basharkhan.com in your deployment env.
  // - If this is not set (or falls back to localhost/http), Google OAuth will generate
  //   incorrect redirect URLs → "unsafe website" / verification warnings.
  // - Also set BETTER_AUTH_SECRET (min 32 chars).
  trustedOrigins: [
    'mudir://',
    'mudir://**',
    'exp://',
    'exp://**',
    'http://localhost:8081',
    'http://localhost:3000',
    'https://apimudir.basharkhan.com',
    process.env.BETTER_AUTH_URL || 'http://localhost:3001',
    process.env.FRONTEND_URL || 'http://localhost:3000',
    // Only include local IPs in dev (getLocalIpOrigins uses http)
    ...(process.env.NODE_ENV === 'production' ? [] : getLocalIpOrigins()),
  ],
  database: mongodbAdapter(await getDb(), {
    usePlural: true,
  }),
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // You can explicitly set redirectURI here if needed for advanced cases:
      // redirectURI: process.env.GOOGLE_REDIRECT_URI,
    },
  },
  // Recommended for production: ensure secure cookies
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});

export type Session = {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
};
