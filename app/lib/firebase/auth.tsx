'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import InitialLoader from '@/app/ui/InitialLoader';

// 1. Define the shape of the data that the context will provide
type AuthContextType = {
    user: User | null;      // The Firebase user object or null if not logged in
    loading: boolean;       // True while the auth state is being checked, then false
};

// 2. Create the context with a default value
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

// 3. Create the Provider Component
// This component will wrap your entire application and provide the auth state.
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This is the core of Firebase client-side auth.
        // It sets up a listener that runs whenever the user's login state changes.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);      // Set the user object (or null)
            setLoading(false);  // We're done loading
        });

        // This cleans up the listener when the component unmounts
        return () => unsubscribe();
    }, []);

    const value = { user, loading };

    // While the listener is checking the auth state, show a loading spinner.
    // This prevents a flash of the logged-out UI for logged-in users.
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
                <InitialLoader />
            </div>
        );
    }

    // Once loading is false, provide the user state to the rest of the app
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// 4. Create the Custom Hook
// This is what your client components will use to easily access the auth state.
export const useAuth = () => {
    return useContext(AuthContext);
};
