'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface Quote {
    id: string;
    text: string;
    character: string;
}

interface QuoteContextType {
    triggerQuote: () => Promise<void>;
}

const QuoteContext = createContext<QuoteContextType | null>(null);

export function useQuote() {
    const context = useContext(QuoteContext);
    if (!context) {
        throw new Error('useQuote must be used within a QuoteProvider');
    }
    return context;
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
    const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const shownQuotesRef = useRef<string[]>([]);
    const pathname = usePathname();
    const isFirstMount = useRef(true);
    const supabase = createClient();

    const fetchRandomQuote = useCallback(async () => {
        // Prevent showing too many quotes too fast
        if (isVisible) return;

        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('id, text, character');

            if (error || !data || data.length === 0) return;

            // Filter out recent 5
            const recentIds = shownQuotesRef.current;
            let availableQuotes = data.filter(q => !recentIds.includes(q.id));

            // If we exhausted all (unlikely), reset history
            if (availableQuotes.length === 0) {
                availableQuotes = data;
                shownQuotesRef.current = [];
            }

            const randomQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];

            // Update history
            shownQuotesRef.current = [randomQuote.id, ...shownQuotesRef.current].slice(0, 5);

            setActiveQuote(randomQuote);
            setIsVisible(true);

            // Hide after 5 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);

        } catch (err) {
            console.error('Failed to fetch quote', err);
        }
    }, [isVisible, supabase]);

    const prevPathname = useRef(pathname);

    // Trigger on route change
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        if (pathname !== prevPathname.current) {
            prevPathname.current = pathname;
            fetchRandomQuote();
        }
    }, [pathname, fetchRandomQuote]);

    return (
        <QuoteContext.Provider value={{ triggerQuote: fetchRandomQuote }}>
            {children}

            {/* Quote Toast Overlay */}
            <div
                className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-primary text-white p-4 rounded-2xl shadow-2xl z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
            >
                <p className="text-lg font-black leading-tight mb-2 tracking-tight">"{activeQuote?.text}"</p>
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-80 text-right">
                    — {activeQuote?.character.toUpperCase()}
                </div>
            </div>
        </QuoteContext.Provider>
    );
}
