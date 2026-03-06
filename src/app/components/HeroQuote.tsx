'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Quote {
    id: string;
    text: string;
    character: string;
}

export function HeroQuote() {
    const [quote, setQuote] = useState<Quote | null>(null);

    useEffect(() => {
        const fetchDailyQuote = async () => {
            const today = new Date().toISOString().split('T')[0];
            const storedDate = localStorage.getItem('hero_quote_date');
            const storedQuote = localStorage.getItem('hero_quote_data');

            if (storedDate === today && storedQuote) {
                setQuote(JSON.parse(storedQuote));
                return;
            }

            const supabase = createClient();
            const { data, error } = await supabase
                .from('quotes')
                .select('id, text, character');

            if (!error && data && data.length > 0) {
                const randomQuote = data[Math.floor(Math.random() * data.length)];
                setQuote(randomQuote);
                localStorage.setItem('hero_quote_date', today);
                localStorage.setItem('hero_quote_data', JSON.stringify(randomQuote));
            }
        };

        fetchDailyQuote();
    }, []);

    if (!quote) return null;

    return (
        <div className="px-6 mb-8 max-w-md mx-auto">
            <div className="border-l-4 border-primary pl-4 py-1">
                <p className="text-xl font-black text-white italic leading-tight mb-2">"{quote.text}"</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">— {quote.character}</p>
            </div>
        </div>
    );
}
