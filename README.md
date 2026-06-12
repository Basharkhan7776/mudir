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

## Download

<a https://mudir.basharkhan.in/Mudir-beta.apk">
<img src="https://img.shields.io/badge/Download-Android_App-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Download Android App" />
</a>


## Architecture

The application employs a centralized state architecture synchronized with a local file-system database.

- **Atomic Persistence:** The `JsonDb` class implements atomic write operations to prevent data corruption during I/O.
- **Reactive Storage:** A custom Redux listener middleware observes state changes and asynchronously persists them to disk after a debounce period (1000ms), ensuring performance and data integrity.
- **Dynamic Schema:** Inventory collections support dynamic field definitions, allowing flexible data modeling for various business types.
