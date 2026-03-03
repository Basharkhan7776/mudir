import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const session = await (auth as any).api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const userDb = await db.collection('databases').findOne({ 
      userId: session.user.id 
    });

    if (!userDb) {
      return NextResponse.json({
        lastSync: null,
        hasData: false,
      });
    }

    return NextResponse.json({
      lastSync: userDb.lastSync,
      dataHash: userDb.dataHash,
      dataSize: userDb.dataSize,
      hasData: true,
    });
  } catch (error) {
    console.error('Status GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
