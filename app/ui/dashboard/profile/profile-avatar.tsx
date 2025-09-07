'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProfileAvatar({
                                          name,
                                          imageUrl,
                                      }: {
    name: string;
    // Modified: imageUrl can now be null or undefined
    imageUrl: string | null | undefined;
}) {
    // Only attempt to load the image if imageUrl is provided
    const [imageLoadError, setImageLoadError] = useState(false);
    const hasImage = !!imageUrl && !imageLoadError;

    const getInitial = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    return (
        <div className="relative h-24 w-24 flex-shrink-0 md:h-32 md:w-32">
            {hasImage ? (
                <Image
                    src={imageUrl as string} // Cast as string since hasImage ensures it's not null/undefined
                    alt={`${name}'s profile picture`}
                    className="rounded-full border-4 border-white object-cover shadow-md dark:border-zinc-800"
                    fill
                    sizes="(max-width: 768px) 96px, 128px"
                    onError={() => setImageLoadError(true)} // Set error state on image load failure
                />
            ) : (
                // Fallback to initial if no image URL or if image fails to load
                <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-pink-600 text-5xl font-semibold text-white shadow-md dark:border-zinc-800 dark:bg-pink-700 md:text-6xl">
                    {getInitial(name)}
                </div>
            )}
        </div>
    );
}