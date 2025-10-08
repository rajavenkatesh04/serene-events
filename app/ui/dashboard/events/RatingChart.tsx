'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FeedbackRatingCounts } from '@/app/lib/definitions';

const RATING_COLORS = {
    Excellent: '#22c55e', // green-500
    Good: '#3b82f6',      // blue-500
    Average: '#f59e0b',   // amber-500
    Poor: '#ef4444',      // red-500
};

type ChartData = {
    name: string;
    value: number;
};

export default function RatingChart({ title, data }: { title: string; data: FeedbackRatingCounts }) {
    if (!data) return null;

    const chartData: ChartData[] = [
        { name: 'Excellent', value: data.Excellent || 0 },
        { name: 'Good', value: data.Good || 0 },
        { name: 'Average', value: data.Average || 0 },
        { name: 'Poor', value: data.Poor || 0 },
    ];

    // Check if there is any data to display
    const hasData = chartData.some(item => item.value > 0);

    if (!hasData) {
        return (
            <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-zinc-100">{title}</h3>
                <div className="mt-2 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700">
                    <p className="text-sm text-gray-500 dark:text-zinc-400">No rating data yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-zinc-100">{title}</h3>
            <div className="mt-2 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 12 }} className="text-gray-600 dark:text-zinc-400" width={80} />
                        <Tooltip
                            cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                            }}
                            labelStyle={{ color: '#1f2937' }}
                        />
                        <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={RATING_COLORS[entry.name as keyof typeof RATING_COLORS]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}