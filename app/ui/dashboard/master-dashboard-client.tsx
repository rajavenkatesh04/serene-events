"use client";

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteUsers } from '@/app/lib/actions/godModeActions';
import { User } from '@/app/lib/definitions';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

// This is a small, self-contained component for the form's submit button. No changes needed here.
function SubmitButton({ selectedCount }: { selectedCount: number }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending || selectedCount === 0}
            className="flex items-center justify-center w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Deleting...</span>
                </>
                ) :
                (`Yes, Delete ${selectedCount} User(s)`)}
        </button>
    );
}

// 1. The component now accepts the initial list of users as a prop.
export default function MasterDashboardClient({ initialUsers }: { initialUsers: User[] }) {

    // 2. The 'users' state is initialized with the data passed from the Server Component.
    const [users, setUsers] = useState<User[]>(initialUsers);

    // No changes to these state variables
    const [selectedUids, setSelectedUids] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const initialState = { message: '' };
    const [state, dispatch] = useActionState(deleteUsers, initialState);

    // 3. This useEffect now only runs to RE-FETCH data AFTER the 'deleteUsers' action completes.
    // It no longer runs on the initial page load because the data is already present.
    useEffect(() => {
        // We only proceed if the server action has returned a message (i.e., it has run).
        if (state?.message) {
            const refetchData = async () => {
                const response = await fetch('/api/users');
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data.users);
                    setSelectedUids([]); // Clear selection after deletion
                }
            };

            refetchData();
            setIsModalOpen(false); // Close the modal on success
        }
    }, [state]); // This dependency array ensures the effect runs when the action state changes.

    // No changes needed for any of the handler functions below
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedUids(users.map(u => u.uid));
        } else {
            setSelectedUids([]);
        }
    };

    const handleSelectOne = (uid: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedUids(prev => [...prev, uid]);
        } else {
            setSelectedUids(prev => prev.filter(id => id !== uid));
        }
    };

    const handleDeleteClick = () => {
        if (selectedUids.length > 0) {
            setIsModalOpen(true);
        }
    };

    // The entire JSX return remains exactly the same.
    return (
        <main>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-zinc-100">Master Dashboard</h1>
            <p className="mt-1 text-gray-600 dark:text-zinc-400">Manage all users in the system.</p>

            <form action={dispatch}>
                {selectedUids.map(uid => (
                    <input key={uid} type="hidden" name="uidsToDelete" value={uid} />
                ))}

                <div className="mt-6">
                    <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <input
                                id="select-all"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-700"
                                onChange={handleSelectAll}
                                checked={users.length > 0 && selectedUids.length === users.length}
                                disabled={users.length === 0}
                            />
                            <label htmlFor="select-all" className="text-lg font-semibold text-gray-800 dark:text-zinc-200">
                                {users.length} Users
                            </label>
                        </div>
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            disabled={selectedUids.length === 0}
                            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80 sm:w-auto"
                        >
                            Delete ({selectedUids.length}) Selected
                        </button>
                    </div>

                    {state?.message && (
                        <p className="mb-4 rounded-md bg-green-100 p-2 text-center text-sm font-semibold text-green-700 dark:bg-green-900/50 dark:text-green-300">
                            {state.message}
                        </p>
                    )}

                    {users.length > 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {users.map(user => (
                                    <li key={user.uid} className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-700"
                                                checked={selectedUids.includes(user.uid)}
                                                onChange={(e) => handleSelectOne(user.uid, e.target.checked)}
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-zinc-100">{user.displayName}</p>
                                                <p className="text-sm text-gray-500 dark:text-zinc-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex w-full items-center justify-between gap-4 pl-8 sm:w-auto sm:justify-end sm:pl-0">
                                            <p className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                                                {user.role}
                                            </p>
                                            <p className="font-mono text-xs text-gray-500 dark:text-zinc-500">
                                                {user.organizationId}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <p className="text-gray-500 dark:text-zinc-400">There are no users in the system.</p>
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-500">Confirm Deletion</h2>
                            <p className="mt-2 text-gray-600 dark:text-zinc-300">
                                This is a highly destructive and irreversible action. Deleting an &apos;owner&apos; will permanently remove the user, their organization, and all associated data.
                            </p>
                            <p className="mt-4 font-bold text-gray-800 dark:text-zinc-100">
                                Are you absolutely sure you want to proceed?
                            </p>
                            <div className="mt-6 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                                >
                                    Cancel
                                </button>
                                <SubmitButton selectedCount={selectedUids.length} />
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </main>
    );
}