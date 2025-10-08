// app/dashboard/events/[id]/settings/page.tsx
import SettingsTab from '@/app/ui/dashboard/events/settings-tab';
import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth.getSession();
    if (!session) notFound();

    const { id } = await params;

    // We need to fetch the event to get its full docId for the settings tab.
    const event = await fetchEventById(session.uid, id);
    if (!event) notFound();

    return <SettingsTab eventId={event.docId} />;
}