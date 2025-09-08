'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/firebase/auth';
import { db } from '@/app/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Message } from '@/app/lib/definitions';
import { sendMessage } from '@/app/lib/actions/chatActions';
import { joinEventPostLogin } from '@/app/lib/actions/socialActions';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';
import Link from 'next/link';

function ChatMessage({ message }: { message: Message }) {
    const { user } = useAuth();
    const isSender = user?.uid === message.senderUid;

    const profilePic = message.senderProfilePicUrl || `https://ui-avatars.com/api/?name=${message.senderUsername}&background=random`;

    return (
        <div className={`flex items-start gap-3 ${isSender ? 'flex-row-reverse' : ''}`}>
            <img
                src={profilePic}
                alt={message.senderUsername}
                className="h-8 w-8 rounded-full"
            />
            <div className={`max-w-xs break-words rounded-lg px-3 py-2 md:max-w-md ${isSender ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-zinc-800'}`}>
                {!isSender && (
                    <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400">@{message.senderUsername}</p>
                )}
                <p className="text-sm">{message.text}</p>
            </div>
        </div>
    );
}

export default function EventChatPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventId = params.id as string;
    const { user, loading } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // This effect handles the post-login action to save event participation
    useEffect(() => {
        const fromEvent = searchParams.get('fromEvent');
        if (fromEvent === 'true' && eventId) {
            joinEventPostLogin(eventId).then(() => {
                // Clean the URL to prevent this from running again on refresh
                router.replace(`/e/${eventId}?tab=chat`, { scroll: false });
            });
        }
    }, [eventId, searchParams, router]);

    // This effect listens for real-time messages from Firestore
    useEffect(() => {
        if (!eventId) return;

        const messagesQuery = query(
            collection(db, `chats/${eventId}/messages`),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(fetchedMessages);
        });

        return () => unsubscribe();
    }, [eventId]);

    // This effect automatically scrolls to the newest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user || !eventId) return;

        const text = newMessage;
        setNewMessage(''); // Optimistically clear input for a snappy UI

        await sendMessage({ eventId, text });
    };

    if (loading) {
        return <div className="flex items-center justify-center py-10"><LoadingSpinner /></div>;
    }

    return (
        <div className="flex h-[60vh] flex-col rounded-lg border border-gray-200/80 bg-gray-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/50">
            {/* Message Display Area */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-zinc-800">
                {user ? (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </form>
                ) : (
                    <div className="text-center text-sm text-gray-500 dark:text-zinc-400">
                        Please <Link
                        href={`/login?redirect=${encodeURIComponent(`/e/${eventId}?tab=chat`)}&fromEvent=true&reason=chat`}
                        className="font-semibold text-indigo-600 hover:underline"
                    >
                        log in
                    </Link> to join the chat.
                    </div>
                )}
            </div>
        </div>
    );
}