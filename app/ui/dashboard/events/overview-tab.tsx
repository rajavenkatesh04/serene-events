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
    FaceFrownIcon,
    ChatBubbleLeftRightIcon,
    HeartIcon,
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

// Enhanced sentiment calculation that handles the actual data structure
function calculateSentimentMetrics(summary: FeedbackSummary) {
    const total = summary.totalResponses;
    if (total === 0) return {
        score: 0,
        label: 'No Data',
        color: 'gray',
        trend: 'neutral',
        breakdown: {},
        netPromoterScore: 0,
        platformScore: 0,
        eventScore: 0
    };

    const ratings = [
        { key: 'overallExperience', data: summary.overallExperienceRating, type: 'standard' as const },
        { key: 'communication', data: summary.communicationRating, type: 'standard' as const },
        { key: 'lunch', data: summary.lunchRating, type: 'standard' as const },
        { key: 'platform', data: summary.platformUsefulnessRating, type: 'platform' as const }
    ];

    let totalPoints = 0;
    let totalRatingsCount = 0;
    const categoryScores: { [key: string]: number } = {};
    let promoters = 0;
    let detractors = 0;
    let platformPoints = 0;
    let platformRatingsCount = 0;
    let eventPoints = 0;
    let eventRatingsCount = 0;

    ratings.forEach(({ key, data, type }) => {
        if (data) {
            let categoryTotal = 0;
            let categoryPoints = 0;

            // Handle all possible rating values
            const counts = {
                excellent: data.Excellent || 0,
                good: data.Good || 0,
                average: data.Average || 0,
                poor: data.Poor || 0,
                veryUseful: data.VeryUseful || 0,
                useful: data.Useful || 0,
                neutral: data.Neutral || 0,
                notUseful: data.NotUseful || 0,
            };

            if (type === 'standard') {
                // Standard ratings: Excellent=100, Good=75, Average=50, Poor=25
                categoryTotal = counts.excellent + counts.good + counts.average + counts.poor;
                categoryPoints = (counts.excellent * 100) + (counts.good * 75) + (counts.average * 50) + (counts.poor * 25);
                totalPoints += categoryPoints;
                totalRatingsCount += categoryTotal;
                eventPoints += categoryPoints;
                eventRatingsCount += categoryTotal;

                // NPS for standard ratings
                promoters += counts.excellent;
                detractors += counts.poor;
            } else {
                // Platform ratings: Very Useful=100, Useful=75, Neutral=50, Not Useful=25
                categoryTotal = counts.veryUseful + counts.useful + counts.neutral + counts.notUseful;
                categoryPoints = (counts.veryUseful * 100) + (counts.useful * 75) + (counts.neutral * 50) + (counts.notUseful * 25);
                platformPoints += categoryPoints;
                platformRatingsCount += categoryTotal;

                // NPS for platform ratings
                promoters += counts.veryUseful;
                detractors += counts.notUseful;
            }

            const categoryScore = categoryTotal > 0 ? Math.round(categoryPoints / categoryTotal) : 0;
            categoryScores[key] = categoryScore;
        }
    });

    if (totalRatingsCount === 0) return {
        score: 0,
        label: 'No Data',
        color: 'gray',
        trend: 'neutral',
        breakdown: {},
        netPromoterScore: 0,
        platformScore: 0,
        eventScore: 0
    };

    const score = totalRatingsCount > 0 ? Math.round(totalPoints / totalRatingsCount) : 0;
    const platformScore = platformRatingsCount > 0 ? Math.round(platformPoints / platformRatingsCount) : 0;
    const eventScore = eventRatingsCount > 0 ? Math.round(eventPoints / eventRatingsCount) : 0;
    const totalRatingsForNPS = totalRatingsCount + platformRatingsCount;
    const netPromoterScore = totalRatingsForNPS > 0 ? Math.round(((promoters - detractors) / totalRatingsForNPS) * 100) : 0;

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
        netPromoterScore,
        platformScore,
        eventScore
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

// Metric Card Component
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

// Comment Card Component - Simplified without labels
function CommentCard({ comment, type }: { comment: FeedbackResponse; type: 'event' | 'platform' }) {
    const text = type === 'event' ? comment.eventImprovementComments : comment.platformImprovementComments;

    if (!text) return null;

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-sm text-gray-700 dark:text-zinc-300 mb-3">
                {text}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-500">
                <span className="font-medium">{comment.fullName}</span>
                {comment.submittedAt && (
                    <span>{new Date(comment.submittedAt.seconds * 1000).toLocaleDateString()}</span>
                )}
            </div>
        </div>
    );
}

export default async function OverviewTab({ eventId, userId }: { eventId: string; userId: string; }) {
    const [summary, recentComments] = await Promise.all([
        fetchEventFeedbackSummary(userId, eventId),
        fetchRecentFeedback(userId, eventId, 12)
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

    // Updated rating categories to match new form structure
    const ratingCategories = [
        {
            title: 'Overall Experience',
            key: 'overallExperience',
            data: summary.overallExperienceRating,
            type: 'standard' as const
        },
        {
            title: 'Communication',
            key: 'communication',
            data: summary.communicationRating,
            type: 'standard' as const
        },
        {
            title: 'Lunch Quality',
            key: 'lunch',
            data: summary.lunchRating,
            type: 'standard' as const
        },
        {
            title: 'Platform Usefulness',
            key: 'platform',
            data: summary.platformUsefulnessRating,
            type: 'platform' as const
        }
    ];

    // Calculate response rate insights
    const hasHighResponseRate = summary.totalResponses > 50;
    const hasMixedSentiment = sentiment.score >= 60 && sentiment.score < 80;

    // Filter comments that have actual content
    const eventComments = recentComments.filter(comment => comment.eventImprovementComments);
    const platformComments = recentComments.filter(comment => comment.platformImprovementComments);

    return (
        <div className="space-y-8">
            {/* Key Metrics Grid - Now with Event Score */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
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
                    title="Event Score"
                    value={sentiment.eventScore}
                    subtitle="/100 points"
                    icon={HeartIcon}
                    color={sentiment.eventScore >= 80 ? 'green' : sentiment.eventScore >= 60 ? 'yellow' : 'red'}
                />
                <MetricCard
                    title="Platform Score"
                    value={sentiment.platformScore}
                    subtitle="/100 points"
                    icon={BuildingStorefrontIcon}
                    color={sentiment.platformScore >= 80 ? 'green' : sentiment.platformScore >= 60 ? 'yellow' : 'red'}
                />
                <MetricCard
                    title="Net Promoter Score"
                    value={sentiment.netPromoterScore}
                    subtitle="Customer loyalty"
                    icon={SparklesIcon}
                    color={sentiment.netPromoterScore >= 50 ? 'green' : sentiment.netPromoterScore >= 0 ? 'yellow' : 'red'}
                />
            </div>

            {/* Main Content Area - Category Performance & Quick Insights Side by Side */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Category Performance - Takes 2/3 width */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
                        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-zinc-100">
                            Category Performance
                        </h2>
                        <div className="space-y-6">
                            {ratingCategories.map((item) => {
                                if (!item.data) return null;

                                let total = 0;
                                let breakdown = {
                                    excellent: 0,
                                    good: 0,
                                    average: 0,
                                    poor: 0
                                };

                                if (item.type === 'standard') {
                                    total = (item.data.Excellent || 0) + (item.data.Good || 0) +
                                        (item.data.Average || 0) + (item.data.Poor || 0);
                                    breakdown = {
                                        excellent: Math.round(((item.data.Excellent || 0) / total) * 100),
                                        good: Math.round(((item.data.Good || 0) / total) * 100),
                                        average: Math.round(((item.data.Average || 0) / total) * 100),
                                        poor: Math.round(((item.data.Poor || 0) / total) * 100),
                                    };
                                } else {
                                    total = (item.data.VeryUseful || 0) + (item.data.Useful || 0) +
                                        (item.data.Neutral || 0) + (item.data.NotUseful || 0);
                                    breakdown = {
                                        excellent: Math.round(((item.data.VeryUseful || 0) / total) * 100),
                                        good: Math.round(((item.data.Useful || 0) / total) * 100),
                                        average: Math.round(((item.data.Neutral || 0) / total) * 100),
                                        poor: Math.round(((item.data.NotUseful || 0) / total) * 100),
                                    };
                                }

                                if (total === 0) return null;

                                const score = sentiment.breakdown[item.key] || 0;

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
                                                title={item.type === 'standard' ? `Excellent: ${breakdown.excellent}%` : `Very Useful: ${breakdown.excellent}%`}
                                            />
                                            <div
                                                className="bg-blue-500 transition-all duration-300"
                                                style={{ width: `${breakdown.good}%` }}
                                                title={item.type === 'standard' ? `Good: ${breakdown.good}%` : `Useful: ${breakdown.good}%`}
                                            />
                                            <div
                                                className="bg-yellow-500 transition-all duration-300"
                                                style={{ width: `${breakdown.average}%` }}
                                                title={item.type === 'standard' ? `Average: ${breakdown.average}%` : `Neutral: ${breakdown.average}%`}
                                            />
                                            <div
                                                className="bg-red-500 transition-all duration-300"
                                                style={{ width: `${breakdown.poor}%` }}
                                                title={item.type === 'standard' ? `Poor: ${breakdown.poor}%` : `Not Useful: ${breakdown.poor}%`}
                                            />
                                        </div>

                                        {/* Percentage labels */}
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-500">
                                            <span>{item.type === 'standard' ? 'Excellent' : 'Very Useful'} {breakdown.excellent}%</span>
                                            <span>{item.type === 'standard' ? 'Good' : 'Useful'} {breakdown.good}%</span>
                                            <span>{item.type === 'standard' ? 'Average' : 'Neutral'} {breakdown.average}%</span>
                                            <span>{item.type === 'standard' ? 'Poor' : 'Not Useful'} {breakdown.poor}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Quick Insights - Takes 1/3 width */}
                <div className="space-y-6">
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
                            {sentiment.platformScore < 60 && (
                                <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                                    <BuildingStorefrontIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Platform needs improvement - check platform comments below.</p>
                                </div>
                            )}
                            {sentiment.platformScore >= 80 && (
                                <div className="flex items-start gap-3 text-green-600 dark:text-green-400">
                                    <BuildingStorefrontIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Platform is well-received! Attendees find it very useful.</p>
                                </div>
                            )}
                            {sentiment.eventScore >= 80 && (
                                <div className="flex items-start gap-3 text-green-600 dark:text-green-400">
                                    <HeartIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Great event experience! Core activities were well-received.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span>Excellent/Very Useful (90-100)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                            <span>Good/Useful (75-89)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                            <span>Average/Neutral (60-74)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <span>Poor/Not Useful (0-59)</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500 text-center">
                        Net Promoter Score (NPS) measures loyalty: Promoters (Excellent/Very Useful) - Detractors (Poor/Not Useful)
                    </div>
                </div>
            </div>

            {/* Recent Comments - Side by Side */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Recent Event Comments */}
                {eventComments.length > 0 && (
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-zinc-100">
                            Recent Event Feedback
                        </h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {eventComments.slice(0, 6).map((comment) => (
                                <CommentCard key={comment.id} comment={comment} type="event" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Platform Comments */}
                {platformComments.length > 0 && (
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-zinc-100">
                            Recent Platform Feedback
                        </h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {platformComments.slice(0, 6).map((comment) => (
                                <CommentCard key={comment.id} comment={comment} type="platform" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}