'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/firebase/auth';
import { db } from '@/app/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Message } from '@/app/lib/definitions';
import { sendMessage } from '@/app/lib/actions/chatActions';
import { PaperAirplaneIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { formatRelativeDate } from '@/app/lib/utils';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';
import Link from 'next/link';
import Image from "next/image";
import {InformationCircleIcon} from "@heroicons/react/16/solid";

// --- ChatMessage and LoginPromptBar components are unchanged ---
function ChatMessage({ message }: { message: Message }) {
    const { user } = useAuth();
    const isSender = user?.uid === message.senderUid;
    const profilePic = message.senderProfilePicUrl || `https://ui-avatars.com/api/?name=${message.senderUsername}&background=random`;
    return (
        <div className={`flex items-start gap-3 ${isSender ? 'flex-row-reverse' : ''}`}>
            <Image src={profilePic} alt={message.senderUsername || 'User avatar'} width={40} height={40} className="h-10 w-10 rounded-full"/>
            <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-baseline gap-2 ${isSender ? 'flex-row-reverse' : ''}`}>
                    <p className={`px-1 text-sm font-bold ${isSender ? 'text-pink-600 dark:text-pink-400' : 'text-rose-600 dark:text-rose-400'}`}>@{message.senderUsername}</p>
                    <span className="text-xs text-gray-500 dark:text-zinc-500">{message.timestamp ? formatRelativeDate(message.timestamp) : 'sending...'}</span>
                </div>
                <div className={`mt-1 px-4 py-2 ${isSender ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-s-2xl rounded-ee-2xl' : 'bg-gray-200 text-gray-800 rounded-e-2xl rounded-es-2xl dark:bg-zinc-800 dark:text-white'}`}>
                    <p className="leading-relaxed">{message.text}</p>
                </div>
            </div>
        </div>
    );
}

function LoginPromptBar({ eventId }: { eventId: string }) {
    const redirectUrl = encodeURIComponent(`/e/${eventId}/chat`);
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-100/80 p-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">You are viewing as a guest.</p>
            <Link href={`/login?redirect=${redirectUrl}&reason=chat`} className="flex-shrink-0 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700">
                Log In to Chat
            </Link>
        </div>
    );
}

// --- Warning Banner is unchanged ---
function ChatWarningBanner ({ onDismiss }: { onDismiss: () => void }) {
    return (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 shadow-lg dark:border-blue-500/30 dark:bg-blue-900/20">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {/* The icon is now informational, not a warning */}
                    <InformationCircleIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-base font-medium text-blue-800 dark:text-blue-300">
                        Community Guidelines
                    </h3>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        To ensure a positive and professional environment, please be respectful in all communications. This is a moderated chat.
                    </p>
                </div>
                <div className="ml-auto pl-3">
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="-mx-1.5 -my-1.5 rounded-md bg-blue-50 p-1.5 text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/40"
                    >
                        <span className="sr-only">Dismiss</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
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
    const [isBannerVisible, setIsBannerVisible] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('chatWarningDismissed') !== 'true') {
            setIsBannerVisible(true);
        }
    }, []);

    const handleDismissBanner = () => {
        setIsBannerVisible(false);
        localStorage.setItem('chatWarningDismissed', 'true');
    };

    useEffect(() => {
        if (!eventId) return;
        const messagesQuery = query(collection(db, `chats/${eventId}/messages`), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id, ...data,
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

            {/* --- FIX: The banner is now rendered here, OUTSIDE the scrollable div --- */}
            {isBannerVisible && <ChatWarningBanner onDismiss={handleDismissBanner} />}

            {/* The Message Display Area - It no longer contains the banner */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 pb-4">
                {messages.length > 0 ? (
                    messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))
                ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-gray-500 dark:text-zinc-500">
                        {!isBannerVisible && <p>No messages yet. <br /> Be the first to start the conversation!</p>}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* The Message Input Area */}
            <div className="mt-auto pt-4">
                {user ? (
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..."
                            className="w-full rounded-lg border-gray-300 bg-gray-100 py-3 pl-4 pr-12 text-base text-gray-900 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        />
                        <button
                            type="submit" disabled={!newMessage.trim()}
                            className="absolute inset-y-0 right-0 flex items-center justify-center rounded-r-lg px-4 text-gray-400 transition-colors hover:text-rose-500 disabled:cursor-not-allowed disabled:text-gray-300 dark:text-zinc-400 dark:disabled:text-zinc-600"
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