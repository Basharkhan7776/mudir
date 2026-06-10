import * as FileSystem from 'expo-file-system/legacy';
import { DatabaseSchema } from './types';
import { seedData } from './seedData';

const docDir = FileSystem.documentDirectory;
if (!docDir) {
  console.error('FileSystem.documentDirectory is null!');
}
const DB_FILE = (docDir || '') + 'mudir_db.json';
const TEMP_DB_FILE = (docDir || '') + 'mudir_db.tmp';

const INITIAL_DB: DatabaseSchema = {
    meta: {
        appVersion: '1.0.0',
        exportDate: new Date().toISOString(),
        userCurrency: '₹',
        organizationName: '',
        isNewUser: false,
    },
    collections: seedData.collections,
    ledger: seedData.ledger,
};

class JsonDb {
    private isWriting = false;

    async init(): Promise<DatabaseSchema> {
        try {
            console.log('Initializing DB at path:', DB_FILE);
            const fileInfo = await FileSystem.getInfoAsync(DB_FILE);
            console.log('File info:', fileInfo);
            if (!fileInfo.exists) {
                console.log('DB file does not exist, creating with initial seed data');
                await this.write(INITIAL_DB);
                return INITIAL_DB;
            }
            console.log('DB file exists, reading data');
            return this.read();
        } catch (error) {
            console.error('Error in DB init:', error);
            // Fallback to seed data if read fails to prevent app crash on startup
            return INITIAL_DB;
        }
    }

    async read(): Promise<DatabaseSchema> {
        try {
            const content = await FileSystem.readAsStringAsync(DB_FILE);
            // Validate JSON before returning
            const parsed = JSON.parse(content);
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Invalid JSON content');
            }
            return parsed;
        } catch (error) {
            console.error('Failed to read DB:', error);
            throw error; // Re-throw to be handled by init or caller
        }
    }

    async write(data: DatabaseSchema): Promise<void> {
        if (this.isWriting) {
            console.log('Write already in progress, skipping...');
            return;
        }

        this.isWriting = true;
        try {
            // Write to temp file first (Atomic Write pattern)
            await FileSystem.writeAsStringAsync(TEMP_DB_FILE, JSON.stringify(data, null, 2));

            // Move temp file to actual DB file
            // Expo FileSystem doesn't have a direct 'move' that overwrites, so we might need to delete then move, 
            // or copy. copyAsync supports simple copy. moveAsync moves.
            // Let's try moveAsync. If destination exists, it might fail? 
            // Documentation says: "If the destination already exists, the method will confuse it with a directory if options are not provided (not really, but behavior varies)."
            // Safer to copy to dest then delete temp. OR delete dest then move temp.
            // Safest: Delete Dest (if exists) -> Move Temp to Dest.

            const dbFileInfo = await FileSystem.getInfoAsync(DB_FILE);
            if (dbFileInfo.exists) {
                await FileSystem.deleteAsync(DB_FILE, { idempotent: true });
            }

            await FileSystem.moveAsync({
                from: TEMP_DB_FILE,
                to: DB_FILE
            });

        } catch (error) {
            console.error('Failed to write DB:', error);
        } finally {
            this.isWriting = false;
        }
    }
}

export const db = new JsonDb();
