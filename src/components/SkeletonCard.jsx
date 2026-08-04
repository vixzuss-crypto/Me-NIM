// SkeletonCard — animasi shimmer pulse sesuai layout AnimeCard (aspect 3/4)
export default function SkeletonCard() {
  return (
    <div className="flex flex-col gap-0 rounded-xl animate-pulse">
      {/* Poster placeholder */}
      <div className="aspect-[3/4] w-full rounded-xl bg-slate-800/70" />
      {/* Title placeholder */}
      <div className="mt-1.5 space-y-1 px-0.5">
        <div className="h-2.5 w-full rounded bg-slate-800/70" />
        <div className="h-2.5 w-3/4 rounded bg-slate-800/50" />
      </div>
    </div>
  );
}