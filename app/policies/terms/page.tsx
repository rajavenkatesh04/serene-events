import Link from 'next/link';

export default function TermsOfServicePage() {
    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 dark:bg-zinc-950">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-md border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
                    <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-zinc-100">
                        Terms of Service for Serene Events
                    </h1>

                    <p className="mb-4 text-sm text-gray-500 dark:text-zinc-400">
                        Last Updated: September 6, 2025
                    </p>

                    <div className="space-y-6 text-gray-700 dark:text-zinc-300">
                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">1. Agreement to Terms</h2>
                            <p>
                                By creating an account or using the Serene application (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you do not have permission to access the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">2. User Accounts</h2>
                            <p>
                                To use the Service, you must register for an account using Google Sign-In. You are responsible for safeguarding your account and for any activities or actions under your account. You agree not to disclose your password to any third party.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">3. User Responsibilities</h2>
                            <p className="mb-2">You are solely responsible for the content you create, post, and manage through the Service. You agree not to use the Service to:</p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>Post any content that is unlawful, harmful, threatening, abusive, or otherwise objectionable.</li>
                                <li>Violate any applicable local, state, national, or international law.</li>
                                <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                                <li>Distribute spam, unsolicited or unauthorized advertising.</li>
                            </ul>
                            <p className="mt-2">We reserve the right to suspend or terminate your account for any violations.</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">4. Content Ownership</h2>
                            <p>
                                You retain all of your rights to any content you submit, post or display on or through the Service. By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, and distribute such content in any and all media or distribution methods, solely for the purpose of operating and providing the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">5. Termination</h2>
                            <p>
                                You may terminate your account at any time by deleting it through the service or contacting us. We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">6. Disclaimer of Warranties; Limitation of Liability</h2>
                            <p>
                                The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We do not warrant that the service will be uninterrupted, secure, or error-free. In no event shall [Your Company Name, LLC] be liable for any indirect, incidental, special, consequential or punitive damages.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-zinc-200">7. Contact Us</h2>
                            <p>
                                If you have any questions about these Terms, please contact us at: <a href="mailto:grv.9604@gmail.com" className="text-blue-500 hover:underline">here</a>.
                            </p>
                        </section>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                        &larr; Back to Login
                    </Link>
                </div>
            </div>
        </main>
    );
}