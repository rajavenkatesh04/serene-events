// app/dashboard/invitations/page.tsx

import { Suspense } from 'react';
import { fetchPendingInvites } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';
import { acceptInvite, rejectInvite } from '@/app/lib/actions/eventActions';
import { InvitationsSkeleton } from '@/app/ui/skeletons';

async function InvitationsList() {
    const session = await auth.getSession();
    if (!session) return null;

    const invites = await fetchPendingInvites(session.uid);

    return (
        <div className="mt-6">
            {invites.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {invites.map(invite => (
                            <li key={invite.id} className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="font-medium text-gray-900 dark:text-zinc-100 text-xl">
                                    {invite.eventTitle}
                                </p>
                                <div className="flex w-full flex-shrink-0 gap-3 sm:w-auto">
                                    <form action={rejectInvite} className="w-1/2 sm:w-auto">
                                        <input type="hidden" name="invitationId" value={invite.id} />
                                        <button
                                            type="submit"
                                            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80"
                                        >
                                            Reject
                                        </button>
                                    </form>
                                    <form action={acceptInvite} className="w-1/2 sm:w-auto">
                                        <input type="hidden" name="invitationId" value={invite.id} />
                                        <button
                                            type="submit"
                                            className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/80"
                                        >
                                            Accept
                                        </button>
                                    </form>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-gray-500 dark:text-zinc-400">You have no pending invitations.</p>
                </div>
            )}
        </div>
    );
}

// The parent Page component remains the same
export default async function InvitationsPage() {
    // ...
    return (
        <main>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-zinc-100">Event Invitations</h1>
            <p className="mt-1 text-gray-600 dark:text-zinc-400">Accept an invitation to become an admin for an event.</p>
            <Suspense fallback={<InvitationsSkeleton />}>
                <InvitationsList />
            </Suspense>
        </main>
    );
}