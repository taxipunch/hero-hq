'use client';

import { createClient } from '@/utils/supabase/client';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
    const handleLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Hero HQ</h1>
                    <p className="text-gray-400">The measure of success is not optimization. It is aliveness.</p>
                </div>

                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-100 transition-colors py-4 px-6 rounded-xl font-medium"
                >
                    <LogIn size={20} />
                    Continue with Google
                </button>

                <p className="text-xs text-gray-600 mt-8">
                    Authorized personnel only.
                </p>
            </div>
        </div>
    );
}
