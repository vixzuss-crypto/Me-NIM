// SkeletonHero — mengikuti layout responsif HeroCarousel
export default function SkeletonHero() {
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-slate-900 animate-pulse">

      {/* ── MOBILE: poster atas + info bawah ── */}
      <div className="block sm:hidden">
        {/* Poster placeholder */}
        <div className="relative w-full aspect-[2/3] bg-slate-800/80">
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-900 to-transparent" />
          {/* Score badge */}
          <div className="absolute top-3 left-3 h-6 w-14 rounded-full bg-slate-700/80" />
          {/* Status badge */}
          <div className="absolute top-3 right-3 h-6 w-16 rounded-full bg-slate-700/60" />
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[5, 1.5, 1.5, 1.5].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full bg-slate-600/80"
                style={{ width: `${w * 4}px` }} />
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="px-4 pt-3 pb-5 bg-slate-950 space-y-2.5">
          {/* Type/season tags */}
          <div className="flex gap-1.5">
            <div className="h-4 w-12 rounded-full bg-slate-800" />
            <div className="h-4 w-16 rounded-full bg-slate-800" />
          </div>
          {/* Title */}
          <div className="space-y-1.5">
            <div className="h-5 w-4/5 rounded-lg bg-slate-800" />
            <div className="h-5 w-3/5 rounded-lg bg-slate-800/70" />
          </div>
          {/* Studio */}
          <div className="h-3 w-1/3 rounded bg-slate-800/60" />
          {/* Genres */}
          <div className="flex gap-1.5">
            <div className="h-4 w-14 rounded-full bg-slate-800/70" />
            <div className="h-4 w-18 rounded-full bg-slate-800/60" />
            <div className="h-4 w-12 rounded-full bg-slate-800/50" />
          </div>
          {/* CTA */}
          <div className="h-9 w-28 rounded-xl bg-indigo-900/50" />
        </div>
      </div>

      {/* ── TABLET / DESKTOP: landscape ── */}
      <div className="hidden sm:block relative aspect-[21/9] md:aspect-[21/8] lg:aspect-[21/7] bg-slate-800/60">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent" />

        <div className="absolute inset-0 z-10 flex items-center px-10 md:px-14">
          <div className="max-w-lg w-full space-y-3">
            {/* Badges */}
            <div className="flex gap-2">
              <div className="h-5 w-12 rounded-full bg-slate-700/80" />
              <div className="h-5 w-10 rounded-full bg-slate-700/60" />
              <div className="h-5 w-16 rounded-full bg-slate-700/60" />
            </div>
            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 w-3/4 rounded-xl bg-slate-700/80" />
              <div className="h-8 w-1/2 rounded-xl bg-slate-700/60" />
            </div>
            {/* Studio */}
            <div className="h-3 w-1/3 rounded bg-slate-700/50" />
            {/* Genres */}
            <div className="flex gap-1.5">
              <div className="h-4 w-14 rounded-full bg-slate-700/60" />
              <div className="h-4 w-18 rounded-full bg-slate-700/50" />
              <div className="h-4 w-12 rounded-full bg-slate-700/40" />
            </div>
            {/* Synopsis */}
            <div className="space-y-1.5 hidden md:block">
              <div className="h-2.5 w-full rounded bg-slate-700/50" />
              <div className="h-2.5 w-4/5 rounded bg-slate-700/40" />
            </div>
            {/* CTA */}
            <div className="h-10 w-28 rounded-xl bg-indigo-900/50" />
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[5, 1.5, 1.5, 1.5].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-slate-700/80"
              style={{ width: `${w * 4}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
}