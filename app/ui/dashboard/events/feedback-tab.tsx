'use client';

import { useState } from 'react';
import { FeedbackResponse, FirestoreTimestamp } from '@/app/lib/definitions';
import { ArrowDownTrayIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

// A small component to display colored rating badges
function RatingBadge({ rating }: { rating?: string }) {
    if (!rating) return <span className="text-gray-400 dark:text-zinc-500">-</span>;

    const badgeColor = clsx({
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': rating === 'Excellent',
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300': rating === 'Good',
        'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300': rating === 'Average',
        'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': rating === 'Poor',
    });

    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${badgeColor}`}>
            {rating}
        </span>
    );
}

// Helper to check if a value is a FirestoreTimestamp
function isFirestoreTimestamp(value: unknown): value is FirestoreTimestamp {
    return value !== null && typeof value === 'object' && 'seconds' in value;
}

// Helper to format the date
function formatDate(timestamp: string | FirestoreTimestamp) {
    if (!timestamp) return 'N/A';

    let date: Date;
    if (isFirestoreTimestamp(timestamp)) {
        date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        return 'N/A';
    }

    return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Helper to convert timestamp to milliseconds for sorting
function getTimestampMillis(timestamp: string | FirestoreTimestamp): number {
    if (!timestamp) return 0;

    if (isFirestoreTimestamp(timestamp)) {
        return timestamp.seconds * 1000;
    } else if (typeof timestamp === 'string') {
        return new Date(timestamp).getTime();
    }
    return 0;
}

export default function FeedbackTab({ responses }: { responses: FeedbackResponse[] }) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof FeedbackResponse, direction: 'asc' | 'desc' } | null>({ key: 'submittedAt', direction: 'desc' });

    const sortedResponses = [...responses].sort((a, b) => {
        if (!sortConfig) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === 'submittedAt') {
            const aDate = getTimestampMillis(aValue as string | FirestoreTimestamp);
            const bDate = getTimestampMillis(bValue as string | FirestoreTimestamp);
            return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }

        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const requestSort = (key: keyof FeedbackResponse) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExport = () => {
        const headers = "Date,Name,Email,Registration ID,Registration,Communication,Venue,Pacing,Comments\n";
        const csvContent = sortedResponses.map(r => {
            const row = [
                `"${formatDate(r.submittedAt)}"`,
                `"${r.fullName}"`,
                `"${r.email}"`,
                `"${r.registrationId || ''}"`,
                r.registrationRating || '',
                r.communicationRating || '',
                r.venueRating || '',
                r.pacingRating || '',
                `"${(r.comments || '').replace(/"/g, '""')}"`
            ];
            return row.join(',');
        }).join('\n');

        const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "feedback_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">All Feedback Responses</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
                        A detailed list of every submission received for this event.
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={responses.length === 0}
                    className="mt-4 sm:mt-0 flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
                >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    Export CSV
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-900/50">
                    <tr>
                        {/* Table Headers */}
                        {['submittedAt', 'fullName', 'registrationRating', 'communicationRating', 'venueRating', 'pacingRating', 'comments'].map((key) => {
                            const labels: { [key: string]: string } = { submittedAt: 'Date', fullName: 'Submitter', registrationRating: 'Registration', communicationRating: 'Communication', venueRating: 'Venue', pacingRating: 'Pacing', comments: 'Comments' };
                            return (
                                <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-zinc-400">
                                    <button onClick={() => requestSort(key as keyof FeedbackResponse)} className="flex items-center gap-1 group">
                                        {labels[key]}
                                        {sortConfig?.key === key && (sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />)}
                                    </button>
                                </th>
                            );
                        })}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                    {sortedResponses.length > 0 ? sortedResponses.map((response) => (
                        <tr key={response.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{formatDate(response.submittedAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900 dark:text-zinc-100">{response.fullName}</div>
                                <div className="text-xs text-gray-500 dark:text-zinc-400">{response.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><RatingBadge rating={response.registrationRating} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><RatingBadge rating={response.communicationRating} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><RatingBadge rating={response.venueRating} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><RatingBadge rating={response.pacingRating} /></td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-zinc-300 min-w-[20rem]">
                                <p className="line-clamp-3">{response.comments || 'N/A'}</p>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-zinc-400">No feedback responses have been submitted yet.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}