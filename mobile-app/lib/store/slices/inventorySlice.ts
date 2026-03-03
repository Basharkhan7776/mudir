import { Collection, CollectionItem } from '@/lib/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InventoryState {
    collections: Collection[];
}

const initialState: InventoryState = {
    collections: [],
};

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        setCollections: (state, action: PayloadAction<Collection[]>) => {
            state.collections = action.payload;
        },
        addCollection: (state, action: PayloadAction<Collection>) => {
            state.collections.push(action.payload);
        },
        addItem: (state, action: PayloadAction<{ collectionId: string; item: CollectionItem }>) => {
            const collection = state.collections.find((c) => c.id === action.payload.collectionId);
            if (collection) {
                collection.data.push(action.payload.item);
            }
        },
        updateItem: (
            state,
            action: PayloadAction<{ collectionId: string; itemId: string; updates: Partial<CollectionItem['values']> }>
        ) => {
            const collection = state.collections.find((c) => c.id === action.payload.collectionId);
            if (collection) {
                const item = collection.data.find((i) => i.id === action.payload.itemId);
                if (item) {
                    item.values = { ...item.values, ...action.payload.updates };
                }
            }
        },
        deleteItem: (state, action: PayloadAction<{ collectionId: string; itemId: string }>) => {
            const collection = state.collections.find((c) => c.id === action.payload.collectionId);
            if (collection) {
                collection.data = collection.data.filter((i) => i.id !== action.payload.itemId);
            }
        },
        deleteCollection: (state, action: PayloadAction<string>) => {
            state.collections = state.collections.filter((c) => c.id !== action.payload);
        },
        updateCollection: (state, action: PayloadAction<Collection>) => {
            const index = state.collections.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) {
                state.collections[index] = action.payload;
            }
        },
    },
});

export const { setCollections, addCollection, addItem, updateItem, deleteItem, deleteCollection, updateCollection } = inventorySlice.actions;
export default inventorySlice.reducer;
