import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  AppMeta,
  SchemaField,
  CollectionItem,
  Collection,
  Transaction,
  Organization,
  LedgerEntry,
  DatabaseSchema as DatabaseData
} from '@mudir/types';

export interface IDatabase extends Document {
  userId: string;
  data: DatabaseData;
  lastSync: string;
  dataHash: string;
  dataSize: number;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionItemSchema = new Schema<CollectionItem>({
  id: { type: String, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String },
  values: { type: Schema.Types.Mixed },
}, { _id: false });

const SchemaFieldSchema = new Schema<SchemaField>({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  options: [String],
  required: Boolean,
  defaultValue: Schema.Types.Mixed,
}, { _id: false });

const CollectionSchema = new Schema<Collection>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  schema: [SchemaFieldSchema],
  data: [CollectionItemSchema],
}, { _id: false });

const OrganizationSchema = new Schema<Organization>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  phone: String,
  email: String,
}, { _id: false });

const TransactionSchema = new Schema<Transaction>({
  id: { type: String, required: true },
  organizationId: { type: String, required: true },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  remark: String,
  attachment: String,
  tags: [String],
}, { _id: false });

const LedgerEntrySchema = new Schema<LedgerEntry>({
  organization: { type: OrganizationSchema, required: true },
  transactions: { type: [TransactionSchema], required: true },
}, { _id: false });

const AppMetaSchema = new Schema<AppMeta>({
  appVersion: { type: String, required: true },
  exportDate: { type: String, required: true },
  userCurrency: { type: String, required: true },
  organizationName: { type: String, required: true },
  isNewUser: Boolean,
}, { _id: false });

const DatabaseDataSchema = new Schema<DatabaseData>({
  meta: { type: AppMetaSchema, required: true },
  collections: { type: [CollectionSchema], required: true },
  ledger: { type: [LedgerEntrySchema], required: true },
}, { _id: false });

const DatabaseSchema = new Schema<IDatabase>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    data: { type: DatabaseDataSchema, required: true },
    lastSync: { type: String, required: true },
    dataHash: { type: String, required: true },
    dataSize: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const Database: Model<IDatabase> = mongoose.models.Database || mongoose.model<IDatabase>('Database', DatabaseSchema);
