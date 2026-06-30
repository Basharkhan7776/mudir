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

    const res = await authFetch(`${env.apiUrl}/api/sync`, {
      cache: 'no-store' as any,
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
    console.log('[Sync] pull result:', res);

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
      message: payload.message || 'Data pulled successfully',
      data: payload.data,
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

    const res = await authFetch(`${env.apiUrl}/api/sync`, {
      method: 'POST',
      // better-fetch will set correct Content-Type + stringify for object body
      body: {
        data: localData,
        lastSync,
      },
    });
    console.log('[Sync] push result:', res);

    if (res.error || !res.data) {
      const msg = res.error?.message || res.error?.error || 'Failed to push data';
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
      message: payload.message || 'Data pushed successfully',
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

  const hasLocalData =
    localData.collections?.length > 0 ||
    localData.ledger?.length > 0 ||
    localData.receipts?.length > 0;
  const hasRemoteData = status.hasData;

  // Heuristic: treat unmodified demo/seed data (no org name set) as "not real local data"
  // so that a fresh app after login will download remote data instead of pushing mock.
  const looksSeeded =
    !localData.meta?.organizationName ||
    localData.meta.organizationName === '' ||
    localData.meta.organizationName === 'Demo Store';

  console.log('[Sync] syncData decision', {
    hasRemoteData,
    hasLocalData,
    looksSeeded,
    localLastUpdate,
    remoteLastUpdate,
  });

  if (!hasRemoteData && hasLocalData) {
    console.log('[Sync] decision: push (no remote)');
    return pushData(localData, null);
  }

  if (hasRemoteData && !hasLocalData) {
    console.log('[Sync] decision: pull (no local)');
    return pullData();
  }

  if (hasRemoteData && hasLocalData) {
    const effectiveLocal = looksSeeded ? new Date(0).toISOString() : localLastUpdate;
    const localDate = new Date(effectiveLocal);
    const remoteDate = new Date(remoteLastUpdate);

    console.log('[Sync] compare dates (effectiveLocal for seeded?)', { looksSeeded, localDate, remoteDate });

    if (localDate > remoteDate) {
      console.log('[Sync] decision: push (local newer)');
      return pushData(localData, status.lastSync);
    } else {
      // remote newer or equal or seeded -> prefer pull (download wins for new/mock apps)
      console.log('[Sync] decision: pull (remote newer or seeded local)');
      return pullData();
    }
  }

  return { success: false, message: 'No data to sync' };
};
