'use client';

import { FormEvent, useState, useEffect } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

// The input component remains the same, as its functionality is perfect.
function PageInput({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { push } = useRouter();
    const [page, setPage] = useState(currentPage.toString());

    useEffect(() => {
        setPage(currentPage.toString());
    }, [currentPage]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        let newPage = parseInt(page, 10);

        if (isNaN(newPage) || newPage < 1) {
            newPage = 1;
        } else if (newPage > totalPages) {
            newPage = totalPages;
        }

        params.set('page', newPage.toString());
        push(`${pathname}?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center">
            <label htmlFor="page-input" className="sr-only">Current Page</label>
            <input
                id="page-input"
                type="text"
                inputMode="numeric"
                value={page}
                onChange={(e) => setPage(e.target.value.replace(/[^0-9]/g, ''))}
                // Updated styling for better cohesion with the dark theme
                className="w-12 border-0 bg-transparent p-0 text-center text-sm font-medium text-zinc-100 ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-rose-500 rounded-md"
                aria-label={`Page ${currentPage} of ${totalPages}, enter a page number to jump`}
            />
        </form>
    )
}


export default function Pagination({ totalPages }: { totalPages: number }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    if (totalPages <= 1) {
        return null;
    }

    // New minimalist layout without the heavy container
    return (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-6">
            <PaginationArrow
                direction="left"
                href={createPageURL(currentPage - 1)}
                isDisabled={currentPage <= 1}
            />

            <div className="flex items-center gap-3 text-sm font-medium text-zinc-400">
                Page
                <PageInput currentPage={currentPage} totalPages={totalPages} />
                of {totalPages}
            </div>

            <PaginationArrow
                direction="right"
                href={createPageURL(currentPage + 1)}
                isDisabled={currentPage >= totalPages}
            />
        </nav>
    );
}


function PaginationArrow({
                             href,
                             direction,
                             isDisabled,
                         }: {
    href: string;
    direction: 'left' | 'right';
    isDisabled?: boolean;
}) {
    // Redesigned arrows with interactive red accent hover
    const className = clsx(
        'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
        {
            'pointer-events-none text-zinc-700': isDisabled,
            'text-zinc-400 hover:bg-rose-600 hover:text-white': !isDisabled,
        },
    );

    const icon =
        direction === 'left' ? (
            <ArrowLeftIcon className="w-5" />
        ) : (
            <ArrowRightIcon className="w-5" />
        );

    return isDisabled ? (
        <div className={className}>{icon}</div>
    ) : (
        <Link className={className} href={href} aria-label={direction === 'left' ? "Go to previous page" : "Go to next page"}>
            {icon}
        </Link>
    );
}