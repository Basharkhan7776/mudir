import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/auth';
import { headers } from 'next/headers';
import crypto from 'crypto';

const MAX_DATA_SIZE_BYTES = 200 * 1024; // 200KB

function calculateDataHash(data: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 16);
}

function getDataSize(data: unknown): number {
  return JSON.stringify(data).length;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export async function GET(req: NextRequest) {
  try {
    const session = await (auth as any).api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const userDb = await db.collection('databases').findOne({ userId: session.user.id });

    if (!userDb) {
      return NextResponse.json({
        data: null,
        lastSync: null,
        message: 'No data found',
      });
    }

    return NextResponse.json({
      data: userDb.data,
      lastSync: userDb.lastSync,
      dataHash: userDb.dataHash,
    });
  } catch (error) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await (auth as any).api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { data, lastSync } = body;

    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const dataSize = getDataSize(data);
    if (dataSize > MAX_DATA_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Data size (${formatBytes(dataSize)}) exceeds limit of ${formatBytes(MAX_DATA_SIZE_BYTES)}. Please reduce data before syncing.`,
        },
        { status: 413 }
      );
    }

    const db = await getDb();
    const userId = session.user.id;
    const dataHash = calculateDataHash(data);
    const now = new Date().toISOString();

    const existing = await db.collection('databases').findOne({ userId });

    if (existing) {
      const serverLastSync = existing.lastSync;
      
      if (lastSync && serverLastSync > lastSync) {
        return NextResponse.json({
          conflict: true,
          serverData: existing.data,
          lastSync: serverLastSync,
          message: 'Server has newer data',
        });
      }

      await db.collection('databases').updateOne(
        { userId },
        {
          $set: {
            data,
            lastSync: now,
            dataHash,
            dataSize,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      await db.collection('databases').insertOne({
        userId,
        data,
        lastSync: now,
        dataHash,
        dataSize,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      lastSync: now,
      dataHash,
    });
  } catch (error) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
