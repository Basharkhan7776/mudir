import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const session = await (auth as any).api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null 
      }, { status: 200 });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      expiresAt: session.session.expiresAt,
    });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json({ 
      isAuthenticated: false,
      user: null 
    }, { status: 200 });
  }
}
