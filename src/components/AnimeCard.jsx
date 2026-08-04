import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Star, Film, ImageOff, Image as ImageIcon } from 'lucide-react';
import { fixUrl } from '../lib/utils';
import useAnimeImage from '../hooks/useAnimeImage';

export default function AnimeCard({ anime, isNew = false, rank = null }) {
  const animeId   = anime?.animeId || anime?.slug || anime?.id;
  const rawPoster = fixUrl(anime?.poster || anime?.image || anime?.thumb || '');
  const episodes  = anime?.episodes ?? anime?.totalEpisodes ?? null;
  const score     = anime?.score?.value ?? anime?.score ?? null;
  const type      = anime?.type ?? null;
  const isMovie   = type?.toLowerCase() === 'movie';

  // imgState: 'loading' | 'loaded' | 'error'
  const [imgState, setImgState] = useState('loading');

  const { src, failed, handleError } = useAnimeImage(rawPoster, anime?.title, animeId);

  return (
    <Link
      to={`/detail/${animeId}`}
      className="group relative flex flex-col gap-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
    >
      {/* ── Poster ──────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800/60
        group-hover:border-indigo-500/40 transition-all duration-300 shadow-md group-hover:shadow-indigo-500/10 group-hover:shadow-lg">

        {/* Skeleton shimmer — tampil selama gambar belum ready */}
        {imgState === 'loading' && !failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 animate-pulse">
            <ImageIcon className="w-7 h-7 text-slate-700/60" />
            {/* shimmer bar di bagian bawah */}
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-slate-800/80 to-transparent" />
          </div>
        )}

        {/* Gambar aktual */}
        {src && !failed ? (
          <img
            src={src}
            alt={anime?.title ?? ''}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-500
              group-hover:scale-105
              ${imgState === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgState('loaded')}
            onError={() => { setImgState('error'); handleError(); }}
          />
        ) : failed ? (
          /* Fallback final — icon ImageOff */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-900">
            <ImageOff className="w-7 h-7 text-slate-700" />
            <span className="text-[9px] text-slate-700 text-center px-2 leading-tight line-clamp-2">
              {anime?.title ?? ''}
            </span>
          </div>
        ) : null}

        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <PlayCircle className="w-9 h-9 text-white drop-shadow-lg" />
        </div>

        {/* ── Badges ──────────────────────────────────────────────────────── */}
        {rank !== null && (
          <div className={`absolute top-1.5 left-1.5 min-w-[20px] h-5 px-1 rounded-md
            flex items-center justify-center text-[9px] font-black shadow-md
            ${rank === 1 ? 'bg-amber-400 text-slate-950' :
              rank === 2 ? 'bg-slate-300 text-slate-950' :
              rank === 3 ? 'bg-amber-700 text-white' :
              'bg-slate-800/90 text-slate-300 border border-slate-700'}`}>
            #{rank}
          </div>
        )}

        {isNew && rank === null && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black
            bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            NEW
          </div>
        )}

        {episodes !== null && (
          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold
            bg-black/70 text-slate-200 backdrop-blur-sm flex items-center gap-1">
            {isMovie ? <Film className="w-2.5 h-2.5" /> : null}
            {isMovie ? 'Movie' : `${episodes} eps`}
          </div>
        )}

        {score && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold
            bg-black/70 text-amber-400 backdrop-blur-sm flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            {typeof score === 'number' ? score.toFixed(1) : score}
          </div>
        )}
      </div>

      {/* ── Title ───────────────────────────────────────────────────────────── */}
      <p className="mt-1.5 text-[11px] font-semibold text-slate-300 group-hover:text-white
        line-clamp-2 leading-tight transition-colors duration-200 px-0.5">
        {anime?.title ?? '—'}
      </p>
    </Link>
  );
}