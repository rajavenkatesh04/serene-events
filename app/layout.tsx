import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/ui/themes/theme-provider";
import { Analytics } from "@/app/lib/analytics";
import CookieConsentBanner from "@/app/ui/cookie-banner";

const calSans = Cal_Sans({
    weight: ['400'],
    subsets: ['latin'],
    fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
    title: {
        template: '%s | Luna',
        default: 'Luna',
    },
    description: 'The better platform to spice up your events',
    metadataBase: new URL('https://luna-83jo.vercel.app/'),
    manifest: "/manifest.webmanifest",
    icons: {
        icon: '/icons/favicon-32x32.png',
        shortcut: '/favicon.ico',
        apple: '/icons/apple-touch-icon.png',
        other: [
            {
                rel: 'icon',
                url: '/icons/favicon-16x16.png',
                sizes: '16x16'
            },
            {
                rel: 'msapplication-config',
                url: '/browserconfig.xml' // Points to the root of public/
            }
        ],
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
        <body className={`${calSans.className} antialiased bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-100`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <CookieConsentBanner />
            <Analytics />
        </ThemeProvider>
        </body>
        </html>
    );
}