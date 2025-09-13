'use client';

import { createContext, useContext, ReactNode } from 'react';

// Define the shape of the data we want to share
type EventContextType = {
    eventPath: string;
};

// Create the context with a default value
const EventContext = createContext<EventContextType | null>(null);

// Create a provider component with proper typing
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

// Create a custom hook to easily access the context
export function useEventContext() {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEventContext must be used within an EventContextProvider');
    }
    return context;
}