import AnimeCard from './AnimeCard';

export default function AnimeGrid({ list, isNew = false, withRank = false }) {
  if (!list?.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
      <p className="text-sm">Tidak ada anime ditemukan.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
      {list.map((anime, i) => (
        <AnimeCard
          key={anime?.animeId ?? anime?.slug ?? i}
          anime={anime}
          isNew={isNew}
          rank={withRank ? i + 1 : null}
        />
      ))}
    </div>
  );
}
