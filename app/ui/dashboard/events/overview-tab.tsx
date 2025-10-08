import { fetchEventFeedbackSummary, fetchRecentFeedback } from '@/app/lib/data';
import { FeedbackSummary } from '@/app/lib/definitions';
import { ChartBarIcon, InboxIcon } from '@heroicons/react/24/outline';
import RatingChart from './RatingChart';

// Helper to calculate sentiment
function calculateOverallSentiment(summary: FeedbackSummary) {
    const total = summary.totalResponses;
    if (total === 0) return { score: 0, label: 'No Data' };

    let score = 0;
    const ratings = [summary.registrationRating, summary.communicationRating, summary.venueRating, summary.pacingRating];
    let totalRatings = 0;

    ratings.forEach(rating => {
        if (rating) {
            score += (rating.Excellent * 2) + (rating.Good * 1) - (rating.Poor * 1);
            totalRatings += rating.Excellent + rating.Good + rating.Average + rating.Poor;
        }
    });

    if (totalRatings === 0) return { score: 0, label: 'No Data' };

    const maxScore = totalRatings * 2;
    const percentage = Math.round((score / maxScore) * 100);

    let label = 'Neutral';
    if (percentage > 60) label = 'Positive';
    if (percentage < 40) label = 'Mixed';

    return { score: percentage, label };
}

export default async function OverviewTab({ eventId, userId }: { eventId: string; userId: string; }) {
    const [summary, recentComments] = await Promise.all([
        fetchEventFeedbackSummary(userId, eventId),
        fetchRecentFeedback(userId, eventId, 3)
    ]);

    if (!summary || summary.totalResponses === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-zinc-100">No Feedback Received Yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                    As users submit feedback, you&apos;ll see a full analysis here.
                </p>
            </div>
        );
    }

    const sentiment = calculateOverallSentiment(summary);

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="overflow-hidden rounded-lg bg-white p-5 shadow dark:bg-zinc-900 dark:ring-1 dark:ring-white/10">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                            <InboxIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-zinc-400">Total Responses</dt>
                                <dd><div className="text-3xl font-semibold text-gray-900 dark:text-zinc-100">{summary.totalResponses}</div></dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white p-5 shadow dark:bg-zinc-900 dark:ring-1 dark:ring-white/10">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                            <ChartBarIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-zinc-400">Overall Sentiment</dt>
                                <dd><div className="text-3xl font-semibold text-gray-900 dark:text-zinc-100">{sentiment.label} ({sentiment.score}%)</div></dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <RatingChart title="Registration Process" data={summary.registrationRating} />
                <RatingChart title="Pre-Event Communication" data={summary.communicationRating} />
                <RatingChart title="Venue & Seating" data={summary.venueRating} />
                <RatingChart title="Event Pacing" data={summary.pacingRating} />
            </div>

            {/* Recent Comments */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Recent Comments</h2>
                {recentComments.length > 0 ? (
                    <ul className="mt-4 space-y-4">
                        {recentComments.map(comment => (
                            <li key={comment.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                <p className="text-sm text-gray-700 dark:text-zinc-300 italic">&ldquo;{comment.comments || 'No comment provided.'}&rdquo;</p>
                                <p className="mt-2 text-right text-xs font-semibold text-gray-500 dark:text-zinc-400">- {comment.fullName}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">No comments have been left yet.</p>
                )}
            </div>
        </div>
    );
}