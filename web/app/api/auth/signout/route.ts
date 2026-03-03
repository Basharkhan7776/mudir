import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await (auth as any).api.getSession({
      headers: await headers(),
    });

    if (!session?.session) {
      return NextResponse.json({ success: true });
    }

    await (auth as any).api.deleteSession({
      headers: await headers(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
