import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Luna',
        short_name: 'Luna',
        description: 'Your events companion.',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#e11d48',
        icons: [
            {
                src: '/icons/android-chrome-192x192.png', // Place this in public/icons/
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/android-chrome-512x512.png', // Place this in public/icons/
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}