import { getDatabase } from 'firebase/database';
import { ref, get, set } from 'firebase/database';
import { getCurrentUser } from './auth';
import { environment } from './config';
import { DatabaseSchema } from '@/lib/types';

export const MAX_DATA_SIZE_BYTES = 200 * 1024; // 200KB

export interface SyncMetadata {
  lastSync: string;
  dataHash: string;
  dataSize: number;
}

export interface SyncResult {
  success: boolean;
  message: string;
  data?: DatabaseSchema;
  action?: 'pushed' | 'pulled' | 'none';
}

const generateHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

const getDataSize = (data: any): number => {
  return new Blob([JSON.stringify(data)]).size;
};

const isDataSizeValid = (data: any): boolean => {
  const size = getDataSize(data);
  return size <= MAX_DATA_SIZE_BYTES;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

export const getUserDataRef = (userId: string) => {
  const rtdb = getDatabase();
  return ref(rtdb, `users/${userId}/data`);
};

export const getUserMetadataRef = (userId: string) => {
  const rtdb = getDatabase();
  return ref(rtdb, `users/${userId}/metadata`);
};

export const fetchRemoteData = async (
  userId: string
): Promise<{
  data: DatabaseSchema | null;
  metadata: SyncMetadata | null;
}> => {
  try {
    const dataRef = getUserDataRef(userId);
    const metadataRef = getUserMetadataRef(userId);

    const [dataSnapshot, metadataSnapshot] = await Promise.all([get(dataRef), get(metadataRef)]);

    if (!dataSnapshot.exists()) {
      return { data: null, metadata: null };
    }

    const data = dataSnapshot.val() as DatabaseSchema;
    const metadata = metadataSnapshot.exists() ? (metadataSnapshot.val() as SyncMetadata) : null;

    console.log('[Sync] Fetched remote data, size:', formatBytes(getDataSize(data)));

    return { data, metadata };
  } catch (error) {
    console.error('[Sync] Error fetching remote data:', error);
    return { data: null, metadata: null };
  }
};

export const pushDataToRemote = async (
  userId: string,
  localData: DatabaseSchema
): Promise<SyncResult> => {
  try {
    if (!isDataSizeValid(localData)) {
      const currentSize = getDataSize(localData);
      return {
        success: false,
        message: `Data size (${formatBytes(currentSize)}) exceeds limit of ${formatBytes(MAX_DATA_SIZE_BYTES)}. Please reduce data before syncing.`,
      };
    }

    const dataRef = getUserDataRef(userId);
    const metadataRef = getUserMetadataRef(userId);

    const dataString = JSON.stringify(localData);
    const dataHash = generateHash(dataString);

    const metadata: SyncMetadata = {
      lastSync: new Date().toISOString(),
      dataHash,
      dataSize: getDataSize(localData),
    };

    await Promise.all([set(dataRef, localData), set(metadataRef, metadata)]);

    console.log('[Sync] Data pushed to remote successfully');

    return {
      success: true,
      message: 'Data synced to cloud successfully',
      action: 'pushed',
    };
  } catch (error) {
    console.error('[Sync] Error pushing data:', error);
    return {
      success: false,
      message: 'Failed to sync data to cloud',
    };
  }
};

export const pullDataFromRemote = async (userId: string): Promise<SyncResult> => {
  try {
    const { data, metadata } = await fetchRemoteData(userId);

    if (!data) {
      return {
        success: false,
        message: 'No data found in cloud',
      };
    }

    if (!isDataSizeValid(data)) {
      return {
        success: false,
        message: 'Cloud data exceeds 200KB limit',
      };
    }

    console.log('[Sync] Data pulled from remote, size:', formatBytes(getDataSize(data)));

    return {
      success: true,
      message: 'Data synced from cloud successfully',
      data,
      action: 'pulled',
    };
  } catch (error) {
    console.error('[Sync] Error pulling data:', error);
    return {
      success: false,
      message: 'Failed to sync data from cloud',
    };
  }
};

export const syncData = async (localData: DatabaseSchema): Promise<SyncResult> => {
  const user = getCurrentUser();

  if (!user) {
    return {
      success: false,
      message: 'User not logged in',
    };
  }

  console.log(`[Sync] Starting sync for user: ${user.uid} (${environment.name})`);

  const { data: remoteData, metadata } = await fetchRemoteData(user.uid);

  const localLastUpdate = localData.meta?.exportDate || new Date(0).toISOString();
  const remoteLastUpdate = metadata?.lastSync || new Date(0).toISOString();

  console.log('[Sync] Local last update:', localLastUpdate);
  console.log('[Sync] Remote last update:', remoteLastUpdate);

  const hasLocalData = localData.collections?.length > 0 || localData.ledger?.length > 0;
  const hasRemoteData = remoteData !== null;

  if (!hasRemoteData && hasLocalData) {
    console.log('[Sync] No remote data, pushing local data');
    return pushDataToRemote(user.uid, localData);
  }

  if (hasRemoteData && !hasLocalData) {
    console.log('[Sync] No local data, pulling remote data');
    return pullDataFromRemote(user.uid);
  }

  if (hasRemoteData && hasLocalData) {
    const localDate = new Date(localLastUpdate);
    const remoteDate = new Date(remoteLastUpdate);

    if (localDate > remoteDate) {
      console.log('[Sync] Local data is newer, pushing to remote');
      return pushDataToRemote(user.uid, localData);
    } else if (remoteDate > localDate) {
      console.log('[Sync] Remote data is newer, pulling from remote');
      return pullDataFromRemote(user.uid);
    } else {
      console.log('[Sync] Data is up to date');
      return {
        success: true,
        message: 'Data is already up to date',
        action: 'none',
      };
    }
  }

  return {
    success: false,
    message: 'No data to sync',
  };
};

export const checkSyncStatus = async (): Promise<{
  hasData: boolean;
  lastSync: string | null;
  dataSize: number | null;
}> => {
  const user = getCurrentUser();

  if (!user) {
    return { hasData: false, lastSync: null, dataSize: null };
  }

  const { metadata } = await fetchRemoteData(user.uid);

  if (!metadata) {
    return { hasData: false, lastSync: null, dataSize: null };
  }

  return {
    hasData: true,
    lastSync: metadata.lastSync,
    dataSize: metadata.dataSize,
  };
};
