import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your session data
interface Session {
    name?: string;
    email?: string;
    password?: string;
    // Add any other properties you expect in the session
}

// Define the context type
interface SessionContextType {
    session: Session | null;
    setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}

// Create the context with a default value
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Custom hook to use the session context
export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

// Define the provider props
interface SessionProviderProps {
    children: ReactNode;
}

// Create the session provider component
export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);

    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};
