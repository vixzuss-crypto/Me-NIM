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

const INITIAL_COUNT = 15;

export default function Home() {
  const [recentList,   setRecentList]   = useState([]);
  const [heroItems,    setHeroItems]    = useState([]); // raw list buat HeroCarousel
  const [topAnime,     setTopAnime]     = useState([]); // rank 1–10 buat PodiumSection
  const [searchList,   setSearchList]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [heroLoading,  setHeroLoading]  = useState(true); // carousel loading — set false segera setelah step 1
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page,         setPage]         = useState(1);
  const [showAll,      setShowAll]      = useState(false);

  const sectionRef      = useRef(null);
  const coverMapRef     = useRef({});
  const detailMapRef    = useRef({});
  const schedulePromise = useRef(null);
  const popularCache    = useRef(null);   // cache top 10
  const abortRef        = useRef(false);

  // ── Schedule: fetch sekali, cache di Promise ──────────────────────────────
  const ensureSchedule = useCallback(() => {
    if (!schedulePromise.current) {
      schedulePromise.current = (async () => {
        try {
          await wait(1000); // beri jeda lebih besar sebelum schedule fetch
          const res = await fetchWithRetry(() => throttledFetch(() => getSchedule()), 2000);
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
  const fetchMissingDetails = useCallback(async (list, limit = 3) => {
    // Kurangi limit dari 5 → 3 untuk menekan jumlah request
    const ids = list
      .filter((a) => a.animeId && !detailMapRef.current[a.animeId] && !coverMapRef.current[a.animeId])
      .map((a) => a.animeId)
      .slice(0, limit);

    for (const id of ids) {
      if (abortRef.current) break;
      try {
        const res  = await fetchWithRetry(() => throttledFetch(() => getAnimeDetail(id)), 2000);
        if (abortRef.current) break;
        const data = res?.data?.data || res?.data;
        const p    = data?.poster || data?.image || data?.cover;
        if (p) detailMapRef.current[id] = fixUrl(p);
        await wait(900); // perbesar dari 400ms → 900ms
      } catch (_) {}
    }
  }, []);

  // ── Merge poster priority: detail > schedule > raw ────────────────────────
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
    abortRef.current = false;

    const run = async () => {
      setLoading(true);
      setHeroLoading(true);
      try {
        // ── SEARCH MODE ──
        if (activeSearch) {
          const res = await fetchWithRetry(() => throttledFetch(() => searchAnime(activeSearch, page)), 2000);
          if (abortRef.current || !res) return;
          const d   = res?.data?.data;
          setSearchList(Array.isArray(d) ? d : (d?.animeList ?? []));
          return;
        }

        // ── HOME MODE ──
        // Step 1: home() / recent page N
        let listPage1 = [];
        if (page === 1) {
          const res = await fetchWithRetry(() => throttledFetch(() => home()), 2000);
          if (abortRef.current || !res) return;
          listPage1 = res?.data?.data?.recent?.animeList ?? [];
          // raw list buat HeroCarousel — set heroLoading false SEGERA agar carousel tampil duluan
          setHeroItems(listPage1.filter((a) => a.animeId && a.poster));
          setHeroLoading(false);
        } else {
          const res = await fetchWithRetry(() => throttledFetch(() => getRecent(page)), 2000);
          if (abortRef.current || !res) return;
          listPage1 = res?.data?.data?.animeList ?? [];
        }

        // Step 2: schedule paralel (jalan di background, bukan blocking)
        const scheduleTask = ensureSchedule();

        // Step 3: recent page+1 — perbesar jeda dari 600ms → 1200ms
        await wait(1200);
        if (abortRef.current) return;
        const res2     = await fetchWithRetry(() => throttledFetch(() => getRecent(page + 1)), 2000);
        if (abortRef.current || !res2) return;
        const listPage2 = res2?.data?.data?.animeList ?? [];

        // Step 4: tunggu schedule
        await scheduleTask;
        if (abortRef.current) return;

        // Deduplicate
        const seen = new Set();
        const allCards = [...listPage1, ...listPage2].filter((a) => {
          const key = a.animeId || a.slug;
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Step 5: detail fetch (limit 5)
        await fetchMissingDetails(allCards, 5);
        if (abortRef.current) return;

        setRecentList(applyPosterCache(allCards));
        setShowAll(false);

        // Step 6: popular top 10 — fetch SEKALI, cache
        if (page === 1 && !popularCache.current) {
          await wait(2000); // perbesar dari 800ms → 2000ms, semua step sebelumnya udah kelar
          if (abortRef.current) return;
          try {
            const rp = await fetchWithRetry(() => throttledFetch(() => getPopularAnime(1)), 2000);
            if (abortRef.current || !rp) return;
            const pop = rp?.data?.data?.animeList ?? [];
            if (pop.length >= 3) {
              popularCache.current = pop.slice(0, 10);
            }
          } catch (_) {}
        }
        if (!abortRef.current && popularCache.current) {
          setTopAnime(popularCache.current);
        }

      } catch (err) {
        if (!abortRef.current) console.error('[Home]', err);
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    };

    run();
    return () => { abortRef.current = true; };
  }, [page, activeSearch, ensureSchedule, fetchMissingDetails, applyPosterCache]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setPage(1);
    setActiveSearch(searchQuery.trim());
  };

  const clearSearch = () => { setSearchQuery(''); setActiveSearch(''); setPage(1); };

  const changePage = (next) => {
    setPage(next);
    setShowAll(false);
    setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const visibleList = page === 1 && !showAll ? recentList.slice(0, INITIAL_COUNT) : recentList;
  const hasMore     = page === 1 && !showAll && recentList.length > INITIAL_COUNT;

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

        /* ── SEARCH RESULTS ───────────────────────────────────────────── */
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
          {searchList.length > 0 && (
            <Pagination page={page}
              onPrev={() => changePage(Math.max(1, page - 1))}
              onNext={() => changePage(page + 1)} />
          )}
        </div>

      ) : (

        /* ── BERANDA ──────────────────────────────────────────────────── */
        <div className="space-y-10">

          {/* Hero carousel — BG dari poster detail API */}
          {heroLoading ? <SkeletonHero /> : heroItems.length > 0 ? <HeroCarousel rawList={heroItems} /> : null}

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

            <AnimeGrid list={visibleList} isNew loading={loading} />

            {hasMore && (
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

            {(!hasMore || showAll) && (
              <Pagination
                page={page}
                onPrev={() => changePage(Math.max(1, page - 1))}
                onNext={() => changePage(page + 1)} />
            )}
          </section>

          {/* Podium + mini carousel rank 4–10 */}
          {topAnime.length >= 3 && <PodiumSection topAnime={topAnime} />}
        </div>
      )}
    </main>
  );
}