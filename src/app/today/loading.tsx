export default function Loading() {
    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-12 font-display pb-24 flex flex-col justify-center items-center">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-500 animate-pulse">
                Synchronizing Ledger...
            </p>
        </div>
    );
}
