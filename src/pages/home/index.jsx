import { useEffect, useRef, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Flame, ChevronDown } from 'lucide-react';
import { getRecent, getPopularAnime, searchAnime } from '../../api/anime/api';
import Top3all   from '../../components/Top3all';
import AnimeCard from '../../components/AnimeCard';
import Carousel  from '../../components/Carousel';
import Footer    from '../../components/Footer';

const INITIAL_COUNT = 15;

export default function Home() {
  const [recentList,   setRecentList]   = useState([]);
  const [allTimeTop3,  setAllTimeTop3]  = useState([]);
  const [searchList,   setSearchList]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page,         setPage]         = useState(1);
  const [showAll,      setShowAll]      = useState(false); // false=15 card, true=30 card

  const sectionRef   = useRef(null);  // ref ke section "Update Terbaru"
  const popularCache = useRef(null);  // cache popular, fetch sekali saja
  const abortRef     = useRef(false); // flag abort untuk StrictMode double-invoke

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    abortRef.current = false; // reset tiap effect baru

    const extractList = (res) => {
      if (!res?.data?.data) return [];
      return Array.isArray(res.data.data)
        ? res.data.data
        : Object.values(res.data.data).find((v) => Array.isArray(v)) || [];
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    // Fetch dengan retry sekali kalau kena 429
    const fetchWithRetry = async (fn, retryDelay = 1000) => {
      try {
        return await fn();
      } catch (err) {
        if (err?.response?.status === 429 && !abortRef.current) {
          await wait(retryDelay);
          if (abortRef.current) return null;
          return await fn();
        }
        throw err;
      }
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeSearch) {
          const res = await fetchWithRetry(() => searchAnime(activeSearch, page));
          if (abortRef.current || !res) return;
          setSearchList(extractList(res));

        } else {
          // ── Recent: sequential + delay 500ms antar request ──
          const res1 = await fetchWithRetry(() => getRecent(page));
          if (abortRef.current || !res1) return;
          const listPage1 = extractList(res1);

          await wait(500);
          if (abortRef.current) return;

          const res2 = await fetchWithRetry(() => getRecent(page + 1));
          if (abortRef.current || !res2) return;
          const listPage2 = extractList(res2);

          const combined = [...listPage1, ...listPage2].filter(
            (anime, idx, arr) =>
              arr.findIndex(
                (a) => (a.animeId || a.slug || a.id) === (anime.animeId || anime.slug || anime.id)
              ) === idx
          );
          setRecentList(combined);
          setShowAll(false);

          // ── Popular: fetch sekali, cache selamanya ──
          if (!popularCache.current) {
            await wait(500);
            if (abortRef.current) return;
            const resPopular = await fetchWithRetry(() => getPopularAnime(1));
            if (abortRef.current || !resPopular) return;
            const popList = extractList(resPopular);
            if (popList.length >= 3) {
              popularCache.current = [popList[1], popList[0], popList[2]];
            }
          }
          if (!abortRef.current && popularCache.current) {
            setAllTimeTop3(popularCache.current);
          }
        }
      } catch (err) {
        if (!abortRef.current) console.error('Error fetching data:', err);
      }
      if (!abortRef.current) setLoading(false);
    };

    fetchData();

    // Cleanup: batalkan fetch kalau deps berubah atau StrictMode re-invoke
    return () => { abortRef.current = true; };
  }, [page, activeSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setPage(1);
    setActiveSearch(searchQuery.trim());
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setPage(1);
  };

  // Ganti halaman + scroll ke section, bukan ke atas halaman
  const changePage = (next) => {
    setPage(next);
    setShowAll(false);
    // Scroll ke section "Update Terbaru" dengan sedikit offset
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Page 1: default 15, show more ke 30
  // Page 2+: langsung tampil semua (sudah fetch 2 halaman = 30+ card)
  const visibleList = (page === 1 && !showAll)
    ? recentList.slice(0, INITIAL_COUNT)
    : recentList;
  const hasMore = page === 1 && !showAll && recentList.length > INITIAL_COUNT;

  // ─────────────────────────────────────────────────────────────────────────
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
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Cari
          </button>
        </form>

        {activeSearch && (
          <button
            onClick={clearSearch}
            className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Kembali ke Beranda
          </button>
        )}
      </div>

      {/* ── LOADING ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800" />
        </div>

      ) : activeSearch ? (
        /* ── HASIL PENCARIAN ────────────────────────────────────────────── */
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 mb-0.5">Hasil pencarian untuk</p>
              <h2 className="text-lg font-bold text-white">"{activeSearch}"</h2>
            </div>
            {searchList.length > 0 && (
              <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                {searchList.length} anime
              </span>
            )}
          </div>

          {searchList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
              <Search className="w-8 h-8" />
              <p className="text-sm">Tidak ada hasil untuk "{activeSearch}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {searchList.map((anime, i) => (
                <AnimeCard key={i} anime={anime} isNew={false} />
              ))}
            </div>
          )}
        </div>

      ) : (
        /* ── BERANDA ────────────────────────────────────────────────────── */
        <div className="space-y-10">

          {/* Carousel video */}
          <Carousel />

          {/* ── Update Terbaru ─────────────────────────────────────────── */}
          <section ref={sectionRef} className="scroll-mt-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Update Terbaru
              </h2>
              <span className="text-[11px] text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                Hal {page}
              </span>
            </div>

            {/* Grid card */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {visibleList.map((anime, i) => (
                <AnimeCard key={i} anime={anime} isNew={true} />
              ))}
            </div>

            {/* Show More */}
            {hasMore && (
              <div className="flex justify-center mt-5">
                <button
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-5 py-2 rounded-xl transition-all"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  Tampilkan lebih banyak ({recentList.length - INITIAL_COUNT} lagi)
                </button>
              </div>
            )}

            {/* Pagination — page 1: muncul setelah show more. Page 2+: selalu tampil */}
            {(page > 1 || showAll || recentList.length <= INITIAL_COUNT) && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => changePage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-900 text-slate-300 px-4 py-2 rounded-xl border border-slate-800 disabled:opacity-30 hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl min-w-[4rem] text-center">
                  {page}
                </span>
                <button
                  onClick={() => changePage(page + 1)}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-900 text-slate-300 px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>

          {/* Top 3 Podium */}
          <Top3all popularTop3={allTimeTop3} />

        </div>
      )}

      <Footer />
    </main>
  );
}