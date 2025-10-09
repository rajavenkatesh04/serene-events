import { fetchEventFeedbackSummary, fetchRecentFeedback } from '@/app/lib/data';
import { FeedbackSummary, FeedbackResponse } from '@/app/lib/definitions';
import {
    InboxIcon,
    CheckBadgeIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    UserGroupIcon,
    SparklesIcon,
    FaceSmileIcon,
    FaceFrownIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

// Enhanced sentiment calculation with more granular analysis
function calculateSentimentMetrics(summary: FeedbackSummary) {
    const total = summary.totalResponses;
    if (total === 0) return {
        score: 0,
        label: 'No Data',
        color: 'gray',
        trend: 'neutral',
        breakdown: {},
        netPromoterScore: 0
    };

    const ratings = [
        { key: 'registration', data: summary.registrationRating },
        { key: 'communication', data: summary.communicationRating },
        { key: 'venue', data: summary.venueRating },
        { key: 'pacing', data: summary.pacingRating }
    ];

    let totalPoints = 0;
    let totalRatingsCount = 0;
    const categoryScores: { [key: string]: number } = {};
    let promoters = 0;
    let detractors = 0;

    ratings.forEach(({ key, data }) => {
        if (data) {
            const excellent = data.Excellent || 0;
            const good = data.Good || 0;
            const average = data.Average || 0;
            const poor = data.Poor || 0;

            const categoryTotal = excellent + good + average + poor;
            const categoryScore = categoryTotal > 0 ?
                Math.round(((excellent * 100) + (good * 75) + (average * 50) + (poor * 25)) / categoryTotal) : 0;

            categoryScores[key] = categoryScore;
            totalPoints += (excellent * 100) + (good * 75) + (average * 50) + (poor * 25);
            totalRatingsCount += categoryTotal;

            // NPS Calculation (Promoters: Excellent, Detractors: Poor)
            promoters += excellent;
            detractors += poor;
        }
    });

    if (totalRatingsCount === 0) return {
        score: 0,
        label: 'No Data',
        color: 'gray',
        trend: 'neutral',
        breakdown: {},
        netPromoterScore: 0
    };

    const score = Math.round(totalPoints / totalRatingsCount);
    const netPromoterScore = Math.round(((promoters - detractors) / totalRatingsCount) * 100);

    let label = 'Mixed';
    let color = 'yellow';
    let trend = 'stable';

    if (score >= 90) { label = 'Excellent'; color = 'green'; trend = 'up'; }
    else if (score >= 80) { label = 'Great'; color = 'blue'; trend = 'up'; }
    else if (score >= 70) { label = 'Good'; color = 'cyan'; trend = 'stable'; }
    else if (score >= 60) { label = 'Fair'; color = 'yellow'; trend = 'down'; }
    else { label = 'Needs Attention'; color = 'red'; trend = 'down'; }

    return {
        score,
        label,
        color,
        trend,
        breakdown: categoryScores,
        netPromoterScore
    };
}

// Helper function to get trend indicator
function TrendIndicator({ trend }: { trend: string }) {
    const trends = {
        up: { icon: '↗', color: 'text-green-500', label: 'Improving' },
        down: { icon: '↘', color: 'text-red-500', label: 'Declining' },
        stable: { icon: '→', color: 'text-yellow-500', label: 'Stable' }
    };

    const current = trends[trend as keyof typeof trends] || trends.stable;

    return (
        <span className={`inline-flex items-center text-sm font-medium ${current.color}`}>
            <span className="mr-1">{current.icon}</span>
            {current.label}
        </span>
    );
}

// Define proper types for the icon component
interface IconProps {
    className?: string;
}

// Metric Card Component - FIXED: Removed 'any' type
function MetricCard({
                        title,
                        value,
                        subtitle,
                        icon: Icon,
                        color = 'blue',
                        trend
                    }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<IconProps>;
    color?: string;
    trend?: string;
}) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400'
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">{title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-zinc-100">{value}</p>
                        {trend && <TrendIndicator trend={trend} />}
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">{subtitle}</p>
                    )}
                </div>
                <div className={clsx('rounded-lg p-3', colorClasses[color as keyof typeof colorClasses])}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

export default async function OverviewTab({ eventId, userId }: { eventId: string; userId: string; }) {
    const [summary, recentComments] = await Promise.all([
        fetchEventFeedbackSummary(userId, eventId),
        fetchRecentFeedback(userId, eventId, 8)
    ]);

    if (!summary || summary.totalResponses === 0) {
        return (
            <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="text-center">
                    <InboxIcon className="mx-auto h-16 w-16 text-gray-300 dark:text-zinc-700" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-zinc-100">No Feedback Yet</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                        Responses will appear here once attendees submit feedback.
                    </p>
                </div>
            </div>
        );
    }

    const sentiment = calculateSentimentMetrics(summary);
    const ratingCategories = [
        { title: 'Registration', key: 'registration', data: summary.registrationRating },
        { title: 'Communication', key: 'communication', data: summary.communicationRating },
        { title: 'Venue & Seating', key: 'venue', data: summary.venueRating },
        { title: 'Event Pacing', key: 'pacing', data: summary.pacingRating }
    ];

    // Calculate response rate insights
    const hasHighResponseRate = summary.totalResponses > 50;
    const hasMixedSentiment = sentiment.score >= 60 && sentiment.score < 80;

    return (
        <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Responses"
                    value={summary.totalResponses}
                    subtitle="Attendee feedback"
                    icon={UserGroupIcon}
                    color="blue"
                />
                <MetricCard
                    title="Overall Score"
                    value={sentiment.score}
                    subtitle="/100 points"
                    icon={ChartBarIcon}
                    color={sentiment.color}
                    trend={sentiment.trend}
                />
                <MetricCard
                    title="Net Promoter Score"
                    value={sentiment.netPromoterScore}
                    subtitle="Customer loyalty"
                    icon={SparklesIcon}
                    color={sentiment.netPromoterScore >= 50 ? 'green' : sentiment.netPromoterScore >= 0 ? 'yellow' : 'red'}
                />
                <MetricCard
                    title="Sentiment"
                    value={sentiment.label}
                    subtitle="Overall feedback"
                    icon={sentiment.score >= 70 ? FaceSmileIcon : FaceFrownIcon}
                    color={sentiment.color}
                />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Category Performance */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-zinc-100">
                        Category Performance
                    </h2>
                    <div className="space-y-6">
                        {ratingCategories.map((item) => {
                            if (!item.data) return null;
                            const total = (item.data.Excellent || 0) + (item.data.Good || 0) + (item.data.Average || 0) + (item.data.Poor || 0);
                            if (total === 0) return null;

                            const score = sentiment.breakdown[item.key] || 0;
                            const breakdown = {
                                excellent: Math.round(((item.data.Excellent || 0) / total) * 100),
                                good: Math.round(((item.data.Good || 0) / total) * 100),
                                average: Math.round(((item.data.Average || 0) / total) * 100),
                                poor: Math.round(((item.data.Poor || 0) / total) * 100),
                            };

                            return (
                                <div key={item.title} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900 dark:text-zinc-100">{item.title}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 dark:text-zinc-400">{total} ratings</span>
                                            <span className={clsx(
                                                "rounded-full px-2 py-1 text-xs font-medium",
                                                score >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                                                    score >= 70 ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                                                        score >= 60 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                                            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                            )}>
                                                {score}/100
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stacked bar with percentages */}
                                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-800">
                                        <div
                                            className="bg-green-500 transition-all duration-300"
                                            style={{ width: `${breakdown.excellent}%` }}
                                            title={`Excellent: ${breakdown.excellent}%`}
                                        />
                                        <div
                                            className="bg-blue-500 transition-all duration-300"
                                            style={{ width: `${breakdown.good}%` }}
                                            title={`Good: ${breakdown.good}%`}
                                        />
                                        <div
                                            className="bg-yellow-500 transition-all duration-300"
                                            style={{ width: `${breakdown.average}%` }}
                                            title={`Average: ${breakdown.average}%`}
                                        />
                                        <div
                                            className="bg-red-500 transition-all duration-300"
                                            style={{ width: `${breakdown.poor}%` }}
                                            title={`Poor: ${breakdown.poor}%`}
                                        />
                                    </div>

                                    {/* Percentage labels */}
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-500">
                                        <span>Excellent {breakdown.excellent}%</span>
                                        <span>Good {breakdown.good}%</span>
                                        <span>Average {breakdown.average}%</span>
                                        <span>Poor {breakdown.poor}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Insights & Recommendations */}
                <div className="space-y-6">
                    {/* Quick Insights */}
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-zinc-100">
                            Quick Insights
                        </h2>
                        <div className="space-y-3">
                            {sentiment.score >= 80 && (
                                <div className="flex items-start gap-3 text-green-600 dark:text-green-400">
                                    <CheckBadgeIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Excellent overall satisfaction! Attendees loved your event.</p>
                                </div>
                            )}
                            {hasHighResponseRate && (
                                <div className="flex items-start gap-3 text-blue-600 dark:text-blue-400">
                                    <UserGroupIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Strong response rate indicates good engagement.</p>
                                </div>
                            )}
                            {hasMixedSentiment && (
                                <div className="flex items-start gap-3 text-yellow-600 dark:text-yellow-400">
                                    <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Mixed feedback - consider focusing on lower-rated categories.</p>
                                </div>
                            )}
                            {sentiment.netPromoterScore < 30 && (
                                <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                                    <FaceFrownIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Low promoter score - focus on improving attendee delight.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Comments */}
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-zinc-100">
                            Recent Comments
                        </h2>
                        {recentComments.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {recentComments.map((comment: FeedbackResponse) => (
                                    <div
                                        key={comment.id}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50"
                                    >
                                        <p className="text-sm text-gray-700 dark:text-zinc-300">
                                            {comment.comments || 'No comment provided.'}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-500">
                                            <span className="font-medium">{comment.fullName}</span>
                                            {comment.submittedAt && (
                                                <span>{new Date().toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-zinc-400">No comments have been left yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span>Excellent (90-100)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span>Good (75-89)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span>Average (60-74)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span>Needs Improvement (0-59)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}