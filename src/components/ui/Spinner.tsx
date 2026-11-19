import { Loader2 } from 'lucide-react';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-navy-400">
      <Loader2 className="h-8 w-8 animate-spin text-electric-500" />
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-navy-100 bg-[length:400px_100%] ${className}`}
    />
  );
}
