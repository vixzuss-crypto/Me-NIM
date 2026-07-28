import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { getPopularAnime } from '../../api/anime/api';
import AnimeCard from '../../components/AnimeCard';

export default function Ranking() {
  const [popularList, setPopularList] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await getPopularAnime(page);
        if (res?.data?.data) {
          const list = Array.isArray(res.data.data)
            ? res.data.data
            : Object.values(res.data.data).find((v) => Array.isArray(v)) || [];
          setPopularList(list);
        }
      } catch (err) {
        console.error('Error fetching popular ranking:', err);
      }
      setLoading(false);
    };
    fetch_();
  }, [page]);

  const changePage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Peringkat Terpopuler
          </h1>
        </div>
        <p className="text-xs text-slate-500 ml-7">
          Anime dengan penonton terbanyak sepanjang masa
        </p>
      </div>

      {/* ── LOADING ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800" />
        </div>
      ) : (
        <>
          {/* ── GRID ────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {popularList.map((anime, i) => {
              const globalRank = (page - 1) * popularList.length + i + 1;
              return (
                <AnimeCard
                  key={i}
                  anime={anime}
                  isNew={false}
                  rank={globalRank}
                />
              );
            })}
          </div>

          {/* ── PAGINATION ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-2 mt-12">
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
        </>
      )}
    </main>
  );
}