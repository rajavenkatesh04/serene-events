'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/firebase/auth';
import { db } from '@/app/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Message } from '@/app/lib/definitions';
import { sendMessage } from '@/app/lib/actions/chatActions';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { formatRelativeDate } from '@/app/lib/utils';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';
import Link from 'next/link';
import Image from "next/image";

// --- REDESIGNED: Chat Message Component ---
function ChatMessage({ message }: { message: Message }) {
    const { user } = useAuth();
    const isSender = user?.uid === message.senderUid;

    const profilePic = message.senderProfilePicUrl || `https://ui-avatars.com/api/?name=${message.senderUsername}&background=random`;

    return (
        <div className={`flex items-start gap-3 ${isSender ? 'flex-row-reverse' : ''}`}>
            <Image
                src={profilePic}
                alt={message.senderUsername || 'User avatar'}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
            />
            <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-baseline gap-2 ${isSender ? 'flex-row-reverse' : ''}`}>
                    <p className={`px-1 text-sm font-bold ${isSender ? 'text-pink-400' : 'text-rose-400'}`}>
                        @{message.senderUsername}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-zinc-500">
                        {message.timestamp ? formatRelativeDate(message.timestamp) : 'sending...'}
                    </span>
                </div>
                <div className={`mt-1 px-4 py-2 text-white ${isSender ? 'bg-gradient-to-br from-rose-500 to-pink-600 rounded-s-2xl rounded-ee-2xl' : 'bg-zinc-800 rounded-e-2xl rounded-es-2xl'}`}>
                    <p className="leading-relaxed">{message.text}</p>
                </div>
            </div>
        </div>
    );
}

// --- NEW: A more explicit login prompt ---
function LoginPromptBar({ eventId }: { eventId: string }) {
    const redirectUrl = encodeURIComponent(`/e/${eventId}?tab=chat`);
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-zinc-300">You are viewing as a guest.</p>
            <Link
                href={`/login?redirect=${redirectUrl}&reason=chat`}
                className="flex-shrink-0 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700"
            >
                Log In to Chat
            </Link>
        </div>
    );
}

export default function EventChatPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { user, loading } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!eventId) return;
        const messagesQuery = query(collection(db, `chats/${eventId}/messages`), orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Ensure timestamp is correctly handled
                    timestamp: data.timestamp ? { seconds: data.timestamp.seconds, nanoseconds: data.timestamp.nanoseconds } : null
                } as Message;
            });
            setMessages(fetchedMessages);
        });
        return () => unsubscribe();
    }, [eventId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user || !eventId) return;

        const text = newMessage;
        setNewMessage('');
        try {
            await sendMessage({ eventId, text });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-10"><LoadingSpinner /></div>;
    }

    return (
        <div className="flex h-[70vh] flex-col bg-transparent">
            {/* The Message Display Area - now with more vertical spacing */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 pb-4">
                {messages.length > 0 ? (
                    messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))
                ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-gray-500 dark:text-zinc-500">
                        <p>No messages yet. <br/> Be the first to start the conversation!</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* The Message Input Area */}
            <div className="mt-auto pt-4">
                {user ? (
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full rounded-lg border-zinc-700 bg-zinc-800 py-3 pl-4 pr-12 text-base shadow-sm focus:border-rose-500 focus:ring-rose-500"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute inset-y-0 right-0 flex items-center justify-center rounded-r-lg px-4 text-zinc-400 transition-colors hover:text-rose-500 disabled:cursor-not-allowed disabled:text-zinc-600"
                        >
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </form>
                ) : (
                    <LoginPromptBar eventId={eventId} />
                )}
            </div>
        </div>
    );
}