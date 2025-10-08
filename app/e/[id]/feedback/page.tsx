import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function FeedbackPage() {
    return (
        <main className="flex h-full w-full flex-col items-center justify-center">
            <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-zinc-900 md:p-12">
                <div className="flex flex-col items-center">
                    {/* Pulsing Icon Animation */}
                    <div className="relative">
                        <div className="absolute -inset-2 rounded-full bg-fuchsia-500/10 blur-xl"></div>
                        <div className="relative rounded-full bg-white/10 p-4">
                            <SparklesIcon
                                className="h-14 w-14 text-fuchsia-500 dark:text-fuchsia-400"
                                aria-hidden="true"
                            />
                        </div>
                    </div>

                    <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-4xl">
                        You&apos;ll soon be able to share your feedback.
                    </h1>
                    <p className="mt-4 max-w-md text-base text-gray-600 dark:text-zinc-400">
                        Feedback opens when the event goes live.
                    </p>
                </div>
            </div>
        </main>
    );
}
