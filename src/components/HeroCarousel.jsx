import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Tv2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { getAnimeDetail } from '../api/anime/api';
import { fixUrl, fetchWithRetry, throttledFetch } from '../lib/utils';
import AnimeImg from './AnimeImg';

const sample = (arr, n) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

async function enrichItems(rawList, signal) {
  const picked = sample(rawList.filter((a) => a.animeId), 5);
  const results = [];

  for (const anime of picked) {
    if (signal.aborted) break;
    try {
      const res = await fetchWithRetry(
        () => throttledFetch(() => getAnimeDetail(anime.animeId), signal),
        `detail:${anime.animeId}`,
        signal,
      );
      if (signal.aborted) break;
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
    } catch (e) {
      if (e?.name === 'AbortError') break;
    }
  }
  return results;
}

// ── Slide indicator dots ──────────────────────────────────────────────────────
function Dots({ count, active, onSelect }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Slide ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === active
              ? 'w-5 h-1.5 bg-indigo-400 shadow-sm shadow-indigo-400/60'
              : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
          }`}
        />
      ))}
    </div>
  );
}

// ── Nav arrow button ──────────────────────────────────────────────────────────
function NavBtn({ dir, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Sebelumnya' : 'Berikutnya'}
      className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70
        border border-white/10 hover:border-white/25
        flex items-center justify-center text-white
        transition-all duration-200 hover:scale-105 active:scale-95
        backdrop-blur-sm"
    >
      {dir === 'prev'
        ? <ChevronLeft  className="w-4 h-4" />
        : <ChevronRight className="w-4 h-4" />
      }
    </button>
  );
}

export default function HeroCarousel({ rawList = [] }) {
  const [items,    setItems]    = useState([]);
  const [idx,      setIdx]      = useState(0);
  const [loaded,   setLoaded]   = useState(false);
  const [paused,   setPaused]   = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const controllerRef = useRef(null);
  const enrichedRef   = useRef(false);
  const timerRef      = useRef(null);

  // Touch/swipe state
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    if (!rawList.length) return;
    if (controllerRef.current) controllerRef.current.abort();
    const ac = new AbortController();
    controllerRef.current = ac;
    enrichedRef.current   = false;

    enrichItems(rawList, ac.signal).then((enriched) => {
      if (ac.signal.aborted || enrichedRef.current) return;
      if (!enriched.length) return;
      enrichedRef.current = true;
      setItems(enriched);
      setIdx(0);
      setLoaded(true);
    }).catch(() => {});

    return () => { ac.abort(); };
  }, [rawList.length]);

  const go = useCallback((next) => {
    setImgReady(false);
    setIdx((prev) => (next + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!items.length || paused) return;
    timerRef.current = setInterval(() => go(idx + 1), 7000);
    return () => clearInterval(timerRef.current);
  }, [idx, paused, items.length, go]);

  // Touch handlers untuk swipe di mobile
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setPaused(true);
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Hanya proses swipe horizontal (bukan scroll vertikal)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      go(dx < 0 ? idx + 1 : idx - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
    setPaused(false);
  };

  if (!loaded || !items.length) return null;

  const anime = items[idx];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-slate-950 shadow-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── MOBILE layout: poster atas + info bawah ── */}
      <div className="block sm:hidden">
        {/* Poster */}
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <AnimeImg
            key={`mob-${anime.poster}`}
            src={anime.poster}
            title={anime.title}
            animeId={anime.animeId}
            alt=""
            aria-hidden
            onLoad={() => setImgReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              imgReady ? 'opacity-100' : 'opacity-0'
            }`}
            showTitle={false}
          />
          {/* gradient bawah poster */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />

          {/* Score badge di pojok kiri atas */}
          {anime.score && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1
              bg-black/60 backdrop-blur-sm border border-amber-400/30
              text-amber-400 text-[11px] font-bold px-2 py-1 rounded-full">
              <Star className="w-3 h-3 fill-amber-400" />
              {typeof anime.score === 'number' ? anime.score.toFixed(1) : anime.score}
            </div>
          )}

          {/* Status badge pojok kanan atas */}
          {anime.status && (
            <div className={`absolute top-3 right-3 z-10 text-[10px] font-bold px-2 py-1 rounded-full border backdrop-blur-sm ${
              anime.status === 'Ongoing'
                ? 'text-emerald-400 bg-emerald-400/15 border-emerald-400/30'
                : 'text-slate-300 bg-black/50 border-white/15'
            }`}>
              {anime.status}
            </div>
          )}

          {/* Dots navigasi */}
          {items.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <Dots count={items.length} active={idx} onSelect={(i) => { setImgReady(false); setIdx(i); }} />
            </div>
          )}
        </div>

        {/* Info panel di bawah poster */}
        <div className="px-4 pt-3 pb-5 bg-slate-950">
          {/* Tags type/season */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {anime.type && (
              <span className="text-[10px] font-semibold text-slate-400 bg-white/8 px-2 py-0.5 rounded-full border border-white/10">
                {anime.type}
              </span>
            )}
            {anime.season && (
              <span className="text-[10px] font-semibold text-slate-400 bg-white/8 px-2 py-0.5 rounded-full border border-white/10">
                {anime.season}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg font-black text-white leading-tight mb-1.5 line-clamp-2">
            {anime.title}
          </h2>

          {/* Studio */}
          {anime.studios && (
            <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
              <Tv2 className="w-3 h-3 shrink-0" /> {anime.studios}
            </p>
          )}

          {/* Genres */}
          {anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {anime.genres.map((g) => (
                <Link
                  key={g}
                  to={`/genres/${g.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-[10px] font-semibold text-indigo-300
                    bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full
                    hover:bg-indigo-500/25 transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <Link
            to={`/detail/${anime.animeId}`}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
              text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all
              shadow-lg shadow-indigo-600/30 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Lihat Detail
          </Link>

          {/* Swipe hint */}
          {items.length > 1 && (
            <p className="mt-3 text-[10px] text-slate-700 text-center select-none">
              Geser untuk beralih
            </p>
          )}
        </div>
      </div>

      {/* ── TABLET / DESKTOP layout: landscape dengan overlay ── */}
      <div className="hidden sm:block relative aspect-[21/9] md:aspect-[21/8] lg:aspect-[21/7]">
        {/* BG gambar */}
        <AnimeImg
          key={`desk-${anime.poster}`}
          src={anime.poster}
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
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 flex h-full items-center px-8 sm:px-10 md:px-14">
          <div className="max-w-lg w-full">
            {/* Meta badges */}
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
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-2 drop-shadow-lg line-clamp-2">
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
              <div className="flex flex-wrap gap-1.5 mb-3">
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
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-5 max-w-sm hidden md:block">
                {anime.synopsis}
              </p>
            )}

            {/* CTA */}
            <Link
              to={`/detail/${anime.animeId}`}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
                text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all
                shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Lihat Detail
            </Link>
          </div>
        </div>

        {/* Nav arrows */}
        {items.length > 1 && (
          <>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30">
              <NavBtn dir="prev" onClick={() => go(idx - 1)} />
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30">
              <NavBtn dir="next" onClick={() => go(idx + 1)} />
            </div>
          </>
        )}

        {/* Dots */}
        {items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
            <Dots count={items.length} active={idx} onSelect={(i) => { setImgReady(false); setIdx(i); }} />
          </div>
        )}
      </div>
    </div>
  );
}