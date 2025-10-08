'use client';

import { useState, useEffect, useRef } from 'react';
import {useActionState} from "react";
import { useParams } from 'next/navigation'; // ✨ 1. Import useParams
import { useAuth } from '@/app/lib/firebase/auth';
import InitialLoader from "@/app/ui/InitialLoader";
import { submitFeedback, type SubmitFeedbackState } from '@/app/lib/actions/FeedbackActions';
import {useFormStatus} from "react-dom";
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

// --- Reusable Components (No changes here) ---

function RatingScale({ label, value, setValue }: { label: string; value: string; setValue: (value: string) => void }) {
    const options = ["Excellent", "Good", "Average", "Poor"];
    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">{label}</label>
            <div className="flex flex-wrap items-center gap-3">
                {options.map((option) => (
                    <button key={option} type="button" onClick={() => setValue(option)}
                            className={`flex h-9 min-w-[80px] items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors ${value === option ? 'border-rose-600 bg-rose-600 text-white' : 'border-gray-300 bg-white hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700'}`}>
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="flex h-10 w-full items-center justify-center rounded-lg bg-rose-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400">
            {pending ? <><LoadingSpinner className="mr-2" /> Submitting...</> : 'Submit Feedback'}
        </button>
    );
}

// --- Main Feedback Form Component ---
export default function FeedbackPage() {
    // ✨ 2. Get URL params and extract the event ID
    const params = useParams();
    const eventId = params.id as string; // Assuming your URL is /events/[id]/feedback

    const { user } = useAuth();
    const formRef = useRef<HTMLFormElement>(null);

    const initialState: SubmitFeedbackState = { message: null, errors: {}, isSuccess: false };
    const [state, formAction] = useActionState(submitFeedback, initialState);

    // State for controlled components
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [registrationRating, setRegistrationRating] = useState('');
    const [communicationRating, setCommunicationRating] = useState('');
    const [venueRating, setVenueRating] = useState('');
    const [pacingRating, setPacingRating] = useState('');

    useEffect(() => {
        if (user) {
            setFullName(user.displayName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    useEffect(() => {
        if (state.isSuccess) {
            formRef.current?.reset();
            setFullName(user?.displayName || '');
            setEmail(user?.email || '');
            setRegistrationRating('');
            setCommunicationRating('');
            setVenueRating('');
            setPacingRating('');
        }
    }, [state.isSuccess, user]);

    // ✨ 3. Handle cases where the eventId might not be ready yet
    if (!eventId) {
        return <div className="flex h-full w-full items-center justify-center"><InitialLoader /></div>;
    }

    return (
        <div className="w-full h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Event Feedback</h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">Your feedback is essential. Please take a moment to share your experience.</p>
            </div>

            <form ref={formRef} action={formAction} className="space-y-6">
                {/* Card 1: Attendee Information */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">1. Your Information</h2>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="fullName" className="mb-2 block text-sm font-medium">Full Name (Required)</label>
                            <input id="fullName" name="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your Full Name" required className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"/>
                            {state.errors?.fullName && <p className="mt-1 text-sm text-red-500">{state.errors.fullName[0]}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium">Email Address (Required)</label>
                            <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" required className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"/>
                            {state.errors?.email && <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>}
                        </div>
                        <div>
                            <label htmlFor="registrationId" className="mb-2 block text-sm font-medium">Registration number (Optional)</label>
                            <input id="registrationId" name="registrationId" type="text" placeholder="Your ID from registration" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"/>
                        </div>
                    </div>
                </div>

                {/* Card 2: User Comments */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">2. Suggestions & Comments</h2>
                    <div className="mt-4 space-y-2">
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">How can we improve for next time?</label>
                        <textarea id="comments" name="comments" rows={4} placeholder="Constructive feedback is always welcome!" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"></textarea>
                    </div>
                </div>

                {/* Card 3: Event Ratings */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">3. Event Ratings</h2>
                    <div className="mt-4 space-y-6">
                        <RatingScale label="How would you rate the registration process?" value={registrationRating} setValue={setRegistrationRating} />
                        <RatingScale label="How clear was the pre-event communication?" value={communicationRating} setValue={setCommunicationRating} />
                        <RatingScale label="How would you rate the venue and seating?" value={venueRating} setValue={setVenueRating} />
                        <RatingScale label="How would you rate the event's pacing?" value={pacingRating} setValue={setPacingRating} />
                    </div>
                </div>

                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="registrationRating" value={registrationRating} />
                <input type="hidden" name="communicationRating" value={communicationRating} />
                <input type="hidden" name="venueRating" value={venueRating} />
                <input type="hidden" name="pacingRating" value={pacingRating} />

                {state.message && (
                    <div className={`text-sm ${state.isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {state.message}
                    </div>
                )}

                <div className="pt-2">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}