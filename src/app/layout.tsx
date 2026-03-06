import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { QuoteProvider } from './components/QuoteProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Hero HQ | The Measure is Aliveness',
    description: 'The CRAZY launching system for a fully alive portfolio.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark bg-black">
            <body className={`${inter.variable} bg-black text-white antialiased font-display`}>
                <QuoteProvider>
                    {children}
                </QuoteProvider>
            </body>
        </html>
    );
}
