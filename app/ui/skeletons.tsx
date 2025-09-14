const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

// =================================================================================
// --- DASHBOARD OVERVIEW SKELETONS ---
// =================================================================================

function DashboardCardSkeleton() {
    return (
        <div className={`${shimmer} relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900`}>
            <div className="flex items-center">
                <div className="h-5 w-5 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="ml-2 h-4 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-2 flex items-center justify-center rounded-xl bg-gray-50 px-4 py-8 dark:bg-black/50">
                <div className="h-7 w-8 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function DashboardCardsSkeleton() {
    return (
        <>
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
        </>
    );
}

// =================================================================================
// --- EVENTS LIST SKELETONS (NEW) ---
// =================================================================================

function EventLinkSkeleton() {
    return (
        <div className={`${shimmer} relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900`}>
            <div className="mb-3 flex items-center gap-3">
                <div className="h-6 w-1/2 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-5 w-14 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-zinc-800">
                <div className="h-4 w-1/3 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function EventsListSkeleton() {
    return (
        <div className="space-y-4 py-8">
            <EventLinkSkeleton />
            <EventLinkSkeleton />
            <EventLinkSkeleton />
        </div>
    );
}

// =================================================================================
// --- RECENT EVENTS SKELETONS ---
// =================================================================================

function RecentEventRowSkeleton() {
    return (
        <div className="flex flex-row items-center justify-between py-4">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-5 w-14 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                <div className="mt-2 h-4 w-3/4 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="ml-4 h-9 w-20 flex-shrink-0 rounded-md bg-gray-200 dark:bg-zinc-800" />
        </div>
    );
}

export function RecentEventsSkeleton() {
    return (
        <div className={`${shimmer} relative w-full overflow-hidden`}>
            <div className="mb-4 h-7 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                    <RecentEventRowSkeleton />
                    <RecentEventRowSkeleton />
                    <RecentEventRowSkeleton />
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// --- SIDENAV SKELETON ---
// =================================================================================

export function SideNavSkeleton() {
    return (
        <div className={`${shimmer} relative flex h-full flex-col overflow-hidden bg-white px-3 py-4 dark:bg-zinc-900 md:px-2`}>
            <div className="mb-2 h-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="flex grow flex-row justify-between md:flex-col md:space-x-0 md:space-y-2">
                <div className="space-y-2">
                    <div className="h-[48px] rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-[48px] rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-[48px] rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                <div className="hidden h-auto w-full grow rounded-md md:block" />
                <div>
                    <div className="flex w-full items-center border-t border-gray-200 py-3 dark:border-zinc-800">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
                        <div className="ml-2 hidden min-w-0 space-y-2 md:block">
                            <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
                            <div className="h-3 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        </div>
                    </div>
                    <div className="h-[48px] w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// --- INVITATIONS SKELETONS (NEW) ---
// =================================================================================

function InvitationRowSkeleton() {
    return (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="space-y-2">
                <div className="h-4 w-64 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-6 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="h-10 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
        </div>
    );
}

export function InvitationsSkeleton() {
    return (
        <div className={`${shimmer} mt-6 space-y-4 overflow-hidden`}>
            <InvitationRowSkeleton />
            <InvitationRowSkeleton />
            <InvitationRowSkeleton />
        </div>
    );
}


// =================================================================================
// --- EVENT DETAILS PAGE SKELETON (NEW) ---
// =================================================================================

export function EventDetailsPageSkeleton() {
    return (
        <div className={`${shimmer} relative w-full overflow-hidden`}>
            {/* Breadcrumbs */}
            <div className="h-5 w-1/3 rounded-md bg-gray-200 dark:bg-zinc-800" />

            {/* Header */}
            <div className="relative mb-8 mt-4 flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10 lg:flex-row">
                {/* Main Info Section Skeleton */}
                <div className="flex-grow p-6 sm:p-8">
                    <div className="flex items-start justify-between">
                        {/* Status Badge Skeleton */}
                        <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-zinc-800" />
                        {/* Location Skeleton (hidden on mobile) */}
                        <div className="hidden h-5 w-32 rounded-md bg-gray-200 dark:bg-zinc-800 sm:block" />
                    </div>
                    <div className="my-6">
                        {/* Title Skeleton */}
                        <div className="h-10 w-4/5 rounded-lg bg-gray-200 dark:bg-zinc-800 sm:h-12" />
                        {/* Description Skeleton */}
                        <div className="mt-3 space-y-2">
                            <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                            <div className="h-4 w-5/6 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        </div>
                    </div>

                    {/* Date/Time Section Skeleton */}
                    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                        {/* Starts Block Skeleton */}
                        <div className="flex h-[100px] w-40 flex-col gap-2 rounded-md bg-gray-100 p-3 dark:bg-zinc-800/50">
                            <div className="h-4 w-12 rounded-md bg-gray-200 dark:bg-zinc-700" />
                            <div className="h-6 w-3/4 rounded-md bg-gray-200 dark:bg-zinc-700" />
                            <div className="h-5 w-1/2 rounded-md bg-gray-200 dark:bg-zinc-700" />
                        </div>

                        {/* Dashed Line Skeleton */}
                        <div className="h-px w-full flex-1 border-t-2 border-dashed border-gray-200 dark:border-zinc-700 sm:w-auto"></div>

                        {/* Ends Block Skeleton */}
                        <div className="flex h-[100px] w-40 flex-col gap-2 rounded-md bg-gray-100 p-3 dark:bg-zinc-800/50">
                            <div className="h-4 w-12 rounded-md bg-gray-200 dark:bg-zinc-700" />
                            <div className="h-6 w-3/4 rounded-md bg-gray-200 dark:bg-zinc-700" />
                            <div className="h-5 w-1/2 rounded-md bg-gray-200 dark:bg-zinc-700" />
                        </div>
                    </div>
                </div>

                {/* "Stub" Section Skeleton */}
                <div className="relative flex w-full flex-shrink-0 flex-col border-t-2 border-dashed border-gray-200 bg-gray-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-800/50 lg:w-64 lg:border-l-2 lg:border-t-0">
                    {/* Subscriber/Admin Count Skeleton */}
                    <div className="flex justify-around">
                        <div className="h-5 w-12 rounded-md bg-gray-200 dark:bg-zinc-700" />
                        <div className="h-5 w-12 rounded-md bg-gray-200 dark:bg-zinc-700" />
                    </div>
                    {/* QR Code Skeleton */}
                    <div className="flex flex-grow items-center justify-center py-6 lg:py-0">
                        <div className="h-32 w-32 rounded-lg bg-gray-200 dark:bg-zinc-700" />
                    </div>
                    {/* Public Page Link Skeleton */}
                    <div className="mx-auto h-5 w-32 rounded-md bg-gray-200 dark:bg-zinc-700" />
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full">
                <div className="border-b border-gray-200 dark:border-zinc-800">
                    <div className="-mb-px flex space-x-8">
                        <div className="h-6 w-28 border-b-2 border-blue-500 py-4" />
                        <div className="h-6 w-20 py-4" />
                        <div className="h-6 w-24 py-4" />
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-6 mt-4 h-64 rounded-lg bg-gray-200 dark:bg-zinc-800" />
        </div>
    );
}


// =================================================================================
// --- EVENT FORM SKELETON (NEW) ---
// =================================================================================

export function EventFormSkeleton() {
    return (
        <div className={`${shimmer} relative w-full overflow-hidden`}>
            <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
                {/* Title field */}
                <div className="mb-4">
                    <div className="mb-2 h-5 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-9 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                {/* Description field */}
                <div className="mb-4">
                    <div className="mb-2 h-5 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-24 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
            </div>
            {/* Action buttons */}
            <div className="mt-6 flex justify-end gap-4">
                <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-zinc-800" />
                <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}


// =================================================================================
// --- ANNOUNCEMENTS TAB SKELETON (NEW) ---
// =================================================================================

function AnnouncementFormSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 h-5 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="mb-2 h-9 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="mb-4 h-24 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="flex items-center justify-between">
                <div className="h-6 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-10 w-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

function PostedAnnouncementSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2 pr-4">
                    <div className="h-5 w-3/5 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-4 w-5/6 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                <div className="h-5 w-5 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-zinc-800">
                <div className="h-4 w-1/2 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function AnnouncementsTabSkeleton() {
    return (
        <div className={`${shimmer} relative w-full overflow-hidden`}>
            <AnnouncementFormSkeleton />
            <div className="mt-8">
                <div className="mb-4 h-6 w-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="space-y-4">
                    <PostedAnnouncementSkeleton />
                    <PostedAnnouncementSkeleton />
                </div>
            </div>
        </div>
    );
}


// =================================================================================
// --- ADMINS TAB SKELETON (NEW) ---
// =================================================================================

function AdminRowSkeleton() {
    return (
        <div className="flex items-center justify-between px-6 py-4">
            <div className="space-y-2">
                <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-zinc-800" />
        </div>
    );
}

export function AdminsTabSkeleton() {
    return (
        <div className={`${shimmer} w-full space-y-8 overflow-hidden`}>
            {/* Header */}
            <div className="space-y-1">
                <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-72 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            {/* Invite Form */}
            <div className="space-y-2">
                <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="flex h-16 items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="h-9 flex-1 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-10 w-28 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
            </div>
            {/* Admin List */}
            <div className="space-y-2">
                <div className="h-5 w-36 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="rounded-lg border border-gray-200 dark:border-zinc-800">
                    <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                        <AdminRowSkeleton />
                        <AdminRowSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// --- PUBLIC ANNOUNCEMENT FEED SKELETONS (NEW) ---
// =================================================================================

function PublicAnnouncementSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
                <div className="h-6 w-1/2 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-5/6 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-gray-200 pt-3 dark:border-zinc-800">
                <div className="h-4 w-1/3 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function AnnouncementsFeedSkeleton() {
    return (
        <div className={`${shimmer} w-full space-y-4 overflow-hidden`}>
            <PublicAnnouncementSkeleton />
            <PublicAnnouncementSkeleton />
            <PublicAnnouncementSkeleton />
        </div>
    );
}

// =================================================================================
// --- PROFILE PAGE SKELETONS (NEW) ---
// =================================================================================

export function ProfileHeaderSkeleton() {
    return (
        <div className={`${shimmer} relative mb-10 overflow-hidden rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900 md:p-8`}>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
                {/* Avatar Skeleton */}
                <div className="h-24 w-24 flex-shrink-0 rounded-full bg-gray-200 dark:bg-zinc-800" />
                {/* Text Content Skeleton */}
                <div className="w-full flex-1 space-y-3">
                    {/* Heading Skeleton */}
                    <div className="mx-auto h-8 w-3/4 rounded-md bg-gray-200 dark:bg-zinc-800 sm:mx-0 sm:w-1/2" />
                    {/* Role Badge Skeleton */}
                    <div className="mx-auto h-7 w-24 rounded-lg bg-gray-200 dark:bg-zinc-800 sm:mx-0" />
                </div>
            </div>
        </div>
    );
}


export function ProfileFormSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
            <div className="h-6 w-1/3 rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="mt-4 space-y-4 border-t border-gray-200 pt-4 dark:border-zinc-800">
                {/* Field 1 */}
                <div className="space-y-2">
                    <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-9 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                {/* Field 2 */}
                <div className="space-y-2">
                    <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-9 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function OrganizationCardSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
            <div className="h-6 w-1/4 rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-5 w-1/2 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-5 w-1/3 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
            </div>
        </div>
    );
}

export function DangerZoneSkeleton() {
    return (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <div className="flex items-center">
                <div className="mr-2 h-5 w-5 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-6 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-4 border-t border-red-200 pt-4 dark:border-red-900/50">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex-1 space-y-1">
                        <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                    </div>
                    <div className="h-10 w-full rounded-md bg-gray-200 dark:bg-zinc-800 md:w-36" />
                </div>
            </div>
        </div>
    );
}
