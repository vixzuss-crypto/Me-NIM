import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X, ChevronLeft, ChevronDown, Flame } from 'lucide-react';
import {
  home, getRecent, getPopularAnime, searchAnime, getSchedule, getAnimeDetail,
} from '../../api/anime/api';
import { fixUrl, fetchWithRetry, throttledFetch, wait } from '../../lib/utils';
import PodiumSection  from '../../components/PodiumSection';
import AnimeGrid      from '../../components/AnimeGrid';
import HeroCarousel   from '../../components/HeroCarousel';
import SkeletonHero   from '../../components/SkeletonHero';
import Pagination     from '../../components/Pagination';

const INITIAL_COUNT  = 15;
const SYNOPSIS_LIMIT = 150; // karakter maksimal sinopsis hero

// Cek apakah tanggal string termasuk "hari ini" atau "kemarin" (dalam 24 jam)
function isToday(dateStr) {
  if (!dateStr) return false;
  try {
    const d    = new Date(dateStr);
    const now  = new Date();
    const diff = now - d;
    return diff >= 0 && diff < 86400000;
  } catch { return false; }
}

// ── Acak & ambil n item ───────────────────────────────────────────────────────
function sample(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// ── Enrich hero items (dijalankan di home, bukan di HeroCarousel) ─────────────
async function enrichHeroItems(rawList, signal) {
  const picked  = sample(rawList.filter((a) => a.animeId), 5);
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

      const rawSynopsis = d?.synopsis?.paragraphs?.[0] || '';
      const synopsis    = rawSynopsis.length > SYNOPSIS_LIMIT
        ? rawSynopsis.slice(0, SYNOPSIS_LIMIT).trimEnd() + '...'
        : rawSynopsis;

      results.push({
        animeId:  anime.animeId,
        title:    d?.title    || anime.title,
        poster,
        score:    d?.score?.value ?? d?.score ?? anime.score ?? null,
        status:   d?.status   || '',
        type:     d?.type     || '',
        season:   d?.season   || '',
        studios:  d?.studios  || '',
        synopsis,
        genres:   (d?.genreList || []).slice(0, 3).map((g) => g.title),
      });
    } catch (e) {
      if (e?.name === 'AbortError') break;
    }
  }
  return results;
}

export default function Home() {
  const [recentList,   setRecentList]   = useState([]);
  const [heroItems,    setHeroItems]    = useState([]);   // sudah di-enrich
  const [topAnime,     setTopAnime]     = useState([]);
  const [searchList,   setSearchList]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page,         setPage]         = useState(1);
  const [showAll,      setShowAll]      = useState(false);

  const sectionRef      = useRef(null);
  const coverMapRef     = useRef({});
  const detailMapRef    = useRef({});
  const schedulePromise = useRef(null);
  const popularCache    = useRef(null);

  // ── Schedule: fetch sekali, cache di Promise ──────────────────────────────
  const ensureSchedule = useCallback(() => {
    if (!schedulePromise.current) {
      schedulePromise.current = (async () => {
        try {
          await wait(1000);
          const res = await fetchWithRetry(
            () => throttledFetch(() => getSchedule()),
            'schedule', null,
          );
          if (res?.data?.data?.days) {
            for (const day of res.data.data.days) {
              for (const anime of (day.animeList || [])) {
                if (anime.animeId && anime.poster) {
                  coverMapRef.current[anime.animeId] = fixUrl(anime.poster);
                }
              }
            }
          }
        } catch (_) {}
      })();
    }
    return schedulePromise.current;
  }, []);

  // ── Detail fetch untuk poster yang missing ────────────────────────────────
  const fetchMissingDetails = useCallback(async (list, limit = 3, signal = null) => {
    const ids = list
      .filter((a) => a.animeId && !detailMapRef.current[a.animeId] && !coverMapRef.current[a.animeId])
      .map((a) => a.animeId)
      .slice(0, limit);

    for (const id of ids) {
      if (signal?.aborted) break;
      try {
        const res = await fetchWithRetry(
          () => throttledFetch(() => getAnimeDetail(id), signal),
          `detail:${id}`, signal,
        );
        if (signal?.aborted) break;
        const data = res?.data?.data || res?.data;
        const p    = data?.poster || data?.image || data?.cover;
        if (p) detailMapRef.current[id] = fixUrl(p);
        await wait(900);
      } catch (_) {}
    }
  }, []);

  // ── Merge poster ──────────────────────────────────────────────────────────
  const applyPosterCache = useCallback((list) =>
    list.map((a) => ({
      ...a,
      poster: fixUrl(
        detailMapRef.current[a.animeId] ||
        coverMapRef.current[a.animeId]  ||
        a.poster || ''
      ) || null,
    })), []);

  // ── Main fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    const ac = new AbortController();

    const run = async () => {
      setLoading(true);
      setHeroItems([]);
      setRecentList([]);
      setTopAnime([]);

      try {
        // ── SEARCH MODE ──
        if (activeSearch) {
          const searchKey = `search:${activeSearch}:page${page}`;
          const res = await fetchWithRetry(
            () => throttledFetch(() => searchAnime(activeSearch, page), ac.signal),
            searchKey, ac.signal,
          );
          if (ac.signal.aborted || !res) return;
          const d = res?.data?.data;
          setSearchList(Array.isArray(d) ? d : (d?.animeList ?? []));
          return;
        }

        // ── HOME MODE ──
        let listPage1 = [];
        let rawHeroList = [];

        if (page === 1) {
          const res = await fetchWithRetry(
            () => throttledFetch(() => home(), ac.signal),
            `home:page1`, ac.signal,
          );
          if (ac.signal.aborted || !res) return;
          listPage1   = res?.data?.data?.recent?.animeList ?? [];
          rawHeroList = listPage1.filter((a) => a.animeId && a.poster);
        } else {
          const res = await fetchWithRetry(
            () => throttledFetch(() => getRecent(page), ac.signal),
            `recent:page${page}`, ac.signal,
          );
          if (ac.signal.aborted || !res) return;
          listPage1 = res?.data?.data?.animeList ?? [];
        }

        // ── Jalankan enrich hero + schedule + getRecent(page+1) SECARA PARALEL ──
        // enrichHeroItems & popular bisa jalan bersamaan dengan schedule & recent
        const scheduleTask = ensureSchedule();

        const heroTask = page === 1 && rawHeroList.length > 0
          ? enrichHeroItems(rawHeroList, ac.signal)
          : Promise.resolve([]);

        await wait(1200);
        if (ac.signal.aborted) return;

        const res2 = await fetchWithRetry(
          () => throttledFetch(() => getRecent(page + 1), ac.signal),
          `recent:page${page + 1}`, ac.signal,
        );
        if (ac.signal.aborted || !res2) return;
        const listPage2 = res2?.data?.data?.animeList ?? [];

        // Tunggu schedule selesai isi coverMapRef
        await scheduleTask;
        if (ac.signal.aborted) return;

        const seen = new Set();
        const allCards = [...listPage1, ...listPage2].filter((a) => {
          const key = a.animeId || a.slug;
          if (!key || seen.has(key)) return false;
          seen.add(key); return true;
        });

        await fetchMissingDetails(allCards, 3, ac.signal);
        if (ac.signal.aborted) return;

        const merged = applyPosterCache(allCards);

        // Popular fetch (page 1 saja, cache) — paralel dengan heroTask yang masih jalan
        let popList = popularCache.current;
        if (page === 1 && !popList) {
          await wait(1500);
          if (ac.signal.aborted) return;
          try {
            const rp = await fetchWithRetry(
              () => throttledFetch(() => getPopularAnime(1), ac.signal),
              'popular:page1', ac.signal,
            );
            if (!ac.signal.aborted && rp) {
              const pop = rp?.data?.data?.animeList ?? [];
              if (pop.length >= 3) {
                popularCache.current = pop.slice(0, 10);
                popList = popularCache.current;
              }
            }
          } catch (_) {}
        }

        // Tunggu hero enrich selesai — biasanya sudah selesai duluan karena jalan paralel
        const enriched = await heroTask;
        if (ac.signal.aborted) return;

        // Set SEMUA state sekaligus — hero + cards + podium muncul bersamaan
        if (!ac.signal.aborted) {
          setRecentList(merged);
          setShowAll(false);
          if (popList)              setTopAnime(popList);
          if (enriched.length > 0) setHeroItems(enriched);
        }

      } catch (err) {
        if (!ac.signal.aborted) console.error('[Home]', err);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    };

    run();
    return () => { ac.abort(); };
  }, [page, activeSearch, ensureSchedule, fetchMissingDetails, applyPosterCache]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setPage(1); setActiveSearch(searchQuery.trim());
  };

  const clearSearch = () => { setSearchQuery(''); setActiveSearch(''); setPage(1); };

  const changePage = (next) => {
    setPage(next); setShowAll(false);
    setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const visibleList = page === 1 && !showAll ? recentList.slice(0, INITIAL_COUNT) : recentList;
  const hasMore     = page === 1 && !showAll && recentList.length > INITIAL_COUNT;

  const tagAsNew = (anime) => isToday(anime?.updatedAt || anime?.date || anime?.releaseDate);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">

      {/* ── SEARCH BAR ──────────────────────────────────────────────────── */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-xl
                pl-9 pr-10 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors
                placeholder:text-slate-600"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-2.5
              rounded-xl transition-colors flex items-center gap-1.5 shrink-0">
            <Search className="w-3.5 h-3.5" /> Cari
          </button>
        </form>

        {activeSearch && (
          <button onClick={clearSearch}
            className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            <ChevronLeft className="w-3 h-3" /> Kembali ke Beranda
          </button>
        )}
      </div>

      {activeSearch ? (

        /* ── SEARCH RESULTS ─────────────────────────────────────────── */
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 mb-0.5">Hasil pencarian</p>
              <h2 className="text-lg font-black text-white">"{activeSearch}"</h2>
            </div>
            {searchList.length > 0 && (
              <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                {searchList.length} anime
              </span>
            )}
          </div>
          <AnimeGrid list={searchList} loading={loading} />
          {!loading && searchList.length > 0 && (
            <Pagination page={page}
              onPrev={() => changePage(Math.max(1, page - 1))}
              onNext={() => changePage(page + 1)} />
          )}
        </div>

      ) : (

        /* ── BERANDA ────────────────────────────────────────────────── */
        <div className="space-y-10">

          {/* Hero carousel — hanya page 1, skeleton saat loading */}
          {page === 1 && (
            loading
              ? <SkeletonHero />
              : heroItems.length > 0
                ? <HeroCarousel items={heroItems} />
                : null
          )}

          {/* Update Terbaru */}
          <section ref={sectionRef} className="scroll-mt-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" /> Update Terbaru
              </h2>
              <span className="text-[11px] text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                Hal {page}
              </span>
            </div>

            <AnimeGrid
              list={visibleList}
              loading={loading}
              isNewFn={tagAsNew}
            />

            {!loading && hasMore && (
              <div className="flex justify-center mt-5">
                <button onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400
                    hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800
                    px-5 py-2 rounded-xl transition-all">
                  <ChevronDown className="w-3.5 h-3.5" />
                  Tampilkan lebih banyak ({recentList.length - INITIAL_COUNT} lagi)
                </button>
              </div>
            )}

            {!loading && (!hasMore || showAll) && (
              <Pagination
                page={page}
                onPrev={() => changePage(Math.max(1, page - 1))}
                onNext={() => changePage(page + 1)} />
            )}
          </section>

          {/* Podium + mini carousel rank 4–10 — skeleton saat loading */}
          {loading
            ? <SkeletonPodium />
            : topAnime.length >= 3
              ? <PodiumSection topAnime={topAnime} />
              : null
          }
        </div>
      )}
    </main>
  );
}

// ── Skeleton Podium — placeholder saat loading ─────────────────────────────
function SkeletonPodium() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-40 rounded-lg bg-slate-800/70" />
      <div className="flex items-end justify-center gap-3 h-48">
        <div className="w-1/4 h-36 rounded-2xl bg-slate-800/60" />
        <div className="w-1/4 h-48 rounded-2xl bg-slate-800/70" />
        <div className="w-1/4 h-32 rounded-2xl bg-slate-800/50" />
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl bg-slate-800/50" />
        ))}
      </div>
    </div>
  );
}