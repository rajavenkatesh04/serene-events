'use client';

import { useFormStatus } from 'react-dom';
import { removeAdmin } from '@/app/lib/actions/eventActions';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function RemoveAdminButton({ orgId, eventId, adminUidToRemove }: { orgId: string, eventId: string, adminUidToRemove: string }) {
    const { pending } = useFormStatus();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!window.confirm('Are you sure you want to remove this admin? This cannot be undone.')) {
            event.preventDefault();
        }
    };

    return (
        <form action={removeAdmin}>
            <input type="hidden" name="orgId" value={orgId} />
            <input type="hidden" name="eventId" value={eventId} />
            <input type="hidden" name="adminUidToRemove" value={adminUidToRemove} />
            <button
                type="submit"
                onClick={handleClick}
                disabled={pending}
                className="rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-red-100 hover:text-red-700 dark:text-zinc-400 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                aria-disabled={pending}
            >
                {pending ? 'Removing...' : <TrashIcon className="h-5 w-5" />}
            </button>
        </form>
    );
}