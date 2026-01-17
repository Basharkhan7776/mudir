import { db } from '../lib/db';
import { seedData } from './seedData';
import { DatabaseSchema } from './types';

export async function seedDatabase() {
  try {
    console.log('[Seed] Starting database seeding...');
    await db.write(seedData);
    console.log('[Seed] Database seeded successfully!');
    // console.log('Seed data:', JSON.stringify(seedData, null, 2));
    return true;
  } catch (error) {
    console.error('[Seed] Failed to seed database:', error);
    return false;
  }
}

export async function clearDatabase() {
  try {
    console.log('[Seed] Clearing database...');
    await db.write({
      meta: {
        appVersion: '1.0.0',
        exportDate: new Date().toISOString(),
        userCurrency: '₹',
        organizationName: '',
        isNewUser: true,
      },
      collections: [],
      ledger: [],
    });
    console.log('[Seed] Database cleared successfully!');
    return true;
  } catch (error) {
    console.error('[Seed] Failed to clear database:', error);
    return false;
  }
}

export function getSeedData(): DatabaseSchema {
  return seedData;
}
