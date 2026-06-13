import Constants from 'expo-constants';
import { authFetch, getSession } from './auth';
import { DatabaseSchema } from '@/lib/types';

const MAX_DATA_SIZE_BYTES = 200 * 1024; // 200KB

const getEnvVars = () => {
  const extra = Constants.expoConfig?.extra || {};
  return {
    apiUrl:
      process.env.EXPO_PUBLIC_SERVER_URL || extra.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3001',
  };
};

const getDataSize = (data: unknown): number => {
  return JSON.stringify(data).length;
};

const isDataSizeValid = (data: unknown): boolean => {
  const size = getDataSize(data);
  return size <= MAX_DATA_SIZE_BYTES;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

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

export const getSyncStatus = async (): Promise<{
  hasData: boolean;
  lastSync: string | null;
  dataHash: string | null;
  dataSize: number | null;
}> => {
  try {
    const env = getEnvVars();
    const session = await getSession();

    if (!session) {
      return { hasData: false, lastSync: null, dataHash: null, dataSize: null };
    }

    const response = await authFetch(`${env.apiUrl}/api/sync/status`);
    console.log('[Sync] getStatus response:', response);

    if (!response.ok) {
      return { hasData: false, lastSync: null, dataHash: null, dataSize: null };
    }

    const data = await response.json();
    return {
      hasData: data.hasData,
      lastSync: data.lastSync,
      dataHash: data.dataHash,
      dataSize: data.dataSize,
    };
  } catch (error) {
    console.error('[Sync] Get status error:', error);
    return { hasData: false, lastSync: null, dataHash: null, dataSize: null };
  }
};

export const checkSyncStatus = async (): Promise<{
  hasData: boolean;
  lastSync: string | null;
  dataSize: number | null;
}> => {
  return getSyncStatus();
};

export const pullData = async (): Promise<SyncResult> => {
  try {
    const env = getEnvVars();
    const session = await getSession();

    if (!session) {
      return { success: false, message: 'Not authenticated' };
    }

    const response = await authFetch(`${env.apiUrl}/api/sync`);

    if (!response.ok) {
      return { success: false, message: 'Failed to fetch data' };
    }

    const data = await response.json();

    if (!data.data) {
      return { success: false, message: 'No data found' };
    }

    return {
      success: true,
      message: 'Data pulled successfully',
      data: data.data,
      action: 'pulled',
    };
  } catch (error) {
    console.error('[Sync] Pull error:', error);
    return { success: false, message: 'Failed to pull data' };
  }
};

export const pushData = async (
  localData: DatabaseSchema,
  lastSync: string | null
): Promise<SyncResult> => {
  try {
    const env = getEnvVars();
    const session = await getSession();

    if (!session) {
      return { success: false, message: 'Not authenticated' };
    }

    if (!isDataSizeValid(localData)) {
      const currentSize = getDataSize(localData);
      return {
        success: false,
        message: `Data size (${formatBytes(currentSize)}) exceeds limit of ${formatBytes(MAX_DATA_SIZE_BYTES)}. Please reduce data before syncing.`,
      };
    }

    const response = await authFetch(`${env.apiUrl}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: localData,
        lastSync,
      }),
    });

    if (!response.ok) {
      return { success: false, message: 'Failed to push data' };
    }

    const result = await response.json();

    if (result.conflict) {
      return {
        success: false,
        message: result.message || 'Conflict detected',
        data: result.serverData,
        action: 'none',
      };
    }

    return {
      success: true,
      message: 'Data pushed successfully',
      action: 'pushed',
    };
  } catch (error) {
    console.error('[Sync] Push error:', error);
    return { success: false, message: 'Failed to push data' };
  }
};

export const syncData = async (localData: DatabaseSchema): Promise<SyncResult> => {
  const session = await getSession();

  if (!session) {
    return { success: false, message: 'Not authenticated' };
  }

  const status = await getSyncStatus();
  const localLastUpdate = localData.meta?.exportDate || new Date(0).toISOString();
  const remoteLastUpdate = status.lastSync || new Date(0).toISOString();

  const hasLocalData = localData.collections?.length > 0 || localData.ledger?.length > 0;
  const hasRemoteData = status.hasData;

  if (!hasRemoteData && hasLocalData) {
    return pushData(localData, null);
  }

  if (hasRemoteData && !hasLocalData) {
    return pullData();
  }

  if (hasRemoteData && hasLocalData) {
    const localDate = new Date(localLastUpdate);
    const remoteDate = new Date(remoteLastUpdate);

    if (localDate > remoteDate) {
      return pushData(localData, status.lastSync);
    } else if (remoteDate > localDate) {
      return pullData();
    } else {
      return {
        success: true,
        message: 'Data is up to date',
        action: 'none',
      };
    }
  }

  return { success: false, message: 'No data to sync' };
};
