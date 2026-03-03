import { NextRequest, NextResponse } from 'next/server';
import { auth, getDb } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, codeVerifier } = body;

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const db = await getDb();
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
