// This is a plain SVG component, no 'use client' needed.

export default function InitialAvatarSVG({ name, size = 128 }: { name: string; size?: number }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    // A simple, clean SVG with your brand's pink color and white text
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 128 128"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="64" cy="64" r="64" fill="#EC4899" /> {/* Your pink color */}
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="white"
                fontFamily="sans-serif"
                fontSize="60" // Adjusted font size for larger display
                fontWeight="bold"
            >
                {initial}
            </text>
        </svg>
    );
}