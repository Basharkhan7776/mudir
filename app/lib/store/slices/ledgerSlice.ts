import { LedgerEntry, Organization, Transaction } from '@/lib/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LedgerState {
    entries: LedgerEntry[];
}

const initialState: LedgerState = {
    entries: [],
};

const ledgerSlice = createSlice({
    name: 'ledger',
    initialState,
    reducers: {
        setLedger: (state, action: PayloadAction<LedgerEntry[]>) => {
            state.entries = action.payload;
        },
        addOrganization: (state, action: PayloadAction<Organization>) => {
            state.entries.push({ organization: action.payload, transactions: [] });
        },
        addTransaction: (state, action: PayloadAction<{ organizationId: string; transaction: Transaction }>) => {
            const entry = state.entries.find((e) => e.organization.id === action.payload.organizationId);
            if (entry) {
                entry.transactions.push(action.payload.transaction);
            }
        },
        updateOrganization: (state, action: PayloadAction<{ organizationId: string; updates: Partial<Organization> }>) => {
            const entry = state.entries.find((e) => e.organization.id === action.payload.organizationId);
            if (entry) {
                entry.organization = { ...entry.organization, ...action.payload.updates };
            }
        },
        updateTransaction: (state, action: PayloadAction<{ organizationId: string; transactionId: string; updates: Partial<Transaction> }>) => {
            const entry = state.entries.find((e) => e.organization.id === action.payload.organizationId);
            if (entry) {
                const transaction = entry.transactions.find((t) => t.id === action.payload.transactionId);
                if (transaction) {
                    Object.assign(transaction, action.payload.updates);
                }
            }
        },
        deleteTransaction: (state, action: PayloadAction<{ organizationId: string; transactionId: string }>) => {
            const entry = state.entries.find((e) => e.organization.id === action.payload.organizationId);
            if (entry) {
                entry.transactions = entry.transactions.filter((t) => t.id !== action.payload.transactionId);
            }
        },
        deleteOrganization: (state, action: PayloadAction<string>) => {
            state.entries = state.entries.filter((e) => e.organization.id !== action.payload);
        },
        deleteTransactions: (
            state,
            action: PayloadAction<{ organizationId: string; transactionIds: string[] }>
        ) => {
            const { organizationId, transactionIds } = action.payload;
            const entryIndex = state.entries.findIndex((e) => e.organization.id === organizationId);
            if (entryIndex !== -1) {
                state.entries[entryIndex].transactions = state.entries[entryIndex].transactions.filter(
                    (t) => !transactionIds.includes(t.id)
                );
            }
        },
    },
});

export const { setLedger, addOrganization, addTransaction, updateOrganization, updateTransaction, deleteTransaction, deleteTransactions, deleteOrganization } = ledgerSlice.actions;
export default ledgerSlice.reducer;
