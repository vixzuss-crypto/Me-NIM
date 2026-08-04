import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination component.
 * Props:
 * - page       : nomor halaman aktif
 * - onPrev     : handler klik prev
 * - onNext     : handler klik next
 * - hasMore    : boolean — kalau false, tombol Next disembunyikan (bukan disabled, tapi hidden)
 * - disablePrev: override manual disable prev
 */
export default function Pagination({ page, onPrev, onNext, hasMore = true, disablePrev }) {
  const isPrevDisabled = disablePrev ?? page === 1;

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {/* Prev — selalu tampil, hanya disabled saat page 1 */}
      <button
        onClick={onPrev}
        disabled={isPrevDisabled}
        className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-900 text-slate-300
          px-4 py-2 rounded-xl border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed
          hover:bg-slate-800 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Prev
      </button>

      {/* Nomor halaman */}
      <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800
        px-4 py-2 rounded-xl min-w-[4rem] text-center">
        {page}
      </span>

      {/* Next — hanya tampil kalau hasMore = true */}
      {hasMore && (
        <button
          onClick={onNext}
          className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-900 text-slate-300
            px-4 py-2 rounded-xl border border-slate-800
            hover:bg-slate-800 hover:text-white transition-colors"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}