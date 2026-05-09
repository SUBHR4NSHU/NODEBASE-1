import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/db';
import { encrypt } from '@/lib/encryption';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // credential name
    const error = searchParams.get('error');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (error) {
        return NextResponse.redirect(
            `${appUrl}/credentials?error=${encodeURIComponent(error)}`,
        );
    }

    if (!code) {
        return NextResponse.redirect(
            `${appUrl}/credentials?error=${encodeURIComponent('No authorization code received')}`,
        );
    }

    // Verify the logged-in user
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.redirect(`${appUrl}/login`);
    }

    const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET!;
    const redirectUri = process.env.GOOGLE_GMAIL_REDIRECT_URI!;

    try {
        // Exchange the code for tokens
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const errData = await tokenResponse.text();
            console.error('Token exchange failed:', errData);
            return NextResponse.redirect(
                `${appUrl}/credentials?error=${encodeURIComponent('Failed to exchange authorization code')}`,
            );
        }

        const tokenData = await tokenResponse.json();
        const { access_token, refresh_token } = tokenData;

        if (!refresh_token) {
            console.error('No refresh token received. Ensure prompt=consent and access_type=offline.');
            return NextResponse.redirect(
                `${appUrl}/credentials?error=${encodeURIComponent('No refresh token received. Please try again.')}`,
            );
        }

        // Fetch the user's email address
        const userinfoResponse = await fetch(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!userinfoResponse.ok) {
            return NextResponse.redirect(
                `${appUrl}/credentials?error=${encodeURIComponent('Failed to fetch user email')}`,
            );
        }

        const userinfo = await userinfoResponse.json();
        const email = userinfo.email as string;

        // Encrypt and store the credential
        const credentialPayload = JSON.stringify({
            email,
            refreshToken: refresh_token,
        });

        const credential = await prisma.credential.create({
            data: {
                name: state || `Gmail - ${email}`,
                type: 'GMAIL',
                value: encrypt(credentialPayload),
                userId: session.user.id,
            },
        });

        return NextResponse.redirect(`${appUrl}/credentials/${credential.id}`);
    } catch (err) {
        console.error('OAuth callback error:', err);
        return NextResponse.redirect(
            `${appUrl}/credentials?error=${encodeURIComponent('OAuth flow failed')}`,
        );
    }
}
