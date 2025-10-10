'use client';

import { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/firebase/auth';
import InitialLoader from '@/app/ui/InitialLoader';
import { submitFeedback, type SubmitFeedbackState } from '@/app/lib/actions/FeedbackActions';
import { useFormStatus } from 'react-dom';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';

// --- Reusable Components ---

// ✨ NEW: Toast/Snackbar component for quick, non-interruptive feedback.
function Toast({ message, show }: { message: string; show: boolean }) {
    return (
        <div
            className={`fixed bottom-5 left-1/2 z-50 w-auto -translate-x-1/2 transform rounded-full bg-gray-800 px-5 py-3 text-white shadow-lg transition-all duration-300 ease-in-out dark:bg-zinc-200 dark:text-zinc-800 ${
                show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            } ${!show ? 'pointer-events-none' : ''}`}
        >
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}

// ✨ NEW: Success Dialog for the detailed "thank you" message.
function SuccessDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        // ✨ CHANGED: Reduced backdrop opacity for a lighter feel
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4" aria-modal="true">
            <div className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-900">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100">
                    Thank You for Your Feedback!
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-zinc-400">
                        Despite our best efforts, we know there&apos;s always room for improvement. Your feedback is invaluable and will help us make the next event even better.
                    </p>
                </div>
                <div className="mt-5 sm:mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:text-sm"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
}


function RatingScale({ label, value, setValue }: { label: string; value: string; setValue: (value: string) => void; }) {
    const options = ['Excellent', 'Good', 'Average', 'Poor'];
    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">{label}</label>
            <div className="flex flex-wrap items-center gap-3">
                {options.map((option) => (
                    <button key={option} type="button" onClick={() => setValue(option)} className={`flex h-9 min-w-[80px] items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors ${value === option ? 'border-rose-600 bg-rose-600 text-white' : 'border-gray-300 bg-white hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700'}`}>
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
    const params = useParams();
    const eventId = params.id as string;

    const { user } = useAuth();
    const formRef = useRef<HTMLFormElement>(null);

    const initialState: SubmitFeedbackState = { message: null, errors: {}, isSuccess: false };
    const [state, formAction] = useActionState(submitFeedback, initialState);

    // ✨ NEW: State for both the dialog AND the toast.
    const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);
    const [toastInfo, setToastInfo] = useState({ show: false, message: '' });

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

    // ✨ CHANGED: This effect now triggers BOTH the dialog and the toast on success.
    useEffect(() => {
        if (state.isSuccess) {
            // 1. Show the toast
            setToastInfo({ show: true, message: 'Feedback Submitted!' });

            // 2. Show the dialog
            setSuccessDialogOpen(true);

            // 3. Reset the form fields
            formRef.current?.reset();
            setFullName(user?.displayName || '');
            setEmail(user?.email || '');
            setRegistrationRating('');
            setCommunicationRating('');
            setVenueRating('');
            setPacingRating('');

            // 4. Set a timer to hide the toast automatically
            const timer = setTimeout(() => {
                setToastInfo({ show: false, message: '' });
            }, 3000); // Hide after 3 seconds

            // Cleanup the timer if the component unmounts
            return () => clearTimeout(timer);
        }
    }, [state.isSuccess, user]);

    if (!eventId) {
        return <div className="flex h-full w-full items-center justify-center"><InitialLoader /></div>;
    }

    return (
        <div className="h-full w-full">
            {/* ✨ NEW: Render both notification components */}
            <Toast show={toastInfo.show} message={toastInfo.message} />
            <SuccessDialog isOpen={isSuccessDialogOpen} onClose={() => setSuccessDialogOpen(false)} />

            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Event Feedback</h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">
                    Your feedback is essential. Please take a moment to share your experience.
                </p>
            </div>

            <form ref={formRef} action={formAction} className="space-y-6">
                {/* Card 1: Attendee Information */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">1. Your Information</h2>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="fullName" className="mb-2 block text-sm font-medium">Full Name (Required)</label>
                            <input id="fullName" name="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your Full Name" required className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"/>
                            {state.errors?.fullName && <p className="mt-1 text-sm text-red-500">{state.errors.fullName[0]}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium">Email Address (Required)</label>
                            <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" required className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"/>
                            {state.errors?.email && <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>}
                        </div>
                        <div>
                            <label htmlFor="registrationId" className="mb-2 block text-sm font-medium">Registration number (Optional)</label>
                            <input id="registrationId" name="registrationId" type="text" placeholder="Your ID from registration" className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"/>
                        </div>
                    </div>
                </div>

                {/* Card 2: User Comments */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">2. Suggestions & Comments</h2>
                    <div className="mt-4 space-y-2">
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">How can we improve for next time? (Required)</label>
                        <textarea id="comments" name="comments" rows={4} placeholder="Constructive feedback is always welcome!" required className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"></textarea>
                        {state.errors?.comments && <p className="mt-1 text-sm text-red-500">{state.errors.comments[0]}</p>}
                    </div>
                </div>

                {/* Card 3: Event Ratings */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">3. Event Ratings</h2>
                    <div className="mt-4 space-y-6">
                        <div>
                            <RatingScale label="How would you rate the registration process? (Required)" value={registrationRating} setValue={setRegistrationRating}/>
                            {state.errors?.registrationRating && <p className="mt-2 text-sm text-red-500">{state.errors.registrationRating[0]}</p>}
                        </div>
                        <div>
                            <RatingScale label="How clear was the pre-event communication? (Required)" value={communicationRating} setValue={setCommunicationRating}/>
                            {state.errors?.communicationRating && <p className="mt-2 text-sm text-red-500">{state.errors.communicationRating[0]}</p>}
                        </div>
                        <div>
                            <RatingScale label="How would you rate the venue and seating? (Required)" value={venueRating} setValue={setVenueRating}/>
                            {state.errors?.venueRating && <p className="mt-2 text-sm text-red-500">{state.errors.venueRating[0]}</p>}
                        </div>
                        <div>
                            <RatingScale label="How would you rate the event's pacing? (Required)" value={pacingRating} setValue={setPacingRating}/>
                            {state.errors?.pacingRating && <p className="mt-2 text-sm text-red-500">{state.errors.pacingRating[0]}</p>}
                        </div>
                    </div>
                </div>

                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="registrationRating" value={registrationRating} required />
                <input type="hidden" name="communicationRating" value={communicationRating} required />
                <input type="hidden" name="venueRating" value={venueRating} required />
                <input type="hidden" name="pacingRating" value={pacingRating} required />

                {/* Display server error message (e.g., database error) */}
                {state.message && !state.isSuccess && (
                    <div className="text-sm text-red-600">{state.message}</div>
                )}

                <div className="pt-2">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}