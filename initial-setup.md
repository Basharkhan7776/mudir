# Initial Setup Guide

## Prerequisites

- Node.js 18+ or Bun
- MongoDB (local or Atlas)
- Google Cloud Project (for OAuth)

---

## Development Environment

### 1. Backend Setup (web/)

```bash
cd web

# Install dependencies
bun install

# Create .env file
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/mudir

# Better Auth - generate a secure secret
BETTER_AUTH_SECRET=your-super-secret-key-change-in-production-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth - get from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the development server:

```bash
bun run dev
```

### 2. Mobile App Setup (mobile-app/)

Add to `app.json` under `expo.extra`:

```json
{
  "extra": {
    "NEXT_PUBLIC_API_URL": "http://localhost:3000"
  }
}
```

For Android emulator, use your machine's LAN IP:

```json
{
  "extra": {
    "NEXT_PUBLIC_API_URL": "http://192.168.x.x:3000"
  }
}
```

---

## Production Environment

### 1. Backend (Vercel/Railway/Render)

1. **Set environment variables:**

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mudir
BETTER_AUTH_SECRET=<generate-secure-64-char-key>
BETTER_AUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com
```

2. **Deploy to Vercel:**

```bash
cd web
vercel deploy --prod
```

### 2. Mobile App

Update `app.json`:

```json
{
  "extra": {
    "NEXT_PUBLIC_API_URL": "https://your-domain.com"
  }
}
```

Build with EAS:

```bash
cd mobile-app
eas build -p android --profile production
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API / People API
4. Go to Credentials → OAuth 2.0 Client IDs
5. Create credentials:

**Authorized JavaScript origins:**
- `http://localhost:3000`
- `https://your-domain.com`

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google`
- `https://your-domain.com/api/auth/callback/google`
- `mudir://auth-callback` (mobile app)

---

## MongoDB Setup

### Local

```bash
# Using Docker
docker run -d -p 27017:27017 -v mongo-data:/data/db mongo:latest

# Or install MongoDB Community Edition
```

### Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster (free tier)
3. Create database user
4. Get connection string:

```
mongodb+srv://<username>:<password>@cluster.mongodb.net/mudir?retryWrites=true&w=majority
```

---

## Testing Sync

1. Start backend: `cd web && bun run dev`
2. Start mobile app: `cd mobile-app && npx expo start`
3. Login with Google
4. Add some data
5. Trigger sync - data should be saved to MongoDB
6. Delete local data and sync again - data should be pulled from server

---

## Troubleshooting

### CORS errors

Add your mobile app's origin to `trustedOrigins` in `lib/auth.ts`:

```typescript
trustedOrigins: [
  'exp://',
  'exp://localhost',
  'https://localhost:8081',
  'your-production-domain.com',
],
```

### Auth token issues

Make sure `BETTER_AUTH_SECRET` is set and is at least 32 characters.

### MongoDB connection

Verify `MONGODB_URI` is correct and your IP is whitelisted in Atlas.
