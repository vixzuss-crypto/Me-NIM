import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import { fixUrl } from '../lib/utils';
import AnimeImg from './AnimeImg';

export default function Carousel({ items = [] }) {
  const [idx,     setIdx]     = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef(null);

  const go = (next) => setIdx((next + items.length) % items.length);

  useEffect(() => {
    if (!items.length || paused) return;
    timerRef.current = setInterval(() => go(idx + 1), 5000);
    return () => clearInterval(timerRef.current);
  }, [idx, paused, items.length]);

  if (!items.length) return null;

  const anime = items[idx];
  const poster = fixUrl(anime?.poster || anime?.image || '');
  const score  = anime?.score?.value ?? anime?.score ?? null;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-slate-800/60
        aspect-[21/9] sm:aspect-[21/8] bg-slate-900 shadow-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* BG blur */}
      {poster && (
        <AnimeImg
          src={poster}
          title={anime?.title}
          animeId={anime?.animeId}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-30 pointer-events-none select-none"
          showTitle={false}
          aria-hidden
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 flex h-full items-end sm:items-center p-5 sm:p-8 gap-6">
        {/* Poster thumb */}
        {poster && (
          <AnimeImg
            src={poster}
            title={anime?.title}
            animeId={anime?.animeId}
            alt={anime?.title}
            className="hidden sm:block w-24 h-36 object-cover rounded-xl border border-slate-700/60
              shadow-xl shrink-0 ring-1 ring-white/10"
            showTitle={false}
          />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          {score && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{score}</span>
            </div>
          )}
          <h2 className="text-lg sm:text-2xl font-black text-white line-clamp-2 leading-tight mb-3 drop-shadow">
            {anime?.title}
          </h2>
          <Link
            to={`/detail/${anime?.animeId || anime?.slug}`}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500
              text-white text-xs font-bold px-4 py-2 rounded-xl transition-all
              shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Tonton Sekarang
          </Link>
        </div>
      </div>

      {/* Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => go(idx - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full
              bg-black/40 hover:bg-black/70 border border-slate-700/60 flex items-center justify-center
              text-white transition-all hover:scale-110"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => go(idx + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full
              bg-black/40 hover:bg-black/70 border border-slate-700/60 flex items-center justify-center
              text-white transition-all hover:scale-110"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-300 ${
                i === idx
                  ? 'w-5 h-1.5 bg-indigo-400'
                  : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}