import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectUrl = searchParams.get('redirect_url') || 'mudir://auth-callback';
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const googleAuthUrl = `${baseUrl}/api/auth/signin/google`;
  
  return NextResponse.redirect(`${googleAuthUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`);
}
