import Constants from 'expo-constants';
import { authFetch, getSession } from './auth';
import { DatabaseSchema } from '@mudir/types';

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

    const res = await authFetch(`${env.apiUrl}/api/sync/status`, {
      cache: 'no-store' as any,
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
    console.log('[Sync] getStatus result:', res);

    if (res.error || !res.data) {
      const errMsg = res.error?.message || res.error?.error || 'Failed to get status';
      console.log('[Sync] getStatus failed:', errMsg);
      return { hasData: false, lastSync: null, dataHash: null, dataSize: null };
    }

    const payload = res.data;
    console.log('[Sync] getStatus payload hasData=', payload.hasData, 'lastSync=', payload.lastSync);
    return {
      hasData: payload.hasData,
      lastSync: payload.lastSync,
      dataHash: payload.dataHash,
      dataSize: payload.dataSize,
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

    const res = await authFetch(`${env.apiUrl}/api/sync/download`, {
      cache: 'no-store' as any,
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
    console.log('[Sync] download result:', res);

    if (res.error || !res.data) {
      const msg = res.error?.message || res.error?.error || 'Failed to fetch data';
      return { success: false, message: msg };
    }

    const payload = res.data;

    if (!payload.data) {
      return { success: false, message: payload.message || 'No data found' };
    }

    return {
      success: true,
      message: payload.message || 'Data downloaded successfully',
      data: payload.data,
      action: 'pulled',
    };
  } catch (error) {
    console.error('[Sync] Download error:', error);
    return { success: false, message: 'Failed to download data' };
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

    const res = await authFetch(`${env.apiUrl}/api/sync/upload`, {
      method: 'POST',
      // better-fetch will set correct Content-Type + stringify for object body
      body: {
        data: localData,
        lastSync,
      },
    });
    console.log('[Sync] upload result:', res);

    if (res.error || !res.data) {
      const msg = res.error?.message || res.error?.error || 'Failed to upload data';
      return { success: false, message: msg };
    }

    const payload = res.data;

    if (payload.conflict) {
      return {
        success: false,
        message: payload.message || 'Conflict detected',
        data: payload.serverData,
        action: 'none',
      };
    }

    return {
      success: true,
      message: payload.message || 'Data uploaded successfully',
      action: 'pushed',
    };
  } catch (error) {
    console.error('[Sync] Upload error:', error);
    return { success: false, message: 'Failed to upload data' };
  }
};

// DEPRECATED: syncData contained automated/smart decision logic for bidirectional sync.
// We now use explicit pushData (upload) and pullData (download) directly from UI.
// The function is kept only for potential backward compat but should not be called for new flows.
export const syncData = async (localData: DatabaseSchema): Promise<SyncResult> => {
  // For new explicit upload/download, call pushData / pullData directly instead.
  // This function is intentionally left with old logic but marked deprecated.
  console.warn('[Sync] syncData is deprecated. Use pushData for upload or pullData for download explicitly.');
  return { success: false, message: 'Deprecated syncData called - use explicit upload/download' };
};
