import GoogleSignInButton from "@/app/ui/google-signin-button";
import Link from "next/link";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SessionExpiredMessage = () => (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-amber-200/20 bg-gradient-to-r from-amber-50/80 to-orange-50/80 p-4 backdrop-blur-sm dark:border-amber-800/30 dark:from-amber-950/30 dark:to-orange-950/30">
        <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Your session has expired. Please sign in again.
        </p>
    </div>
);

// --- NEW: A dictionary of all our dynamic, enthusiastic messages ---
const customMessages: { [key: string]: { title: string; subtitle: string } } = {
    default: {
        title: "Ready to Make Some Noise? 📣",
        subtitle: "Your all-access pass to creating and joining incredible events."
    },
    chat: {
        title: "The Chat's Waiting for You! 💬",
        subtitle: "Sign in and we'll get you dropping messages in no time."
    },
    engage: {
        title: "Don't Just Watch, Participate! ✨",
        subtitle: "Sign in to vote in polls, ask questions, and shape the conversation."
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

    // --- NEW: Updated logic to select the correct message ---
    let message;
    if (isSessionExpired) {
        message = {
            title: "Welcome Back! 👋",
            subtitle: "Your session took a little nap. Let's sign you in to pick up where you left off."
        };
    } else {
        // Use the message for the specific 'reason', or fall back to the default
        message = customMessages[reason] || customMessages.default;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/20">
            <div className="relative mx-auto flex w-full max-w-md flex-col space-y-6 p-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <Link href={'/'} className="group">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 blur opacity-20 transition-opacity group-hover:opacity-30"></div>
                            <span className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-teal-400 bg-clip-text text-5xl font-black tracking-tight text-transparent">
                                Luna
                            </span>
                        </div>
                    </Link>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                            {message.title}
                        </h1>
                        <p className="leading-relaxed text-gray-600 dark:text-zinc-400">
                            {message.subtitle}
                        </p>
                    </div>
                </div>

                {isSessionExpired && (
                    <div className="animate-in fade-in duration-300">
                        <SessionExpiredMessage />
                    </div>
                )}

                <div className="space-y-4 pt-2">
                    <GoogleSignInButton redirectUrl={redirectUrl} />
                    <p className="leading-relaxed px-4 text-center text-xs text-gray-500 dark:text-zinc-500">
                        By continuing, you agree to our{" "}
                        <Link href="/policies/terms" target={`_blank`} className="underline underline-offset-2 transition-colors hover:text-gray-700 dark:hover:text-zinc-300">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/policies/privacy" target={`_blank`} className="underline underline-offset-2 transition-colors hover:text-gray-700 dark:hover:text-zinc-300">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </main>
    );
}