import { AppMeta } from '@/lib/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  appVersion: string;
  organizationName: string;
  userCurrency: string;
  exportDate: string;
  isNewUser?: boolean;
}

const initialState: SettingsState = {
  appVersion: '1.0.0',
  organizationName: '',
  userCurrency: '₹',
  exportDate: new Date().toISOString(),
  isNewUser: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<AppMeta>) => {
      state.appVersion = action.payload.appVersion;
      state.organizationName = action.payload.organizationName;
      state.userCurrency = action.payload.userCurrency;
      state.exportDate = action.payload.exportDate;
      if (action.payload.isNewUser !== undefined) {
        state.isNewUser = action.payload.isNewUser;
      }
    },
    updateOrganizationName: (state, action: PayloadAction<string>) => {
      state.organizationName = action.payload;
    },
    updateCurrency: (state, action: PayloadAction<string>) => {
      state.userCurrency = action.payload;
    },
    completeOnboarding: (state) => {
      state.isNewUser = false;
    },
  },
});

export const { setSettings, updateOrganizationName, updateCurrency, completeOnboarding } = settingsSlice.actions;
export default settingsSlice.reducer;
