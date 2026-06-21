import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Receipt, ReceiptItem } from '@mudir/types';

interface ReceiptsState {
  list: Receipt[];
}

const initialState: ReceiptsState = {
  list: [],
};

const receiptsSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    setReceipts(state, action: PayloadAction<Receipt[]>) {
      state.list = action.payload;
    },
    addReceipt(state, action: PayloadAction<Receipt>) {
      state.list.push(action.payload);
    },
    updateReceipt(state, action: PayloadAction<Receipt>) {
      const index = state.list.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteReceipt(state, action: PayloadAction<string>) {
      state.list = state.list.filter((r) => r.id !== action.payload);
    },
    addReceiptItem(state, action: PayloadAction<{ receiptId: string; item: ReceiptItem }>) {
      const receipt = state.list.find((r) => r.id === action.payload.receiptId);
      if (receipt) {
        receipt.items.push(action.payload.item);
        receipt.updatedAt = new Date().toISOString();
      }
    },
    removeReceiptItem(state, action: PayloadAction<{ receiptId: string; itemId: string }>) {
      const receipt = state.list.find((r) => r.id === action.payload.receiptId);
      if (receipt) {
        receipt.items = receipt.items.filter((i) => i.id !== action.payload.itemId);
        receipt.updatedAt = new Date().toISOString();
      }
    },
    updateReceiptItem(state, action: PayloadAction<{ receiptId: string; item: ReceiptItem }>) {
      const receipt = state.list.find((r) => r.id === action.payload.receiptId);
      if (receipt) {
        const itemIndex = receipt.items.findIndex(i => i.id === action.payload.item.id);
        if (itemIndex !== -1) {
          receipt.items[itemIndex] = action.payload.item;
          receipt.updatedAt = new Date().toISOString();
        }
      }
    },
  },
});

export const {
  setReceipts,
  addReceipt,
  updateReceipt,
  deleteReceipt,
  addReceiptItem,
  removeReceiptItem,
  updateReceiptItem,
} = receiptsSlice.actions;

export default receiptsSlice.reducer;
