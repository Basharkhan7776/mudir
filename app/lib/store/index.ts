import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import inventoryReducer, { setCollections } from './slices/inventorySlice';
import ledgerReducer, { setLedger } from './slices/ledgerSlice';
import settingsReducer, { setSettings } from './slices/settingsSlice';
import authReducer from './slices/authSlice';
import { db } from '@/lib/db';

const listenerMiddleware = createListenerMiddleware();

// Listener to save state changes to DB
// Listener to save state changes to DB
listenerMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    return true;
  },
  effect: async (action, listenerApi) => {
    // Cancel any pending write task
    listenerApi.cancelActiveListeners();

    // Wait for 1000ms of inactivity (debounce)
    await listenerApi.delay(1000);

    const state = listenerApi.getState() as RootState;
    await db.write({
      meta: {
        appVersion: state.settings.appVersion,
        exportDate: new Date().toISOString(),
        userCurrency: state.settings.userCurrency,
        organizationName: state.settings.organizationName,
        isNewUser: state.settings.isNewUser,
      },
      collections: state.inventory.collections,
      ledger: state.ledger.entries,
    });
  },
});

export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    ledger: ledgerReducer,
    settings: settingsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

// Initialize store from DB
db.init()
  .then((data) => {
    console.log('DB initialized with data:', JSON.stringify(data, null, 2));
    store.dispatch(setCollections(data.collections));
    store.dispatch(setLedger(data.ledger));
    store.dispatch(setSettings(data.meta));
  })
  .catch((error) => {
    console.error('Failed to initialize DB:', error);
  });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
