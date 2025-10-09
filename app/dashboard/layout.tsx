import { Metadata } from 'next';
import SideNav from "@/app/ui/dashboard/sidenav";

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <SideNav />
            </div>
            <div className="relative flex-grow p-6 md:overflow-y-auto md:p-12">
                {/* Background from landing page */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-teal-950/10" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(59,130,246,0.1),transparent_40%)] dark:bg-[radial-gradient(circle_at_90%_10%,rgba(59,130,246,0.08),transparent_40%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(20,184,166,0.1),transparent_40%)] dark:bg-[radial-gradient(circle_at_10%_90%,rgba(20,184,166,0.06),transparent_40%)]" />
                </div>
                {children}
            </div>
        </div>
    );
}