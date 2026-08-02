import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, onPrev, onNext, disablePrev }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={onPrev}
        disabled={disablePrev ?? page === 1}
        className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-900 text-slate-300
          px-4 py-2 rounded-xl border border-slate-800 disabled:opacity-30
          hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Prev
      </button>
      <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800
        px-4 py-2 rounded-xl min-w-[4rem] text-center">
        {page}
      </span>
      <button
        onClick={onNext}
        className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-900 text-slate-300
          px-4 py-2 rounded-xl border border-slate-800
          hover:bg-slate-800 transition-colors"
      >
        Next <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
