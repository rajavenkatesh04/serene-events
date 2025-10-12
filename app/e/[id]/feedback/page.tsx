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

function Toast({ message, show }: { message: string; show: boolean }) {
    return (
        <div
            className={`fixed top-5 left-1/2 z-50 w-auto -translate-x-1/2 transform rounded-full bg-gray-800 px-5 py-3 text-white shadow-lg transition-all duration-300 ease-in-out dark:bg-zinc-200 dark:text-zinc-800 ${
                show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            } ${!show ? 'pointer-events-none' : ''}`}
        >
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}

function SuccessDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4" aria-modal="true">
            <div className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-900">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100">
                    Thank You for Your Feedback!
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-zinc-400">
                        Your feedback is invaluable and will help us make the next event even better. We appreciate you taking the time.
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

// ✨ MODIFIED: This component now accepts a custom list of options
function RatingScale({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: string[] }) {
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

    // ✨ FIXED: Use a key to force re-render and reset form state
    const [formKey, setFormKey] = useState(0);

    const initialState: SubmitFeedbackState = { message: null, errors: {}, isSuccess: false };
    const [state, formAction] = useActionState(submitFeedback, initialState);

    const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);
    const [toastInfo, setToastInfo] = useState({ show: false, message: '' });

    // State for controlled components
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');

    // ✨ NEW States for updated questions
    const [overallExperienceRating, setOverallExperienceRating] = useState('');
    const [communicationRating, setCommunicationRating] = useState('');
    const [lunchRating, setLunchRating] = useState('');
    const [platformUsefulnessRating, setPlatformUsefulnessRating] = useState('');

    useEffect(() => {
        if (user) {
            setFullName(user.displayName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    // ✨ FIXED: Improved success handling with proper cleanup
    useEffect(() => {
        if (state.isSuccess) {
            setToastInfo({ show: true, message: 'Feedback Submitted!' });
            setSuccessDialogOpen(true);

            // Reset all form states
            setOverallExperienceRating('');
            setCommunicationRating('');
            setLunchRating('');
            setPlatformUsefulnessRating('');

            // Reset form after a brief delay to ensure the submission is complete
            const resetTimer = setTimeout(() => {
                formRef.current?.reset();
                // Force re-render by changing the form key
                setFormKey(prev => prev + 1);
            }, 100);

            const toastTimer = setTimeout(() => {
                setToastInfo({ show: false, message: '' });
            }, 3000);

            return () => {
                clearTimeout(resetTimer);
                clearTimeout(toastTimer);
            };
        }
    }, [state.isSuccess]);

    // ✨ FIXED: Reset form when success dialog is closed
    const handleSuccessDialogClose = () => {
        setSuccessDialogOpen(false);
        // Ensure form is completely reset
        setOverallExperienceRating('');
        setCommunicationRating('');
        setLunchRating('');
        setPlatformUsefulnessRating('');
        formRef.current?.reset();
        setFormKey(prev => prev + 1);
    };

    if (!eventId) {
        return <div className="flex h-full w-full items-center justify-center"><InitialLoader /></div>;
    }

    const standardRatingOptions = ['Excellent', 'Good', 'Average', 'Poor'];
    const platformRatingOptions = ['Very Useful', 'Useful', 'Neutral', 'Not Useful'];

    return (
        <div className="h-full w-full">
            <Toast show={toastInfo.show} message={toastInfo.message} />
            <SuccessDialog isOpen={isSuccessDialogOpen} onClose={handleSuccessDialogClose} />

            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Event Feedback</h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">
                    Your feedback is essential. Please take a moment to share your experience.
                </p>
            </div>

            {/* ✨ FIXED: Added key prop to force re-render */}
            <form key={formKey} ref={formRef} action={formAction} className="space-y-6">
                {/* Card 1: Your Information (Unchanged) */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">1. Your Information</h2>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="fullName" className="mb-2 block text-sm font-medium">Full Name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your Full Name"
                                required
                                className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"
                            />
                            {state.errors?.fullName && <p className="mt-1 text-sm text-red-500">{state.errors.fullName[0]}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                required
                                className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"
                            />
                            {state.errors?.email && <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>}
                        </div>
                        <div>
                            <label htmlFor="registrationId" className="mb-2 block text-sm font-medium">Registration number (Optional)</label>
                            <input
                                id="registrationId"
                                name="registrationId"
                                type="text"
                                placeholder="Your ID from registration"
                                className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"
                            />
                        </div>
                    </div>
                </div>

                {/* ✨ Card 2: Event Ratings & Suggestions */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">2. Event Ratings & Suggestions</h2>
                    <div className="mt-4 space-y-6">
                        <div>
                            <RatingScale
                                label="Overall, how would you rate your event experience?"
                                value={overallExperienceRating}
                                setValue={setOverallExperienceRating}
                                options={standardRatingOptions}
                            />
                            {state.errors?.overallExperienceRating && <p className="mt-2 text-sm text-red-500">{state.errors.overallExperienceRating[0]}</p>}
                        </div>
                        <div>
                            <RatingScale
                                label="How clear was the pre-event communication?"
                                value={communicationRating}
                                setValue={setCommunicationRating}
                                options={standardRatingOptions}
                            />
                            {state.errors?.communicationRating && <p className="mt-2 text-sm text-red-500">{state.errors.communicationRating[0]}</p>}
                        </div>
                        <div>
                            <RatingScale
                                label="How would you rate the lunch provided?"
                                value={lunchRating}
                                setValue={setLunchRating}
                                options={standardRatingOptions}
                            />
                            {state.errors?.lunchRating && <p className="mt-2 text-sm text-red-500">{state.errors.lunchRating[0]}</p>}
                        </div>
                        <div className="pt-2">
                            <label htmlFor="eventImprovementComments" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">What did you feel was lacking or has room for improvement in the event?</label>
                            <textarea
                                id="eventImprovementComments"
                                name="eventImprovementComments"
                                rows={4}
                                placeholder="Constructive feedback on sessions, venue, etc. is always welcome!"
                                required
                                className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"
                            />
                            {state.errors?.eventImprovementComments && <p className="mt-1 text-sm text-red-500">{state.errors.eventImprovementComments[0]}</p>}
                        </div>
                    </div>
                </div>

                {/* ✨ Card 3: Platform Feedback */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">3. Platform Feedback</h2>
                    <div className="mt-4 space-y-6">
                        <div>
                            <RatingScale
                                label="How useful did you find the event platform for announcements and information?"
                                value={platformUsefulnessRating}
                                setValue={setPlatformUsefulnessRating}
                                options={platformRatingOptions}
                            />
                            {state.errors?.platformUsefulnessRating && <p className="mt-2 text-sm text-red-500">{state.errors.platformUsefulnessRating[0]}</p>}
                        </div>
                        <div className="pt-2">
                            <label htmlFor="platformImprovementComments" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">How can we improve the platform? (e.g., bug reports, feature suggestions)</label>
                            <textarea
                                id="platformImprovementComments"
                                name="platformImprovementComments"
                                rows={4}
                                placeholder="Your ideas help us build a better experience for future events."
                                required
                                className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"
                            />
                            {state.errors?.platformImprovementComments && <p className="mt-1 text-sm text-red-500">{state.errors.platformImprovementComments[0]}</p>}
                        </div>
                    </div>
                </div>

                {/* ✨ Updated Hidden Inputs */}
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="overallExperienceRating" value={overallExperienceRating} required />
                <input type="hidden" name="communicationRating" value={communicationRating} required />
                <input type="hidden" name="lunchRating" value={lunchRating} required />
                <input type="hidden" name="platformUsefulnessRating" value={platformUsefulnessRating} required />

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