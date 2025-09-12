import GoogleSignInButton from "@/app/ui/google-signin-button";
import Link from "next/link";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SessionExpiredMessage = () => (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/50">
        <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
            Your session has expired. Please sign in again.
        </p>
    </div>
);

const customMessages: { [key: string]: { title: string; subtitle: string } } = {
    default: {
        title: "Welcome to Luna",
        subtitle: "Sign in to access your account and manage your events."
    },
    chat: {
        title: "Join the Conversation",
        subtitle: "Sign in to participate in event discussions and connect with other attendees."
    },
    engage: {
        title: "Don't Just Watch, Participate!",
        subtitle: "Sign in to participate in polls, submit questions, and engage with event content."
    }
};

export default async function LoginPage({
                                            searchParams,
                                        }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const isSessionExpired = resolvedSearchParams?.['error'] === 'session_expired';
    const reason = resolvedSearchParams?.['reason'] as string;
    const redirectUrl = resolvedSearchParams?.['redirect'] as string;

    let message;
    if (isSessionExpired) {
        message = {
            title: "Session Expired",
            subtitle: "Please sign in again to continue using Luna."
        };
    } else {
        message = customMessages[reason] || customMessages.default;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
            <div className="w-full max-w-sm space-y-8 p-8">
                {/* Logo and Brand */}
                <div className="text-center">
                    <Link href="/" className="inline-block">
                        <span className="bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                            Luna
                        </span>
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                        {message.title}
                    </h1>
                    <p className="text-gray-600 dark:text-zinc-400">
                        {message.subtitle}
                    </p>
                </div>

                {/* Session Expired Warning */}
                {isSessionExpired && (
                    <SessionExpiredMessage />
                )}

                {/* Sign In Form */}
                <div className="space-y-6">
                    <GoogleSignInButton redirectUrl={redirectUrl} />

                    {/* Terms and Privacy */}
                    <p className="text-center text-xs text-gray-500 dark:text-zinc-500">
                        By signing in, you agree to our{" "}
                        <Link
                            href="/policies/terms"
                            target="_blank"
                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/policies/privacy"
                            target="_blank"
                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </main>
    );
}