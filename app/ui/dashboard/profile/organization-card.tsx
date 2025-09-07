// UPDATED: No more local type definition
import { BuildingOffice2Icon, StarIcon } from '@heroicons/react/24/outline';
// UPDATED: Import the official interface from your definitions file
import type { Organisation } from '@/app/lib/definitions';

// MODIFIED: The component now expects the official 'Organisation' type
export default function OrganizationCard({ organization }: { organization: Organisation }) {
    const tierStyles = {
        free: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300',
        pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-zinc-100">Organization</h3>
            <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <BuildingOffice2Icon className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
                    <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">{organization.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <StarIcon className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${tierStyles[organization.subscriptionTier]}`}>
                        {organization.subscriptionTier.charAt(0).toUpperCase() + organization.subscriptionTier.slice(1)} Plan
                    </span>
                </div>
            </div>
        </div>
    );
}