'use client';

import Image from 'next/image';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import  Breadcrumbs  from '@/app/ui/dashboard/events/breadcrumbs';

// Sample data is now directly inside the component
const sampleMessages = [
    { id: 'm1', sender: 'Alice Johnson', text: 'Hey everyone, welcome to the chat!', timestamp: '10:30 AM', avatar: 'https://i.pravatar.cc/40?u=alice' },
    { id: 'm2', sender: 'You', text: 'Hi Alice! Glad to be here. This UI looks great.', timestamp: '10:31 AM' },
    { id: 'm3', sender: 'Bob Williams', text: 'Hello! Looking forward to collaborating.', timestamp: '10:32 AM', avatar: 'https://i.pravatar.cc/40?u=bob' },
    { id: 'm4', sender: 'You', text: 'Same here, Bob!', timestamp: '10:33 AM' },
    { id: 'm5', sender: 'Alice Johnson', text: 'Perfect. Let me know if anyone has questions about the upcoming event.', timestamp: '10:35 AM', avatar: 'https://i.pravatar.cc/40?u=alice' },
];

export default function ChatPage() {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    {
                        label: 'Chat',
                        href: '/dashboard/chat',
                        active: true,
                    },
                ]}
            />
            <div className="mt-4 flex h-[calc(100vh-150px)] w-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:h-[calc(100vh-120px)]">
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">General Chat</h3>
                </div>

                {/* Messages Area */}
                <div className="flex-grow space-y-4 overflow-y-auto p-4">
                    {sampleMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={clsx('flex items-end gap-3', {
                                'justify-end': msg.sender === 'You',
                                'justify-start': msg.sender !== 'You',
                            })}
                        >
                            {msg.sender !== 'You' && (
                                <Image src={msg.avatar || '/placeholder-user.jpg'} width={32} height={32} alt={msg.sender} className="h-8 w-8 rounded-full object-cover" />
                            )}
                            <div
                                className={clsx('max-w-xs rounded-2xl p-3 md:max-w-md', {
                                    'bg-pink-600 text-white': msg.sender === 'You',
                                    'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-200': msg.sender !== 'You',
                                })}
                            >
                                <p className="text-sm">{msg.text}</p>
                                <p className={clsx('mt-1 text-xs', {
                                    'text-pink-200': msg.sender === 'You',
                                    'text-gray-500 dark:text-zinc-400': msg.sender !== 'You'
                                })}>{msg.timestamp}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <form className="relative" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="w-full rounded-full border-gray-300 bg-gray-100 py-3 pl-4 pr-12 text-sm text-gray-900 focus:border-pink-500 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                        <button
                            type="submit"
                            className="absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-gray-500 transition-colors hover:text-pink-600 dark:text-zinc-400 dark:hover:text-pink-500"
                            aria-label="Send message"
                        >
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

