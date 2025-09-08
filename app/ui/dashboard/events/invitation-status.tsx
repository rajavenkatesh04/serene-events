// app/ui/dashboard/events/invitation-status.tsx
'use client';

import { revokeInvite } from '@/app/lib/actions/eventActions';
import { useFormStatus } from 'react-dom';
import clsx from 'clsx';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';
import { Invitation } from '@/app/lib/definitions';

function RevokeButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
            {pending ? <LoadingSpinner className="h-4 w-4" /> : 'Revoke'}
        </button>
    );
}

// 2. Use the Invitation[] type instead of any[]
export default function InvitationStatusList({ invites, eventId }: { invites: Invitation[], eventId: string }) {
    if (invites.length === 0) {
        return <p className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">No invitations have been sent.</p>
    }

    return (
        <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
            {invites.map(invite => (
                <li key={invite.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">{invite.inviteeEmail}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-4">
                        <span className={clsx("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", {
                            'bg-yellow-100 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/50 dark:text-yellow-300 dark:ring-yellow-400/20': invite.status === 'pending',
                            'bg-green-100 text-green-800 ring-green-600/20 dark:bg-green-900/50 dark:text-green-300 dark:ring-green-400/20': invite.status === 'accepted',
                            'bg-red-100 text-red-800 ring-red-600/20 dark:bg-red-900/50 dark:text-red-300 dark:ring-red-400/20': invite.status === 'rejected',
                        })}>
                            {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                        </span>
                        {invite.status === 'pending' && (
                            <form action={revokeInvite}>
                                <input type="hidden" name="invitationId" value={invite.id} />
                                <input type="hidden" name="eventId" value={eventId} />
                                <RevokeButton />
                            </form>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}