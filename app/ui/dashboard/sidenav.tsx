import Link from "next/link";
import LunaLogo from "@/app/ui/luna-logo";
import NavLinks from "@/app/ui/dashboard/nav-links";
import { auth } from '@/app/lib/firebase-admin';
import { fetchUserProfile, fetchPendingInvites  } from '@/app/lib/data';
import UserProfile from './user-profile';
import SereneLogo from "@/app/ui/serene-logo";

export default async function SideNav() {
    const session = await auth.getSession();
    const userProfile = session ? await fetchUserProfile(session.uid) : null;

    const pendingInvites = session ? await fetchPendingInvites(session.uid) : [];
    const inviteCount = pendingInvites.length;

    const user = {
        name: userProfile?.displayName || session?.name || 'User',
        email: session?.email || '',
        imageUrl: session?.picture || '/placeholder-user.jpg',
        role: userProfile?.role || 'member',
        organizationName: userProfile?.organization?.name || 'Your Workspace',
    };

    return (
        <div className="flex h-full flex-col bg-gray-50 px-3 py-4 dark:bg-zinc-900 md:px-2">
            <Link
                className="mb-2 flex h-20 items-end justify-start rounded-md bg-gradient-to-r from-red-400 to-pink-700 p-4 md:h-40"
                href="/"
            >
                <div className="w-32 text-white md:w-40">
                    <SereneLogo />
                </div>
            </Link>

            {/* --- Desktop Layout --- */}
            <div className="hidden grow flex-col justify-between md:flex">
                <NavLinks inviteCount={inviteCount} userRole={user.role}/>
                <div className="border-t border-gray-200 pt-2 dark:border-zinc-800">
                    <UserProfile user={user} />
                </div>
            </div>

            {/* --- Mobile Layout --- */}
            <div className="flex items-center justify-between md:hidden">
                {/* User profile is on the left */}
                <div className="flex-shrink-0">
                    <UserProfile user={user} />
                </div>
                {/* Nav links take up the remaining space */}
                <div className="flex-grow">
                    <NavLinks inviteCount={inviteCount} userRole={user.role} />
                </div>
            </div>
        </div>
    );
}

