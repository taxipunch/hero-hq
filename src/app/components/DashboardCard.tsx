import React from 'react';

interface DashboardCardProps {
    children: React.ReactNode;
    className?: string;
}

export function DashboardCard({ children, className = '' }: DashboardCardProps) {
    return (
        <section
            className={`rounded-[32px] text-slate-900 card-shadow transition-all duration-200 hover:-translate-y-1 hover:brightness-110 hover:shadow-lg hover:shadow-primary/10 ${className}`}
        >
            {children}
        </section>
    );
}
