import AnimeCard    from './AnimeCard';
import SkeletonGrid from './SkeletonGrid';

/**
 * AnimeGrid
 * Props:
 * - list         : array anime
 * - loading      : tampilkan skeleton
 * - skeletonCount: jumlah skeleton card
 * - isNew        : boolean — semua card pakai badge NEW (fallback)
 * - isNewFn      : (anime) => boolean — per-item, override isNew
 * - withRank     : tampilkan badge rank
 */
export default function AnimeGrid({
  list,
  isNew        = false,
  isNewFn      = null,
  withRank     = false,
  loading      = false,
  skeletonCount = 18,
}) {
  if (loading) return <SkeletonGrid count={skeletonCount} />;

  if (!list?.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
      <p className="text-sm">Tidak ada anime ditemukan.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
      {list.map((anime, i) => {
        // isNewFn takes priority over isNew boolean
        const showNew = isNewFn ? isNewFn(anime) : isNew;
        return (
          <AnimeCard
            key={anime?.animeId ?? anime?.slug ?? i}
            anime={anime}
            isNew={showNew}
            rank={withRank ? i + 1 : null}
          />
        );
      })}
    </div>
  );
}