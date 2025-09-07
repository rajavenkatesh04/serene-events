import { auth } from '@/app/lib/firebase-admin';
import { fetchUserProfile } from '@/app/lib/data';
import { redirect } from 'next/navigation';
import ProfileForm from '@/app/ui/dashboard/profile/profile-form';
import OrganizationCard from '@/app/ui/dashboard/profile/organization-card';
import DangerZone from '@/app/ui/dashboard/profile/danger-zone';
import  Breadcrumbs  from '@/app/ui/dashboard/events/breadcrumbs';
import ProfileAvatar from '@/app/ui/dashboard/profile/profile-avatar';

const getGreeting = () => {
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false } as const;
    const hour = parseInt(new Intl.DateTimeFormat('en-US', options).format(now));

    if (hour >= 5 && hour < 12) {
        return 'Good morning';
    }
    if (hour >= 12 && hour < 17) {
        return 'Good afternoon';
    }
    if (hour >= 17 && hour < 21) {
        return 'Good evening';
    }
    return 'Good night';
};

export default async function ProfilePage() {
    const session = await auth.getSession();
    if (!session) {
        redirect('/login');
    }

    const userProfile = await fetchUserProfile(session.uid);
    if (!userProfile) {
        redirect('/login?error=profile_not_found');
    }

    const user = {
        displayName: userProfile.displayName,
        email: userProfile.email,
        role: userProfile.role,
        // Modified: Pass session.picture as is, it can be null/undefined
        imageUrl: session.picture,
        organization: userProfile.organization,
    };

    const greeting = getGreeting();

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    {
                        label: 'Profile',
                        href: '/dashboard/profile',
                        active: true,
                    },
                ]}
            />

            {/* ---  PROFILE HEADER START --- */}
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900 md:p-8">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <ProfileAvatar name={user.displayName} imageUrl={user.imageUrl} />
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
                            <span className="font-light text-gray-500 dark:text-zinc-400">{greeting}, </span>
                            {user.displayName || 'there'}
                        </h1>
                        <p className="mt-1 text-lg text-gray-600 dark:text-zinc-400">
                            Manage your profile and organization settings here.
                        </p>
                    </div>
                </div>
            </div>
            {/* ---  PROFILE HEADER END --- */}

            <div className="space-y-8">
                <ProfileForm user={user} />
                <OrganizationCard organization={user.organization} />
                <DangerZone userRole={user.role} />
            </div>
        </main>
    );
}