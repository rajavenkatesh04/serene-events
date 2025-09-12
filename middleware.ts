// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

// Simple in-memory cache for authentication status
const authCache = new Map();

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const sessionCookie = request.cookies.get('session')?.value;

    // --- Define Protected and Special Routes ---
    const isDashboardRoute = url.pathname.startsWith('/dashboard');
    const isCompleteProfileRoute = url.pathname === '/complete-profile';
    const isLoginRoute = url.pathname === '/login';
    const isMasterRoute = url.pathname.startsWith('/dashboard/master');

    // --- If a session cookie exists, verify it and check profile status ---
    if (sessionCookie) {
        // Check cache first
        const cacheKey = `auth_${sessionCookie}`;
        const cachedAuth = authCache.get(cacheKey);

        let authData;
        if (cachedAuth && Date.now() - cachedAuth.timestamp < 30000) { // 30 second cache
            authData = cachedAuth.data;
        } else {
            // Construct the absolute URL for the API call
            const checkStatusUrl = new URL('/api/auth/check-status', request.url);

            // Forward the session cookie to the API route
            const response = await fetch(checkStatusUrl, {
                headers: {
                    'Cookie': `session=${sessionCookie}`
                }
            });

            authData = await response.json();

            // Cache the result
            authCache.set(cacheKey, {
                data: authData,
                timestamp: Date.now()
            });
        }

        const { isAuthenticated, isProfileComplete, userRole } = authData;

        // --- Routing Logic Based on Auth and Profile Status ---

        // 1. If the session is invalid/expired, clear the cookie and redirect to login
        if (!isAuthenticated) {
            const response = NextResponse.redirect(new URL('/login?error=session_expired', request.url));
            response.cookies.delete('session'); // Clear the invalid cookie
            return response;
        }

        // 2. If authenticated but profile is incomplete
        if (!isProfileComplete) {
            // Allow access ONLY to the complete-profile page
            if (!isCompleteProfileRoute) {
                return NextResponse.redirect(new URL('/complete-profile', request.url));
            }
        }

        // 3. If authenticated and profile IS complete
        if (isProfileComplete) {
            // Redirect away from login or complete-profile pages if they try to access them
            if (isLoginRoute || isCompleteProfileRoute) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        if (isMasterRoute && userRole !== 'god') {
            // Redirect to dashboard with an error message
            return NextResponse.redirect(new URL('/dashboard?error=insufficient_permissions', request.url));
        }
    }
    // --- If no session cookie exists ---
    else {
        // Protect the dashboard route
        if (isDashboardRoute) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Allow the request to proceed if no redirect rules matched
    return NextResponse.next();
}

// Update config to only protect specific routes
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/complete-profile',
        '/login'
    ],
};