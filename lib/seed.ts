import { db } from '../lib/db';
import { seedData } from './seedData';
import { DatabaseSchema } from './types';

export function getSeedData(): DatabaseSchema {
  return seedData;
}

export function getEmptyData(): DatabaseSchema {
  return {
    meta: {
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      userCurrency: '₹',
      organizationName: '',
      isNewUser: true,
    },
    collections: [],
    ledger: [],
  };
}
