import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const credentialName = searchParams.get('name') || 'My Gmail';

    const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_GMAIL_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return NextResponse.json(
            { error: 'Google OAuth is not configured. Missing GOOGLE_GMAIL_CLIENT_ID or GOOGLE_GMAIL_REDIRECT_URI.' },
            { status: 500 },
        );
    }

    const scopes = [
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ');

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes,
        access_type: 'offline',
        prompt: 'consent',
        state: credentialName,
    });

    return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}
