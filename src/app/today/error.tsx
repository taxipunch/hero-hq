'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-12 font-display pb-24 flex flex-col justify-center items-center">
            <AlertOctagon size={48} className="text-primary mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Signal Lost</h2>
            <p className="text-slate-400 font-medium mb-8 text-center max-w-md">
                Failed to communicate with the central database. The connection is severed.
            </p>
            <button
                onClick={() => reset()}
                className="bg-primary text-white font-bold uppercase tracking-widest py-3 px-8 rounded-full hover:bg-white hover:text-black transition-colors"
            >
                Retry Connection
            </button>
        </div>
    );
}
