import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  lastSync: string | null;
  isSyncing: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  lastSync: null,
  isSyncing: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
      state.isLoggedIn = action.payload !== null;
    },
    setLastSync: (state, action: PayloadAction<string | null>) => {
      state.lastSync = action.payload;
    },
    setIsSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.lastSync = null;
    },
  },
});

export const { setUser, setLastSync, setIsSyncing, logout } = authSlice.actions;
export default authSlice.reducer;
