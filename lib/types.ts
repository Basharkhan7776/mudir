export type SchemaFieldType = 'text' | 'number' | 'select' | 'currency' | 'date' | 'boolean' | 'image';

export type SchemaField = {
  key: string;
  label: string;
  type: SchemaFieldType;
  options?: string[];
  required?: boolean;
  defaultValue?: any;
};

export type CollectionItem = {
  id: string;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
  values: Record<string, any>;
};

export type Collection = {
  id: string;
  name: string;
  description?: string;
  schema: SchemaField[];
  data: CollectionItem[];
};

export type TransactionType = 'CREDIT' | 'DEBIT';

export type Transaction = {
  id: string;
  organizationId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string
  remark?: string;
  attachment?: string | null;
  tags?: string[];
};

export type Organization = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

export type LedgerEntry = {
  organization: Organization;
  transactions: Transaction[];
};

export type AppMeta = {
  appVersion: string;
  exportDate: string;
  userCurrency: string;
  organizationName: string;
  isNewUser?: boolean;
};

export type DatabaseSchema = {
  meta: AppMeta;
  collections: Collection[];
  ledger: LedgerEntry[];
};
