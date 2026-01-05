```text
  __  __           _ _      
 |  \/  |         | (_)     
 | \  / |_   _  __| |_ _ __ 
 | |\/| | | | |/ _` | | '__|
 | |  | | |_| | (_| | | |   
 |_|  |_|\__,_|\__,_|_|_|   
                            
```

# Mudir

**Professional Inventory & Ledger Management System.**

Mudir is a mobile-first application engineered for efficient business management. It combines dynamic inventory tracking with a comprehensive ledger system, built on a robust, offline-first architecture.

## Tech Stack

*   **Core:** React Native 0.81, Expo 54
*   **Navigation:** Expo Router v6
*   **State Management:** Redux Toolkit (with Debounced Persistence Middleware)
*   **Persistence:** Custom Atomic JSON-based Storage (via `expo-file-system`)
*   **Styling:** NativeWind v4 (Tailwind CSS), Lucide Icons
*   **UI Primitives:** Radix-UI inspired `@rn-primitives`

## Architecture

The application employs a centralized state architecture synchronized with a local file-system database.

*   **Atomic Persistence:** The `JsonDb` class implements atomic write operations to prevent data corruption during I/O.
*   **Reactive Storage:** A custom Redux listener middleware observes state changes and asynchronously persists them to disk after a debounce period (1000ms), ensuring performance and data integrity.
*   **Dynamic Schema:** Inventory collections support dynamic field definitions, allowing flexible data modeling for various business types.

## Project Structure

```text
/app           # File-based routing (Expo Router)
  ├── inventory  # Inventory management & schema builder
  ├── ledger     # Ledger & transaction records
  └── ...        # App entry & layout
/components    # Reusable UI components
  ├── ui         # Low-level primitives (Button, Card, etc.)
  └── ...        # Feature-specific components
/lib           # Core business logic
  ├── db.ts      # JSON Database implementation
  ├── store      # Redux setup & slices
  └── ...        # Utilities (PDF, Export/Import)
```

## Getting Started

Prerequisites: Node.js and Bun (recommended).

1.  **Install Dependencies**
    ```bash
    bun install
    ```

2.  **Start Development Server**
    ```bash
    npx expo start
    ```

3.  **Build**
    ```bash
    npm run build:apk     # Android Preview
    npm run build:android # Android Production
    ```

## Key Features

*   **Dynamic Inventory:** Create custom schemas for products (Text, Number, Date, Select fields).
*   **Ledger System:** Track credits, debits, and party balances.
*   **Data Portability:** JSON-based Import/Export.
*   **PDF Generation:** Generate reports and invoices on the fly.
*   **Offline First:** Complete functionality without network dependency.

---
*Engineered for performance and reliability.*