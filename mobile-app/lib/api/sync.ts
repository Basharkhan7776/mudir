import Constants from 'expo-constants';
import { getAuthToken } from './auth';
import { DatabaseSchema } from '@/lib/types';

const getEnvVars = () => {
  const extra = Constants.expoConfig?.extra || {};
  return {
    apiUrl: extra.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  };
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
    const token = getAuthToken();
    
    if (!token) {
      return { hasData: false, lastSync: null, dataHash: null, dataSize: null };
    }
    
    const response = await fetch(`${env.apiUrl}/api/sync/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
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

export const pullData = async (): Promise<SyncResult> => {
  try {
    const env = getEnvVars();
    const token = getAuthToken();
    
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }
    
    const response = await fetch(`${env.apiUrl}/api/sync`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
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

export const pushData = async (localData: DatabaseSchema, lastSync: string | null): Promise<SyncResult> => {
  try {
    const env = getEnvVars();
    const token = getAuthToken();
    
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }
    
    const response = await fetch(`${env.apiUrl}/api/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
  const token = getAuthToken();
  
  if (!token) {
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
