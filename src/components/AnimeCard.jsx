import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';

export default function AnimeCard({ anime, isNew, rank }) {
  const animeId = anime.animeId || anime.slug || anime.endpointId || anime.endpoint || anime.id;

  return (
    <Link
      to={`/detail/${animeId}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-slate-900/40 ring-1 ring-slate-800/60 hover:ring-indigo-500/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      {/* Poster */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
        <img
          src={anime.poster || anime.image || anime.thumb}
          alt={anime.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Rank number watermark (untuk halaman ranking) */}
        {rank && (
          <span
            className="absolute -bottom-2 -right-1 text-[56px] font-black leading-none select-none pointer-events-none"
            style={{
              color: rank <= 3 ? 'rgba(251,191,36,0.18)' : 'rgba(148,163,184,0.10)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {rank}
          </span>
        )}

        {/* Rank badge kecil (top-left) */}
        {rank && (
          <div className={`absolute top-1.5 left-1.5 z-10 h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black shadow
            ${rank === 1 ? 'bg-amber-400 text-slate-950' :
              rank === 2 ? 'bg-slate-300 text-slate-950' :
              rank === 3 ? 'bg-amber-700 text-white' :
              'bg-slate-800/90 text-slate-300 ring-1 ring-slate-700'}`}
          >
            {rank}
          </div>
        )}

        {/* NEW badge */}
        {isNew && !rank && (
          <span className="absolute top-1.5 left-1.5 z-10 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow">
            NEW
          </span>
        )}

        {/* Eps count */}
        {anime.episodes && (
          <span className="absolute bottom-1.5 left-1.5 z-10 text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
            {anime.episodes} eps
          </span>
        )}

        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-indigo-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
            <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="px-2 pt-2 pb-2.5">
        <h3 className="text-[11px] font-semibold text-slate-300 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
          {anime.title}
        </h3>
      </div>
    </Link>
  );
}