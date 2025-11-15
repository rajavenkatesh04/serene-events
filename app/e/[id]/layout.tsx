import { notFound } from 'next/navigation';
import { fetchPublicEventByShortId } from '@/app/lib/data';
import { Toaster } from 'react-hot-toast';
import { SparklesIcon } from '@heroicons/react/24/outline';
import Navbar from '@/app/e/ui/Navbar';
import EventHeader from '@/app/e/ui/EventHeader';
import TabNavigation from './TabNavigation';
import { EventContextProvider } from './context';
import { AuthProvider } from "@/app/lib/firebase/auth";
import NetworkStatusIndicator from '@/app/e/ui/NetworkStatusIndicator';

// This is an async Server Component.
export default async function EventLayout({children, params}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    // Await the params before accessing its properties
    const resolvedParams = await params;

    const data = await fetchPublicEventByShortId(resolvedParams.id);

    if (!data) {
        notFound();
    }

    const {initialEvent, eventPath} = data;

    return (
        <AuthProvider>
            {/* PASS THE FULL EVENT OBJECT HERE */}
            <EventContextProvider value={{ eventPath, event: initialEvent }}>
                <div className="bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-slate-200">
                    <Toaster position="top-center" reverseOrder={false} />

                    <Navbar />

                    <NetworkStatusIndicator />

                    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                        <EventHeader event={initialEvent} eventId={resolvedParams.id} />

                        <main className="mt-8">
                            {/* CHANGE: Logic removed.
                                We always show Tabs and Page Content.
                                The specific pages now decide if they are 'blocked' or not.
                            */}
                            <TabNavigation eventId={resolvedParams.id} />
                            <div className="py-6">{children}</div>
                        </main>
                    </div>

                    <footer className="w-full border-t border-gray-200/80 bg-slate-100/50 py-6 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 text-sm text-gray-500 dark:text-zinc-500">
                            <a href="https://luna-83jo.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <SparklesIcon className="h-4 w-4 text-indigo-500" />
                                <span>Powered by <span className="font-medium text-gray-700 dark:text-zinc-300">Serene</span></span>
                            </a>
                        </div>
                    </footer>
                </div>
            </EventContextProvider>
        </AuthProvider>
    );
}