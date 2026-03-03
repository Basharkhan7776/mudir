import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const redirectUrl = searchParams.get('redirect_url') || 'mudir://auth-callback';

    const session = await (auth as any).api.getSession({
      headers: req.headers,
    });

    if (!session?.session) {
      return NextResponse.redirect(`${redirectUrl}?error=no_session`);
    }

    const token = session.session.token;

    return NextResponse.redirect(`${redirectUrl}?token=${token}`);
  } catch (error) {
    console.error('Mobile signin error:', error);
    const { searchParams } = new URL(req.url);
    const redirectUrl = searchParams.get('redirect_url') || 'mudir://auth-callback';
    return NextResponse.redirect(`${redirectUrl}?error=server_error`);
  }
}
