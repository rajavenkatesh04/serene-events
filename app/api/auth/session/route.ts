import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdminApp } from '@/app/lib/firebase-server';

// POST: Create a session cookie
export async function POST(request: Request) {
    const { idToken } = await request.json();
    if (!idToken) {
        return NextResponse.json({ error: 'ID token is required.' }, { status: 400 });
    }

    try {
        initFirebaseAdminApp();
        const expiresIn = 2 * 24 * 60 * 60 * 1000; // 2 days
        const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

        const options = { name: 'session', value: sessionCookie, maxAge: expiresIn, httpOnly: true, secure: true };
        const response = NextResponse.json({ status: 'success' }, { status: 200 });
        response.cookies.set(options);
        return response;
    } catch (error) {
        console.error('Session Login Error:', error);
        return NextResponse.json({ error: 'Failed to create session.' }, { status: 401 });
    }
}

// DELETE: Clear the session cookie
export async function DELETE(request: NextRequest) {
    const options = { name: 'session', value: '', maxAge: -1 };
    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(options);
    return response;
}