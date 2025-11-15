'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Event } from '@/app/lib/definitions';

type EventContextType = {
    eventPath: string;
    event: Event;
};

const EventContext = createContext<EventContextType | null>(null);

export function EventContextProvider({
                                         children,
                                         value
                                     }: {
    children: ReactNode;
    value: EventContextType;
}) {
    return (
        <EventContext.Provider value={value}>
            {children}
        </EventContext.Provider>
    );
}

export function useEventContext() {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEventContext must be used within an EventContextProvider');
    }
    return context;
}