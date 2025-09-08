import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/ui/themes/theme-provider";
import { Analytics } from "@/app/lib/analytics";
import CookieConsentBanner from "@/app/ui/cookie-banner";
import {AuthProvider} from "@/app/lib/firebase/auth";


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
    metadataBase: new URL('https://luna-ashy.vercel.app/'),
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
            <AuthProvider>
                {children}
            </AuthProvider>

            <CookieConsentBanner />
            <Analytics />
        </ThemeProvider>



        </body>
        </html>
    );
}