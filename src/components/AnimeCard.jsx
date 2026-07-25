import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';

// Pastikan URL selalu punya protocol (API kadang return tanpa https://)
const fixUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://${url}`;
};


export default function AnimeCard({ anime, isNew, rank }) {
  const animeId  = anime.animeId || anime.slug || anime.endpointId || anime.endpoint || anime.id;
  const [imgError, setImgError] = useState(false);
  const posterSrc = fixUrl(anime.poster || anime.image || anime.thumb);


  return (
    <Link
      to={`/detail/${animeId}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-slate-900/40 ring-1 ring-slate-800/60 hover:ring-indigo-500/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
                {!imgError && posterSrc ? (
          <img
            src={posterSrc}
            alt={anime.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-slate-900">
            <ImageOff className="w-7 h-7 text-slate-700" />
            <span className="text-[9px] text-slate-700 text-center px-2 leading-tight line-clamp-2">
              {anime.title}
            </span>
          </div>
        )}

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

        {isNew && !rank && (
          <span className="absolute top-1.5 left-1.5 z-10 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow">
            NEW
          </span>
        )}

        {anime.episodes && (
          <span className="absolute bottom-1.5 left-1.5 z-10 text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
            {anime.episodes} eps
          </span>
        )}
      </div>

      <div className="px-2 pt-2 pb-2.5">
        <h3 className="text-[11px] font-semibold text-slate-300 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
          {anime.title}
        </h3>
      </div>
    </Link>
  );
}