// SkeletonHero — placeholder saat HeroCarousel masih loading
export default function SkeletonHero() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 animate-pulse
      aspect-[21/9] sm:aspect-[21/8] md:aspect-[21/7]">
      {/* Gradient shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/80 to-slate-900/40" />

      {/* Content placeholder */}
      <div className="absolute inset-0 z-20 flex h-full items-end sm:items-center px-6 sm:px-10 pb-8 sm:pb-0">
        <div className="max-w-lg w-full space-y-3">
          {/* Badge row */}
          <div className="flex gap-2">
            <div className="h-4 w-14 rounded-full bg-slate-700/80" />
            <div className="h-4 w-12 rounded-full bg-slate-700/60" />
            <div className="h-4 w-16 rounded-full bg-slate-700/60" />
          </div>
          {/* Title */}
          <div className="space-y-2">
            <div className="h-7 w-4/5 rounded-lg bg-slate-700/80" />
            <div className="h-7 w-3/5 rounded-lg bg-slate-700/60" />
          </div>
          {/* Studio */}
          <div className="h-3 w-1/3 rounded bg-slate-700/50" />
          {/* Genres */}
          <div className="flex gap-1.5">
            <div className="h-4 w-16 rounded-full bg-slate-700/60" />
            <div className="h-4 w-20 rounded-full bg-slate-700/50" />
            <div className="h-4 w-14 rounded-full bg-slate-700/40" />
          </div>
          {/* Synopsis */}
          <div className="space-y-1.5">
            <div className="h-2.5 w-full rounded bg-slate-700/50" />
            <div className="h-2.5 w-4/5 rounded bg-slate-700/40" />
          </div>
          {/* CTA */}
          <div className="h-9 w-28 rounded-xl bg-indigo-900/50 mt-1" />
        </div>
      </div>
    </div>
  );
}