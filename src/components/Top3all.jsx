import { Link } from 'react-router-dom';
import { Star, Trophy } from 'lucide-react';
import AnimeImg from './AnimeImg';

function PodiumCard({ anime, rank }) {
  const animeId = anime?.animeId || anime?.slug;
  const rawPoster = anime?.poster || anime?.image || '';
  const score   = anime?.score?.value ?? anime?.score ?? null;

  const colors = {
    1: { ring: 'ring-amber-400',   badge: 'bg-amber-400 text-slate-950',   label: '🥇', h: 'h-44' },
    2: { ring: 'ring-slate-400',   badge: 'bg-slate-300 text-slate-950',   label: '🥈', h: 'h-36' },
    3: { ring: 'ring-amber-700',   badge: 'bg-amber-700 text-white',       label: '🥉', h: 'h-32' },
  }[rank] ?? { ring: 'ring-slate-700', badge: 'bg-slate-800 text-slate-300', label: `#${rank}`, h: 'h-28' };

  return (
    <Link to={`/detail/${animeId}`} className="flex flex-col items-center gap-2 group w-full max-w-[120px]">
      {/* Rank badge */}
      <span className="text-xl">{colors.label}</span>

      {/* Poster */}
      <div className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden ring-2 ${colors.ring}
        shadow-lg group-hover:scale-105 transition-transform duration-300`}>
        <AnimeImg
          src={rawPoster}
          title={anime?.title}
          animeId={animeId}
          alt={anime?.title}
          className="w-full h-full object-cover"
          showTitle={false}
        />
        {score && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5
            bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[9px] font-bold text-amber-400">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            {typeof score === 'number' ? score.toFixed(1) : score}
          </div>
        )}
      </div>

      {/* Title */}
      <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white
        text-center line-clamp-2 leading-tight transition-colors">
        {anime?.title ?? '—'}
      </p>
    </Link>
  );
}

export default function Top3all({ popularTop3 = [] }) {
  if (!popularTop3?.length) return null;

  // urutan tampil: 2nd | 1st | 3rd (podium style)
  const [first, second, third] = popularTop3;
  const display = [
    { anime: second, rank: 2 },
    { anime: first,  rank: 1 },
    { anime: third,  rank: 3 },
  ].filter((d) => d.anime);

  return (
    <section className="mt-4">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-4 h-4 text-amber-400" />
        <h2 className="text-base font-bold text-white">Top Anime Populer</h2>
      </div>

      <div className="flex items-end justify-center gap-4 sm:gap-8">
        {display.map(({ anime, rank }) => (
          <PodiumCard key={rank} anime={anime} rank={rank} />
        ))}
      </div>
    </section>
  );
}