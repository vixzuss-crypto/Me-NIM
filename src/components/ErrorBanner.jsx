import { AlertTriangle } from 'lucide-react';

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 bg-red-950/60 border border-red-800/60
      text-red-400 text-xs font-semibold px-4 py-3 rounded-xl mb-4">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}
