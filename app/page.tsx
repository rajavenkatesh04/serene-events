"use client";

import { useRef, useState } from 'react';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from "next/link";
import Image from "next/image";
import {
    QrCodeIcon,
    PencilSquareIcon,
    MegaphoneIcon,
    UsersIcon,
    SparklesIcon,
    Bars3Icon,
    XMarkIcon,
    ClockIcon,
    ArrowDownTrayIcon,
    ExclamationTriangleIcon,
    UserGroupIcon,
    AcademicCapIcon,
    TicketIcon,
    BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
    const main = useRef(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useGSAP(() => {
        // Hero section entrance animation
        const heroTl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.2 } });
        heroTl
            .from(".hero-badge", { opacity: 0, y: -20, duration: 0.8 })
            .from(".hero-h1", { opacity: 0, y: 60, duration: 1 }, "-=0.4")
            .from(".hero-p", { opacity: 0, y: 30, duration: 0.8 }, "-=0.6")
            .from(".hero-buttons", { opacity: 0, y: 30, duration: 0.8 }, "-=0.4")
            .from(".hero-image-main", { opacity: 0, scale: 0.95, duration: 1.2 }, "-=0.8")
            .from(".hero-image-float", { opacity: 0, y: 50, duration: 1 }, "-=0.8");

        // Hero images parallax scroll effect
        gsap.to(".hero-image-float", {
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            y: -80,
            ease: "none",
        });

        gsap.to(".hero-image-main", {
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            y: -40,
            ease: "none",
        });

        // Animate problem cards on scroll
        gsap.from(".problem-card", {
            scrollTrigger: {
                trigger: ".problem-section",
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "power3.out"
        });

        // Animate feature cards on scroll
        gsap.from(".feature-card", {
            scrollTrigger: {
                trigger: ".features-section",
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            scale: 0.9,
            opacity: 0,
            stagger: 0.12,
            duration: 0.7,
            ease: "back.out(1.2)"
        });

    }, { scope: main });

    return (
        <div ref={main} className="flex min-h-screen flex-col bg-white text-gray-800 dark:bg-zinc-950 dark:text-zinc-200">
            {/* ========== NAVBAR ========== */}
            <nav className="fixed top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-12" />
                            <span className={`${PlayWriteNewZealandFont.className} text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent`}>
                                Serene Events
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all hover:scale-105"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/login"
                                className="group relative rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all overflow-hidden"
                            >
                                <span className="relative z-10">Get Started</span>
                                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <span className="absolute inset-0 rounded-lg border-2 border-transparent"
                                          style={{
                                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                                              backgroundSize: '200% 100%',
                                              animation: 'meteor 2s linear infinite'
                                          }} />
                                </span>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <div className="relative w-6 h-6">
                                <Bars3Icon
                                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                                />
                                <XMarkIcon
                                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
                                />
                            </div>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col gap-1 py-4 border-t border-gray-200/50 dark:border-zinc-800/50">
                            <Link
                                href="/login"
                                className="px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/login"
                                className="mx-4 mt-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-3 text-center text-sm font-medium text-white shadow-md hover:shadow-lg transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {/* ========== HERO SECTION ========== */}
                <section className="hero-section relative flex min-h-screen items-center overflow-hidden pt-24 pb-20">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-teal-950/10" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(20,184,166,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_60%,rgba(20,184,166,0.05),transparent_50%)]" />
                    </div>

                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                            <div className="text-center lg:text-left space-y-8">
                                <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-900/50 dark:bg-blue-900/20">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                        Event communication, simplified
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <h1 className="hero-h1 text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
                                        Keep everyone
                                        <span className="block mt-2 bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                                            in the loop.
                                        </span>
                                    </h1>
                                </div>

                                <p className="hero-p mx-auto max-w-xl text-lg leading-relaxed text-gray-600 dark:text-zinc-400 lg:mx-0">
                                    A single source of truth for your event. Send live updates to your attendees instantly via QR code. No apps, no sign-ups, no chaos.
                                </p>

                                <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <Link
                                        href="/login"
                                        className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Create Your Event
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    </Link>
                                </div>
                            </div>

                            <div className="relative h-[500px] lg:h-[700px]">
                                <div className="hero-image-main absolute left-0 right-0 top-1/2 -translate-y-1/2 mx-auto w-[95%] max-w-3xl">
                                    <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_120px_-20px_rgba(0,0,0,0.6)] ring-1 ring-gray-900/5 dark:ring-white/10 hover:scale-105 transition-transform duration-700">
                                        <Image
                                            src="/event-dashboard.png"
                                            alt="Event admin dashboard interface"
                                            width={1200}
                                            height={800}
                                            className="w-full h-auto"
                                            priority
                                        />
                                    </div>
                                </div>

                                <div className="hero-image-float absolute -right-4 top-1/2 -translate-y-1/2 w-[45%] max-w-md lg:-right-8">
                                    <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_80px_-15px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_100px_-15px_rgba(0,0,0,0.7)] ring-1 ring-gray-900/10 dark:ring-white/10 hover:scale-105 transition-transform duration-700">
                                        <Image
                                            src="/attendee-view.png"
                                            alt="Attendee live feed on a mobile phone"
                                            width={500}
                                            height={800}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>

                                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/20 to-teal-500/20 blur-3xl animate-pulse" />
                                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-teal-400/20 to-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "THE PROBLEM" SECTION ========== */}
                <section className="problem-section py-32 bg-gradient-to-b from-white via-teal-50/30 to-blue-50/50 dark:from-zinc-950 dark:via-teal-950/5 dark:to-blue-950/10 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="mb-20 text-center max-w-3xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/20 rounded-full border border-teal-200 dark:border-teal-900/50">
                                <ExclamationTriangleIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                <span className="text-sm font-semibold text-teal-900 dark:text-teal-300">The Problem</span>
                            </div>
                            <h2 className="text-4xl font-bold md:text-5xl">
                                Event communication
                                <span className="block mt-2 bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                                    is often chaotic
                                </span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: ExclamationTriangleIcon, title: "Scattered Updates", description: "Emails, social media, and word-of-mouth create confusion and missed information." },
                                { icon: ArrowDownTrayIcon, title: "App Friction", description: "Forcing attendees to download an app creates barriers and hurts engagement." },
                                { icon: ClockIcon, title: "Last-Minute Chaos", description: "Urgent changes for speakers, locations, or times don't reach everyone in time." },
                                { icon: UserGroupIcon, title: "Disconnected Audience", description: "Attendees feel out of the loop, leading to frustration and a poor experience." }
                            ].map((problem, index) => (
                                <div key={index} className="problem-card group relative rounded-2xl border border-teal-200/50 bg-gradient-to-br from-white via-teal-50/50 to-blue-50/30 p-8 text-center shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 dark:border-teal-900/30 dark:from-zinc-900 dark:via-teal-950/20 dark:to-blue-950/10 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/40 dark:to-blue-900/40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                                            <problem.icon className="h-10 w-10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{problem.title}</h3>
                                            <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-400">{problem.description}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========== "HOW IT WORKS" SECTION ========== */}
                <section className="py-32 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="mb-24 text-center">
                            <h2 className="text-4xl font-bold md:text-5xl mb-6">Live in 3 Simple Steps</h2>
                            <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                                Go from sign-up to sending live announcements in just a few minutes.
                            </p>
                        </div>
                        <div className="space-y-40">
                            {[
                                {
                                    icon: PencilSquareIcon,
                                    badge: "Step 1: Create",
                                    title: "Build your event page.",
                                    subtitle: "Add details, branding, and you're set.",
                                    description: "Our simple editor lets you create a beautiful, informative page for your event in minutes. No coding required.",
                                    imageSrc: "/editor-view.png",
                                    altText: "Simple event editor interface"
                                },
                                {
                                    icon: QrCodeIcon,
                                    badge: "Step 2: Share",
                                    title: "Share a simple QR code.",
                                    subtitle: "No app downloads needed.",
                                    description: "Display your event's unique QR code on screens, posters, or badges. Attendees just scan it with their phone camera to get instant access.",
                                    imageSrc: "/qr-code-generation.png",
                                    altText: "QR code generation and sharing interface",
                                    reverse: true
                                },
                                {
                                    icon: MegaphoneIcon,
                                    badge: "Step 3: Announce",
                                    title: "Send live updates.",
                                    subtitle: "Reach everyone, instantly.",
                                    description: "Post schedule changes, reminders, or sponsor messages. Your announcements appear on everyone's screen in real-time.",
                                    imageSrc: "/live-announcements.png",
                                    altText: "Live announcements appearing on attendee feed"
                                }
                            ].map((step, index) => (
                                <div key={index} className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-20">
                                    <div className={`lg:col-span-5 space-y-6 ${step.reverse ? 'order-2' : 'order-1'}`}>
                                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-900/50 hover:scale-105 transition-transform">
                                            <step.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">{step.badge}</span>
                                        </div>
                                        <h3 className="text-4xl lg:text-5xl font-bold leading-tight">
                                            {step.title}<br />
                                            <span className="text-gray-600 dark:text-zinc-400">{step.subtitle}</span>
                                        </h3>
                                        <p className="text-lg text-gray-600 dark:text-zinc-400 leading-relaxed">{step.description}</p>
                                    </div>
                                    <div className={`lg:col-span-7 ${step.reverse ? 'order-1' : 'order-2'}`}>
                                        <div className="relative rounded-2xl overflow-hidden shadow-[0_25px_100px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_120px_-20px_rgba(0,0,0,0.6)] ring-1 ring-gray-900/5 dark:ring-white/5 transform hover:scale-[1.02] transition-all duration-700 group">
                                            <Image
                                                src={step.imageSrc}
                                                alt={step.altText}
                                                width={1400}
                                                height={900}
                                                className="w-full h-auto"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========== "WHO IS IT FOR?" SECTION ========== */}
                <section className="py-32 bg-white dark:bg-zinc-950">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl font-bold md:text-5xl mb-4">Perfect for any gathering</h2>
                            <p className="text-xl text-gray-600 dark:text-zinc-400">From corporate conferences to campus-wide festivals, Serene adapts to your needs.</p>
                        </div>
                        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                            {[
                                { icon: BuildingOffice2Icon, title: "Corporate Events & Conferences", color: "from-blue-500 to-cyan-500" },
                                { icon: AcademicCapIcon, title: "Universities & Schools", color: "from-teal-500 to-emerald-500" },
                                { icon: TicketIcon, title: "Festivals & Live Performances", color: "from-blue-600 to-violet-500" },
                                { icon: UsersIcon, title: "Community Meetups & Workshops", color: "from-teal-600 to-cyan-500" }
                            ].map((item, index) => (
                                <div key={index} className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white/50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-teal-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-teal-700 cursor-pointer relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                                        <item.icon className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="text-lg font-semibold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors relative z-10">{item.title}</h3>
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========== FEATURES SECTION ========== */}
                <section className="features-section py-32 bg-gradient-to-b from-slate-50 via-blue-50/20 to-teal-50/30 dark:from-zinc-900 dark:via-blue-950/10 dark:to-teal-950/10 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full blur-3xl animate-float" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="mb-16 text-center max-w-3xl mx-auto space-y-6">
                            <h2 className="text-5xl md:text-6xl font-bold">
                                <span className={`${PlayWriteNewZealandFont.className} bg-gradient-to-r from-blue-400 via-teal-500 to-emerald-600 bg-clip-text text-transparent`}>
                                    Everything
                                </span> you need.
                            </h2>
                            <h3 className="text-3xl font-bold md:text-4xl">Nothing you don&apos;t.</h3>
                        </div>

                        <div className="mx-auto mt-16 grid max-w-6xl items-stretch justify-center gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: QrCodeIcon, title: "Instant QR Access", description: "Attendees scan a QR code to join. No app downloads, no friction, just instant access.", gradient: "from-blue-500 to-teal-600" },
                                { icon: MegaphoneIcon, title: "Live Announcements", description: "Send real-time updates, schedule changes, and alerts that appear instantly on every screen.", gradient: "from-teal-500 to-emerald-500" },
                                { icon: PencilSquareIcon, title: "Rich Content", description: "Engage your audience by adding images, links, and map locations to your announcements.", gradient: "from-blue-600 to-violet-500" },
                                { icon: UserGroupIcon, title: "Team Collaboration", description: "Invite other organizers to help manage the event and send announcements.", gradient: "from-teal-600 to-cyan-500" }
                            ].map((feature, index) => (
                                <div key={index} className="feature-card group relative flex h-full flex-col items-center justify-start space-y-6 rounded-3xl border-2 border-teal-200/50 bg-white p-8 text-center shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-teal-400/80 dark:border-teal-900/30 dark:bg-zinc-900 dark:hover:border-teal-600/50 overflow-hidden cursor-pointer">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500`} />
                                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className={`absolute inset-[-2px] rounded-3xl bg-gradient-to-r ${feature.gradient} animate-spin-slow`} />
                                        <div className="absolute inset-[2px] rounded-3xl bg-white dark:bg-zinc-900" />
                                    </div>
                                    <div className="relative z-10 space-y-6">
                                        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                                            <feature.icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                                        </div>
                                        <h3 className={`text-xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform`}>{feature.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow leading-relaxed">{feature.description}</p>
                                    </div>
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========== FINAL CTA SECTION ========== */}
                <section className="py-32 bg-gradient-to-b from-white via-blue-50/40 to-teal-50/50 dark:from-zinc-950 dark:via-blue-950/10 dark:to-teal-950/10 relative overflow-hidden">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/20 via-teal-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
                    </div>

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="max-w-4xl mx-auto space-y-10">
                            <h2 className="text-5xl font-bold md:text-6xl lg:text-7xl leading-tight">
                                Ready to simplify your {" "}
                                <span className={`${PlayWriteNewZealandFont.className} bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent`}>
                                    next event
                                </span>?
                            </h2>
                            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-zinc-400 leading-relaxed">
                                Join hundreds of organizers who are transforming their event communication. Create your first event today, completely free.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link
                                    href="/login"
                                    className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-600 px-10 py-5 text-lg font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-2xl hover:shadow-teal-500/50 hover:-translate-y-1 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Get Started For Free
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </span>
                                    <span className="absolute inset-[-2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent animate-meteor" />
                                    </span>
                                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                </Link>
                                <span className="text-sm text-gray-500 dark:text-zinc-500 flex items-center gap-2">
                                    <SparklesIcon className="h-4 w-4" />
                                    No credit card required
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ========== FOOTER ========== */}
            <footer className="border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-600 shadow-md group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                            <span className={`${PlayWriteNewZealandFont.className} text-lg font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent`}>
                                Serene Events
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-zinc-400">
                            &copy; 2025 Serene Events. All rights reserved.
                        </p>
                        <div className="flex gap-8 text-sm">
                            <Link href="/policies/terms" className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all relative group">
                                Terms of Service
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                            <Link href="/policies/privacy" className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all relative group">
                                Privacy Policy
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes meteor {
                    0% { transform: translateX(-100%) translateY(-100%); }
                    100% { transform: translateX(100%) translateY(100%); }
                }
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, -30px); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-meteor { animation: meteor 3s linear infinite; }
                .animate-float { animation: float 20s ease-in-out infinite; }
                .animate-spin-slow { animation: spin 8s linear infinite; }
            `}</style>
        </div>
    );
}