"use client";

import { useRef } from 'react';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from "next/link";
import {
    QrCodeIcon,
    BellAlertIcon,
    ChatBubbleOvalLeftIcon,
    UserGroupIcon,
    PencilSquareIcon,
    MegaphoneIcon,
    AcademicCapIcon,
    BuildingOffice2Icon,
    TicketIcon,
    UsersIcon,
    ExclamationTriangleIcon,
    ArrowDownTrayIcon,
    ClockIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => (
    <header className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">Luna</span>
            </Link>
            <Link
                href="/login"
                className="rounded-md bg-white/10 dark:bg-zinc-800/50 px-4 py-2 text-sm font-semibold backdrop-blur-sm ring-1 ring-inset ring-gray-900/10 dark:ring-white/10 transition-colors hover:bg-white/20 dark:hover:bg-zinc-800"
            >
                Sign In
            </Link>
        </div>
    </header>
);

export default function Home() {
    const main = useRef(null);

    // --- ANIMATION IS NOW ONLY FOR THE HERO SECTION ---
    useGSAP(() => {
        const heroTl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.2 } });
        heroTl
            .from(".hero-h1", { opacity: 0, y: 50, skewX: -10, stagger: 0.2 })
            .from(".simplified-text-reveal", { y: "110%", duration: 1, ease: "power4.inOut" }, "-=1")
            .from(".hero-p", { opacity: 0, y: 30 }, "-=0.8")
            .from(".hero-button", { opacity: 0, scale: 0.8 }, "<")
            .from(".mockup-admin", { opacity: 0, x: -50, rotation: -10 }, "-=1")
            .from(".mockup-attendee", { opacity: 0, x: 50, rotation: 10 }, "<");

        gsap.to(".mockup-container", {
            scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1 },
            yPercent: -15, ease: "none",
        });

    }, { scope: main });

    return (
        <div ref={main} className="flex min-h-screen flex-col bg-white text-gray-800 dark:bg-zinc-950 dark:text-zinc-200">
            <Navbar />
            <main>
                {/* ========== HERO SECTION ========== */}
                <section className="hero-section relative flex min-h-screen items-center overflow-hidden pt-32 pb-20 md:pt-24">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-blue-50 to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20" />
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            <div className="text-center lg:text-left">
                                <h1 className={`${PlayWriteNewZealandFont.className} hero-h1 text-4xl md:text-5xl`}>
                                    Instant
                                    <span className="bg-gradient-to-r from-green-400 to-emerald-800 bg-clip-text text-transparent"> Event</span> Updates,
                                </h1>
                                <div className="mt-2 overflow-hidden">
                                    <h2 className="simplified-text-reveal bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-6xl font-bold text-transparent md:text-8xl">
                                        Simplified.
                                    </h2>
                                </div>
                                <p className="hero-p mx-auto mt-6 max-w-lg text-lg text-gray-600 dark:text-zinc-400 lg:mx-0">
                                    Stop the communication chaos. Luna provides a single source of truth for your attendees with a live feed they can access instantly via QR code. No apps, no sign-ups.
                                </p>
                                <div className="hero-button mt-8">
                                    <Link
                                        href="/login"
                                        className="inline-block rounded-md bg-gradient-to-r from-blue-600 to-emerald-500 px-8 py-3 text-lg  text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl"
                                    >
                                        Get Started for Free
                                    </Link>
                                </div>
                            </div>
                            <div className="mockup-container relative h-[450px] lg:h-[600px]">
                                <div className="mockup-admin absolute left-0 top-1/2 w-[70%] max-w-lg -translate-y-1/2 rotate-[-8deg] origin-bottom-left rounded-xl bg-white p-2 shadow-2xl dark:bg-zinc-900">
                                    <div className="h-4 w-full rounded-t-lg bg-gray-100 dark:bg-zinc-800 flex items-center px-2 gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="flex h-48">
                                        <div className="w-1/4 bg-gray-50 p-2 dark:bg-zinc-900/50 space-y-2"><div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-800"></div><div className="h-4 w-full rounded bg-gray-200 dark:bg-zinc-800"></div><div className="h-4 w-full rounded bg-gray-200 dark:bg-zinc-800 opacity-50"></div></div>
                                        <div className="w-3/4 p-3 space-y-3"><div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-zinc-800"></div><div className="h-10 w-full rounded bg-gray-200 dark:bg-zinc-800"></div><div className="h-16 w-full rounded bg-gray-200 dark:bg-zinc-800"></div></div>
                                    </div>
                                </div>
                                <div className="mockup-attendee absolute right-0 top-1/2 w-[45%] max-w-xs -translate-y-1/2 translate-x-4 rotate-[8deg] origin-bottom-right rounded-2xl border-4 border-gray-800 bg-white p-1.5 shadow-2xl dark:border-gray-600 dark:bg-black">
                                    <div className="h-[280px] space-y-2 overflow-hidden rounded-lg bg-slate-50 p-2 dark:bg-zinc-900">
                                        <div className="flex justify-between items-center"><div className="h-5 w-1/2 rounded-md bg-slate-200 dark:bg-zinc-800"></div><div className="h-4 w-1/4 rounded-full bg-slate-200 dark:bg-zinc-800"></div></div>
                                        <div className="p-3 space-y-2 rounded-lg bg-white dark:bg-zinc-800/50"><div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-zinc-700"></div><div className="h-3 w-full rounded bg-slate-200 dark:bg-zinc-700"></div><div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-zinc-700"></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "THE PROBLEM" SECTION (REDESIGNED) ========== */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl md:text-4xl">Event Communication Shouldn&apos;t Be This Hard</h2>
                            <p className="mt-3 max-w-xl mx-auto text-gray-600 dark:text-zinc-400">Here&apos;s what goes wrong without a central hub for information.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <ExclamationTriangleIcon className="h-7 w-7 text-red-500 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Scattered Updates</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Email chains, social posts, and word-of-mouth create confusion.</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <ArrowDownTrayIcon className="h-7 w-7 text-red-500 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold">App Friction</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Forcing attendees to download apps creates barriers and reduces engagement.</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <ClockIcon className="h-7 w-7 text-red-500 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Last-Minute Chaos</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Critical updates reach attendees too late, causing frustration.</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <Cog6ToothIcon className="h-7 w-7 text-red-500 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Complex Setup</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Existing solutions are often clunky and require extensive setup time.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "HOW LUNA WORKS" SECTION (REDESIGNED) ========== */}
                <section className="py-20 bg-slate-50 dark:bg-zinc-900">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-bold md:text-4xl">Get Started in 3 Simple Steps</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-zinc-400">Go from sign-up to live announcements in just a few minutes.</p>
                        </div>

                        <div className="relative mx-auto max-w-2xl">
                            <div className="absolute left-8 top-8 h-full w-0.5 bg-gray-200 dark:bg-zinc-800" aria-hidden="true"></div>
                            <div className="relative space-y-16">
                                <div className="relative flex items-start gap-8">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800 ring-8 ring-slate-50 dark:ring-zinc-900">
                                        <PencilSquareIcon className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase text-blue-500">Step 1</span>
                                        <h3 className="mt-1 text-2xl font-bold">Create Your Event</h3>
                                        <p className="mt-2 text-gray-600 dark:text-zinc-400">Set up your event in Luna&apos;s dashboard. Add details, customize your feed, and you&apos;re ready to go.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start gap-8">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800 ring-8 ring-slate-50 dark:ring-zinc-900">
                                        <QrCodeIcon className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase text-blue-500">Step 2</span>
                                        <h3 className="mt-1 text-2xl font-bold">Share the QR Code</h3>
                                        <p className="mt-2 text-gray-600 dark:text-zinc-400">Display your unique QR code at your event. Attendees scan it to instantly access the live feed.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start gap-8">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800 ring-8 ring-slate-50 dark:ring-zinc-900">
                                        <MegaphoneIcon className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase text-blue-500">Step 3</span>
                                        <h3 className="mt-1 text-2xl font-bold">Send Live Updates</h3>
                                        <p className="mt-2 text-gray-600 dark:text-zinc-400">Post announcements and schedule changes. They instantly appear on all attendees&apos; phones.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "WHO IS IT FOR?" SECTION ========== */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold md:text-4xl">Perfect for Any Gathering</h2>
                            <p className="mt-3 max-w-xl mx-auto text-gray-600 dark:text-zinc-400">From campus-wide festivals to intimate corporate workshops, Luna adapts to your needs.</p>
                        </div>
                        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <AcademicCapIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold">Universities</h3>
                            </div>
                            <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <BuildingOffice2Icon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold">Corporate Events</h3>
                            </div>
                            <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <TicketIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold">Conferences</h3>
                            </div>
                            <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <UsersIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold">Community Meetups</h3>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== FEATURES SECTION ========== */}
                <section className="py-20 bg-slate-100 dark:bg-zinc-900">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-5xl md:text-6xl"><span className={`${PlayWriteNewZealandFont.className} bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent`}>Everything</span> You Need.</h2>
                            <h3 className="text-3xl md:text-4xl">Nothing You Don&apos;t.</h3>
                            <p className="mt-4 max-w-xl mx-auto text-gray-600 dark:text-zinc-400 sm:text-lg">Focus on your event, not on managing communication chaos.</p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-5xl items-stretch justify-center gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                <QrCodeIcon className="h-12 w-12 text-gray-600 dark:text-gray-400"/>
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Instant QR Access</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">Attendees scan a QR code to instantly join the event feed. No app downloads, no friction.</p>
                            </div>
                            <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                <BellAlertIcon className="h-12 w-12 text-gray-600 dark:text-gray-400"/>
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Push Notifications</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">Send live updates, schedule changes, and emergency alerts directly to attendees&apos; phones.</p>
                            </div>
                            <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                <ChatBubbleOvalLeftIcon className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Rich Announcements</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">Engage your audience with attachments, map locations, and important links in your announcements.</p>
                            </div>
                            <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                <UserGroupIcon className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Manage Admins</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">Collaborate with your team by adding admins who can send announcements to your attendees.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== FINAL CTA SECTION ========== */}
                <section className="py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-5xl text-black/80 dark:text-white/80 md:text-6xl">Ready to <span className={`bg-gradient-to-r from-teal-300 to-amber-600 bg-clip-text text-transparent ${PlayWriteNewZealandFont.className}`}>Transform</span> Your Events?</h2>
                        <p className="mx-auto my-6 max-w-2xl text-center tracking-wide text-gray-600 dark:text-zinc-400 sm:text-xl">
                            Join thousands of event organizers who&apos;ve discovered the power of seamless,
                            real-time communication. Create your first event for free, no credit card required.
                        </p>
                        <div>
                            <Link
                                href="/login"
                                className="inline-block rounded-md bg-gradient-to-r from-teal-300 to-amber-600 px-8 py-3 text-lg text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl"
                            >
                                Get Started for free
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* ========== FOOTER ========== */}
            <footer className="border-t border-t-gray-200/50 bg-white dark:border-t-zinc-800/50 dark:bg-zinc-950">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-600 dark:text-zinc-400">
                            &copy; 2025 Luna. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link href="/policies/terms" className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">Terms of Service</Link>
                            <Link href="/policies/privacy" className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}