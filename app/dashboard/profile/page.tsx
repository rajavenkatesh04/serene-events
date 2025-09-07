import { auth } from '@/app/lib/firebase-admin';
import { fetchUserProfile } from '@/app/lib/data';
import { redirect } from 'next/navigation';
import ProfileForm from '@/app/ui/dashboard/profile/profile-form';
import OrganizationCard from '@/app/ui/dashboard/profile/organization-card';
import DangerZone from '@/app/ui/dashboard/profile/danger-zone';
import Breadcrumbs from "@/app/ui/dashboard/events/breadcrumbs";

export default async function ProfilePage() {
    const session = await auth.getSession();
    if (!session) {
        redirect('/login');
    }

    const userProfile = await fetchUserProfile(session.uid);
    if (!userProfile) {
        // This case is unlikely if they are logged in, but it's good practice
        // to handle it. It might mean their user doc was deleted.
        redirect('/login?error=profile_not_found');
    }

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
            <div className="space-y-8">
                <ProfileForm user={userProfile} />
                <OrganizationCard organization={userProfile.organization} />
                <DangerZone userRole={userProfile.role} />
            </div>
        </main>
    );
}
