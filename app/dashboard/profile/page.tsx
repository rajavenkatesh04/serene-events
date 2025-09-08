// app/dashboard/profile/page.tsx

import { auth } from '@/app/lib/firebase-admin';
import { fetchUserProfile } from '@/app/lib/data';
import { redirect } from 'next/navigation';
import ProfileForm from '@/app/ui/dashboard/profile/profile-form';
import OrganizationCard from '@/app/ui/dashboard/profile/organization-card';
import DangerZone from '@/app/ui/dashboard/profile/danger-zone';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import ProfileHeader from '@/app/ui/dashboard/profile/profile-header';

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
        imageUrl: session.picture,
        organization: userProfile.organization,
    };

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

            <ProfileHeader
                displayName={user.displayName}
                imageUrl={user.imageUrl}
                role={user.role}
            />

            <h1 className="mb-4 mt-2 text-gray-600 dark:text-zinc-400">
                Manage your profile, organization, and account settings here.
            </h1>

            <div className="space-y-8">
                <ProfileForm user={user} />
                <OrganizationCard organization={user.organization} />
                <DangerZone userRole={user.role} />
            </div>
        </main>
    );
}