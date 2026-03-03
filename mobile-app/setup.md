# Firebase Setup Guide

This guide covers setting up Firebase for both development and production environments.

## Prerequisites

- Google Account
- Node.js installed
- Expo project set up

---

## Step 1: Create Firebase Projects

### Create Development Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter project name: `mudir-dev`
4. Disable Google Analytics (optional, for faster setup)
5. Click **Create project**

### Create Production Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter project name: `mudir-prod`
4. Enable Google Analytics (recommended for production)
5. Click **Create project**

---

## Step 2: Enable Authentication

### For Both Projects

1. Go to **Build > Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Click **Google** provider
5. Enable it
6. Set Project support email (your email)
7. Click **Save**

---

## Step 3: Enable Realtime Database

### For Both Projects

1. Go to **Build > Realtime Database**
2. Click **Create Database**
3. Select location (choose closest to your users)
4. Start in **Test mode** (or set rules below)

### Database Rules

For development (test mode):

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

For production, use more restrictive rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## Step 4: Get Configuration Values

### From Firebase Console

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **</>** (Web app)
4. Register app (e.g., "Mudir Web")
5. Copy the `firebaseConfig` object

### From Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services > Credentials**
4. Create OAuth 2.0 Client IDs:
   - **Web application** - Get `GOOGLE_WEB_CLIENT_ID`
   - **iOS application** - Get `GOOGLE_IOS_CLIENT_ID`

---

## Step 5: Configure Environment Variables

### Option A: Using app.json (Recommended for Expo)

Edit `app.json`:

```json
{
  "expo": {
    "extra": {
      "ENVIRONMENT": "development",
      "FIREBASE_API_KEY": "your-api-key",
      "FIREBASE_AUTH_DOMAIN": "mudir-dev.firebaseapp.com",
      "FIREBASE_PROJECT_ID": "mudir-dev",
      "FIREBASE_STORAGE_BUCKET": "mudir-dev.appspot.com",
      "FIREBASE_MESSAGING_SENDER_ID": "123456789",
      "FIREBASE_APP_ID": "1:123456789:web:abcdef",
      "FIREBASE_DATABASE_URL": "https://mudir-dev.firebaseio.com",
      "GOOGLE_WEB_CLIENT_ID": "xxx.apps.googleusercontent.com",
      "GOOGLE_IOS_CLIENT_ID": "xxx.apps.googleusercontent.com"
    }
  }
}
```

### Switching Environments

- **Development**: Set `"ENVIRONMENT": "development"`
- **Production**: Set `"ENVIRONMENT": "production"`

The app will automatically use the corresponding Firebase config.

---

## Step 6: iOS Configuration (Required for Google Sign-In)

### Option A: Using EAS CLI (Recommended)

```bash
# Add Google Sign-In URL scheme
eas secret:create --scope project --name GOOGLE_REVERSE_CLIENT_ID --value "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
```

### Option B: Manual Configuration

1. Open `ios/Mudir.xcworkspace` in Xcode
2. Select your project
3. Go to **Info > URL Types**
4. Add new URL Type:
   - Identifier: `com.googleusercontent.apps.YOUR_IOS_CLIENT_ID`
   - URL Schemes: `com.googleusercontent.apps.YOUR_IOS_CLIENT_ID`

---

## Step 7: Android Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services > Credentials**
4. Note the Web Client ID (for Android, use the same OAuth client)

---

## Environment-Specific Setup

### Development Environment

```bash
# In app.json
"extra": {
  "ENVIRONMENT": "development",
  "FIREBASE_PROJECT_ID": "mudir-dev",
  "FIREBASE_AUTH_DOMAIN": "mudir-dev.firebaseapp.com",
  "FIREBASE_DATABASE_URL": "https://mudir-dev.firebaseio.com"
}
```

### Production Environment

```bash
# In app.json
"extra": {
  "ENVIRONMENT": "production",
  "FIREBASE_PROJECT_ID": "mudir-prod",
  "FIREBASE_AUTH_DOMAIN": "mudir-prod.firebaseapp.com",
  "FIREBASE_DATABASE_URL": "https://mudir-prod.firebaseio.com"
}
```

---

## Testing the Setup

1. Start the app: `npm run dev`
2. Go to **Settings**
3. Click **Sign in with Google**
4. After signing in, click **Sync Data**
5. Verify data appears in Firebase Console

---

## Troubleshooting

### "DEVELOPER_ERROR" on Google Sign-In

- Ensure OAuth consent screen is configured in Google Cloud Console
- Add your email as a test user in OAuth consent screen

### "Play Services not available"

- For Android: Ensure Google Play Services is installed
- For iOS: Ensure URL scheme is configured

### Data not syncing

- Check Firebase Database rules
- Verify `auth != null` rules allow authenticated users
- Check console for error messages

---

## Security Best Practices

1. **Don't commit credentials** - Use environment variables
2. **Use restrictive DB rules** - Only allow user to access their own data
3. **Validate data** - Check data size before sync (200KB limit implemented)
4. **Enable app checking** - In production, enable Firebase App Check

---

## Quick Reference

| Setting      | Dev                              | Prod                              |
| ------------ | -------------------------------- | --------------------------------- |
| Project ID   | mudir-dev                        | mudir-prod                        |
| Auth Domain  | mudir-dev.firebaseapp.com        | mudir-prod.firebaseapp.com        |
| Database URL | https://mudir-dev.firebaseio.com | https://mudir-prod.firebaseio.com |
