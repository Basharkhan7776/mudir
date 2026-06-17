```text
  __  __           _ _
 |  \/  |         | (_)
 | \  / |_   _  __| |_ _ __
 | |\/| | | | |/ _` | | '__|
 | |  | | |_| | (_| | | |
 |_|  |_|\__,_|_|_|_|_|

 ```

# Mudir

**Professional Inventory & Ledger Management System.**

Mudir is a mobile-first application engineered for efficient business management. It combines dynamic inventory tracking with a comprehensive ledger system, built on a robust, offline-first architecture.

## Download

<a href="https://mudir.basharkhan.com/Mudir-beta.apk">
<img src="https://img.shields.io/badge/Download-Android_App-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Download Android App" />
</a>


## Environment Configuration

### Environment Template (`apps/app/.env`)

```env
# Environment
ENVIRONMENT=development

# Server URL (your Better Auth backend)
EXPO_PUBLIC_SERVER_URL=http://localhost:3001

# Google OAuth (Web Client ID for OAuth consent screen)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

### Server (`apps/server/.env`)

```env
# Server configuration
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mudir
```

## Key Features

###  Inventory Management
- **Dynamic Collections**: Create flexible data models with custom fields
- **Multi-type Fields**: Support for text, numbers, currency, dates, booleans, and select fields
- **CRUD Operations**: Full create, read, update, and delete functionality
- **Stock Tracking**: Real-time inventory levels with quantity management

###  Ledger Management
- **Organization Tracking**: Manage multiple business entities
- **Transaction History**: Comprehensive financial records with tags
- **Dual Entry System**: Support for both CREDIT and DEBIT transactions
- **Export/Import**: Backup and restore functionality

###  Authentication & Security
- **Google OAuth**: Secure sign-in with Google accounts
- **Session Management**: Persistent authentication across app sessions
- **Secure Storage**: Encrypted storage of sensitive data

###  Synchronization
- **Offline-First**: Full functionality without internet connectivity
- **Bidirectional Sync**: Keep local and remote data in sync
- **Conflict Resolution**: Intelligent handling of data conflicts
- **Size Limits**: 200KB data cap for efficient syncing

###  Performance
- **Atomic Persistence**: Prevents data corruption during writes
- **Reactive Storage**: Automatic saves with 1000ms debounce
- **Dynamic Schema**: Adaptable data structures for various business needs

## Architecture

### Core Architecture

The application employs a centralized state architecture synchronized with a local file-system database.

- **Atomic Persistence:** The `JsonDb` class implements atomic write operations to prevent data corruption during I/O.
- **Reactive Storage:** A custom Redux listener middleware observes state changes and asynchronously persists them to disk after a debounce period (1000ms), ensuring performance and data integrity.
- **Dynamic Schema:** Inventory collections support dynamic field definitions, allowing flexible data modeling for various business types.

### Technology Stack

- **Frontend**: React Native (Expo) with TypeScript
- **State Management**: Redux Toolkit
- **Backend**: Node.js with Express and MongoDB
- **Authentication**: Better Auth with Google OAuth
- **Build Tools**: Turbo, Bun
- **Styling**: NativeWind

## Development

### Running the App

```bash
# Install dependencies
bun install

# Run all apps in development mode
bun run dev

# Build all apps
bun run build

# Run tests
bun run lint
bun run check-types
```

### Mobile App Development

```bash
# Navigate to mobile app directory
cd apps/app

# Start development server
bun run dev

# Build for production
bun run build
```

### Server Development

```bash
# Navigate to server directory
cd apps/server

# Start development server
bun run dev

# Start production server
bun run start
```
