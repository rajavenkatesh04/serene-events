import { notFound } from 'next/navigation';
import { fetchPublicEventByShortId, fetchAllAnnouncementsForEvent } from '@/app/lib/data';
import { Toaster } from 'react-hot-toast';
import { SparklesIcon } from '@heroicons/react/24/outline';
import Navbar from '@/app/e/ui/Navbar';
import EventHeader from '@/app/e/ui/EventHeader';
import TabNavigation from './TabNavigation';
import { EventContextProvider } from './context';
import { ScheduledScreen, PausedScreen, EndedScreen, CancelledScreen } from '@/app/e/ui/StatusScreens';
import { Announcement } from '@/app/lib/definitions';
import { AuthProvider } from "@/app/lib/firebase/auth";

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

    let finalAnnouncements: Announcement[] = [];
    if (initialEvent.status === 'ended') {
        // You'll need to create this simple data fetcher in your `data.ts` file.
        finalAnnouncements = await fetchAllAnnouncementsForEvent(eventPath);
    }

    return (
        <AuthProvider>
            <EventContextProvider value={{ eventPath }}>
                <div className="bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-slate-200">
                    <Toaster position="top-center" reverseOrder={false} />
                    <Navbar />

                    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                        <EventHeader event={initialEvent} eventId={resolvedParams.id} />

                        <main className="mt-8">
                            {/* --- THE FIX: Conditional logic based on event status --- */}
                            {initialEvent.status === 'live' ? (
                                <>
                                    {/* If the event is live, show the tabs and the page content */}
                                    <TabNavigation eventId={resolvedParams.id} />
                                    <div className="py-6">{children}</div>
                                </>
                            ) : (
                                <>
                                    {/* Otherwise, show the appropriate status screen */}
                                    {initialEvent.status === 'scheduled' && <ScheduledScreen event={initialEvent} />}
                                    {initialEvent.status === 'paused' && <PausedScreen />}
                                    {initialEvent.status === 'ended' && <EndedScreen announcements={finalAnnouncements} />}
                                    {initialEvent.status === 'cancelled' && <CancelledScreen />}
                                </>
                            )}
                        </main>
                    </div>

                    <footer className="w-full border-t border-gray-200/80 bg-slate-100/50 py-6 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 text-sm text-gray-500 dark:text-zinc-500">
                            <a href="https://luna-83jo.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <SparklesIcon className="h-4 w-4 text-indigo-500" />
                                <span>Powered by <span className="font-medium text-gray-700 dark:text-zinc-300">Luna</span></span>
                            </a>
                        </div>
                    </footer>
                </div>
            </EventContextProvider>
        </AuthProvider>
    );
}