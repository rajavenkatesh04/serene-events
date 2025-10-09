import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/ui/themes/theme-provider";
import CookieConsentBanner from "@/app/ui/cookie-banner";
import { Analytics } from '@vercel/analytics/next';
import Script from "next/script";

const calSans = Cal_Sans({
    weight: ['400'],
    subsets: ['latin'],
    fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
    title: {
        template: '%s | Serene',
        default: 'Serene',
    },
    description: 'The better platform to spice up your events',
    metadataBase: new URL('https://serene-events.vercel.app/login'),
    manifest: "/manifest.webmanifest",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
        <body className={`${calSans.className} antialiased bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-100`}>
        <meta name="apple-mobile-web-app-title" content="Serene" />
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <CookieConsentBanner />
            {/* Vercel Analytics */}
            <Analytics />
        </ThemeProvider>


        {/* Cloudflare Web Analytics */}
        <Script
            strategy="afterInteractive"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "a270989e39084ad79012eb2e96ab5b1f"}'
        />


        {/* Microsoft Clarity Script */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
                    (function(c,l,a,r,i,t,y){
                        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                    })(window, document, "clarity", "script", "sliaoaoq2a");
                `}
        </Script>
        </body>
        </html>
    );
}