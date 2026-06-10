import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { DatabaseSchema } from '@/lib/types';
import { Alert } from 'react-native';

const docDir = FileSystem.documentDirectory;
const DB_FILE = (docDir || '') + 'mudir_db.json';

// export async function exportData(data: DatabaseSchema): Promise<boolean> {
export async function exportData(): Promise<boolean> {
  try {
    console.log('[Export] Checking DB file at:', DB_FILE);
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(DB_FILE);
    console.log('[Export] File info:', fileInfo);

    if (!fileInfo.exists) {
      console.warn('[Export] DB file does not exist');
      Alert.alert('Error', 'No data to export');
      return false;
    }

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    console.log('[Export] Sharing available:', isAvailable);
    if (!isAvailable) {
      Alert.alert('Error', 'Sharing is not available on this device');
      return false;
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const exportFileName = `mudir_backup_${timestamp}.json`;
    if (!docDir) throw new Error('Document directory is not available');
    const exportPath = docDir + exportFileName;
    console.log('[Export] Export path:', exportPath);

    // Copy the database file to a new file with timestamp
    await FileSystem.copyAsync({
      from: DB_FILE,
      to: exportPath,
    });
    console.log('[Export] File copied successfully');

    // Share the file
    await Sharing.shareAsync(exportPath, {
      mimeType: 'application/json',
      dialogTitle: 'Export SRM Data',
      UTI: 'public.json',
    });
    console.log('[Export] Share dialog closed');

    // Clean up the temporary export file
    await FileSystem.deleteAsync(exportPath, { idempotent: true });
    console.log('[Export] Temp file cleaned up');

    return true;
  } catch (error) {
    console.error('[Export] Export error:', error);
    Alert.alert('Export Failed', 'An error occurred while exporting data');
    return false;
  }
}

export async function importData(): Promise<DatabaseSchema | null> {
  try {
    // Pick a file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    // Read the file content
    const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);

    // Parse JSON
    const data = JSON.parse(fileContent) as DatabaseSchema;

    // Basic validation
    if (!data.meta || !data.collections || !data.ledger) {
      Alert.alert('Invalid File', 'The selected file is not a valid SRM backup');
      return null;
    }

    // Confirm import
    return new Promise((resolve) => {
      Alert.alert(
        'Import Data',
        'This will replace all current data. Are you sure you want to continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
          {
            text: 'Import',
            style: 'destructive',
            onPress: () => resolve(data),
          },
        ]
      );
    });
  } catch (error) {
    console.error('Import error:', error);
    Alert.alert(
      'Import Failed',
      'An error occurred while importing data. Please check if the file is valid.'
    );
    return null;
  }
}
