import Link from 'next/link';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function EventChatPage() {
    return (
        <main className="flex min-h-screen m-5 flex-col items-center justify-center">
            <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-zinc-900 md:p-12">
                <div className="flex flex-col items-center">
                    {/* Pulsing Icon Animation */}
                    <div className="relative">
                        <div className="absolute -inset-2 rounded-full bg-rose-500/10 blur-xl"></div>
                        <div className="relative rounded-full bg-white/10 p-4">
                            <ChatBubbleLeftRightIcon
                                className="h-14 w-14 text-rose-500 dark:text-rose-400"
                                aria-hidden="true"
                            />
                        </div>
                    </div>

                    <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-4xl">
                        Chat is on the Horizon
                    </h1>
                    <p className="mt-4 max-w-md text-base text-gray-600 dark:text-zinc-400">
                        We&apos;re crafting a seamless new way for you to connect and collaborate in real-time. This space will soon be alive with conversation.
                    </p>
                    <Link
                        href="/dashboard"
                        className="mt-8 inline-flex items-center justify-center rounded-lg bg-rose-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                    >
                        Go Back to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
