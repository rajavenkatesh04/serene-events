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
                src: '/icons/android-icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/android-icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}