import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Tv2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAnimeDetail } from '../api/anime/api';
import { fixUrl, fetchWithRetry, throttledFetch, wait } from '../lib/utils';
import AnimeImg from './AnimeImg';

const sample = (arr, n) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

async function enrichItems(rawList, abortRef) {
  const picked = sample(rawList.filter((a) => a.animeId), 5);
  const results = [];

  for (const anime of picked) {
    if (abortRef.current) break;
    try {
      const res = await fetchWithRetry(() => throttledFetch(() => getAnimeDetail(anime.animeId)));
      if (abortRef.current) break;
      const d      = res?.data?.data || res?.data;
      const poster = fixUrl(d?.poster || d?.image || anime.poster || '');
      if (!poster) continue;
      results.push({
        animeId:  anime.animeId,
        title:    d?.title    || anime.title,
        poster,
        score:    d?.score?.value ?? d?.score ?? anime.score ?? null,
        status:   d?.status   || '',
        type:     d?.type     || '',
        season:   d?.season   || '',
        studios:  d?.studios  || '',
        synopsis: d?.synopsis?.paragraphs?.[0] || '',
        genres:   (d?.genreList || []).slice(0, 3).map((g) => g.title),
      });
    } catch (_) { /* skip */ }
  }
  return results;
}

export default function HeroCarousel({ rawList = [] }) {
  const [items,    setItems]    = useState([]);
  const [idx,      setIdx]      = useState(0);
  const [loaded,   setLoaded]   = useState(false);
  const [paused,   setPaused]   = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const abortRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!rawList.length) return;
    abortRef.current = false;

    enrichItems(rawList, abortRef).then((enriched) => {
      if (abortRef.current || !enriched.length) return;
      setItems(enriched);
      setIdx(0);
      setLoaded(true);
    });

    return () => { abortRef.current = true; };
  }, [rawList.length]);

  const go = useCallback((next) => {
    setImgReady(false);
    setIdx((next + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!items.length || paused) return;
    timerRef.current = setInterval(() => go(idx + 1), 7000);
    return () => clearInterval(timerRef.current);
  }, [idx, paused, items.length, go]);

  if (!loaded || !items.length) return null;

  const anime  = items[idx];
  const poster = anime.poster;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-slate-950 shadow-2xl
        aspect-[21/9] sm:aspect-[21/8] md:aspect-[21/7]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* BG full-bleed — pakai AnimeImg agar fallback chain aktif */}
      <AnimeImg
        key={poster}
        src={poster}
        title={anime.title}
        animeId={anime.animeId}
        alt=""
        aria-hidden
        onLoad={() => setImgReady(true)}
        className={`absolute inset-0 w-full h-full object-cover scale-105
          transition-opacity duration-700 pointer-events-none select-none
          ${imgReady ? 'opacity-100' : 'opacity-0'}`}
        showTitle={false}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 flex h-full items-end sm:items-center px-6 sm:px-10 pb-8 sm:pb-0">
        <div className="max-w-lg">

          {/* Meta tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {anime.score && (
              <span className="inline-flex items-center gap-1 bg-amber-400/15 border border-amber-400/30
                text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                {typeof anime.score === 'number' ? anime.score.toFixed(1) : anime.score}
              </span>
            )}
            {anime.type && (
              <span className="text-[10px] font-semibold text-slate-400 bg-white/8 px-2 py-0.5 rounded-full border border-white/10">
                {anime.type}
              </span>
            )}
            {anime.status && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                anime.status === 'Ongoing'
                  ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                  : 'text-slate-400 bg-white/8 border-white/10'
              }`}>
                {anime.status}
              </span>
            )}
            {anime.season && (
              <span className="text-[10px] font-semibold text-slate-400 bg-white/8 px-2 py-0.5 rounded-full border border-white/10">
                {anime.season}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-3xl font-black text-white leading-tight mb-2 drop-shadow-lg line-clamp-2">
            {anime.title}
          </h2>

          {/* Studio */}
          {anime.studios && (
            <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
              <Tv2 className="w-3 h-3" /> {anime.studios}
            </p>
          )}

          {/* Genres */}
          {anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {anime.genres.map((g) => (
                <Link
                  key={g}
                  to={`/genres/${g.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10
                    border border-indigo-500/20 px-2 py-0.5 rounded-full
                    hover:bg-indigo-500/20 transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>
          )}

          {/* Synopsis */}
          {anime.synopsis && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-5 max-w-sm">
              {anime.synopsis}
            </p>
          )}

          {/* CTA */}
          <Link
            to={`/detail/${anime.animeId}`}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
              text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all
              shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Lihat Detail
          </Link>
        </div>
      </div>

      {/* Nav arrows */}
      {items.length > 1 && (
        <>
          <button onClick={() => go(idx - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full
              bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center
              text-white transition-all hover:scale-110">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => go(idx + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full
              bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center
              text-white transition-all hover:scale-110">
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {items.map((_, i) => (
            <button key={i}
              onClick={() => { setImgReady(false); setIdx(i); }}
              className={`rounded-full transition-all duration-300 ${
                i === idx ? 'w-6 h-1.5 bg-indigo-400' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}