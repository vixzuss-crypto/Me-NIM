import { useEffect, useState } from 'react';
import { getRecent, getPopularAnime, searchAnime } from '../../api/anime/api';
import Top3all from '../../components/Top3all';
import AnimeCard from '../../components/AnimeCard';

export default function Home() {
  const [recentList, setRecentList] = useState([]);
  const [allTimeTop3, setAllTimeTop3] = useState([]);
  const [searchList, setSearchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeSearch) {
          const res = await searchAnime(activeSearch, page);
          if (res?.data?.data) {
            const list = Array.isArray(res.data.data) ? res.data.data : Object.values(res.data.data).find(val => Array.isArray(val)) || [];
            setSearchList(list);
          }
        } else {
          const [resRecent, resPopular] = await Promise.all([
            getRecent(page),
            getPopularAnime(1)
          ]);

          // Set data Recent Update
          if (resRecent?.data?.data) {
            const list = Array.isArray(resRecent.data.data) ? resRecent.data.data : Object.values(resRecent.data.data).find(val => Array.isArray(val)) || [];
            setRecentList(list);
          }

          // Set data Top 3 Terpopuler dari API popular
          if (resPopular?.data?.data) {
            const list = Array.isArray(resPopular.data.data) ? resPopular.data.data : Object.values(resPopular.data.data).find(val => Array.isArray(val)) || [];
            if (list.length >= 3) {
              setAllTimeTop3([list[1], list[0], list[2]]); // Susunan Podium: Juara 2, Juara 1, Juara 3
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [page, activeSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setPage(1);
    setActiveSearch(searchQuery);
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">
      {/* INPUT PENCARIAN */}
      <div className="mb-6 w-full">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Cari anime seru di sini..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
            Cari
          </button>
        </form>
        {activeSearch && (
          <button onClick={() => { setSearchQuery(''); setActiveSearch(''); setPage(1); }} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
            ← Kembali ke Beranda
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800"></div>
        </div>
      ) : activeSearch ? (
        /* DISPLAY PENCARIAN */
        <div>
          <div className="mb-6"><h2 className="text-xl font-bold text-white">Hasil Pencarian: "{activeSearch}"</h2></div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {searchList.map((anime, index) => (
              <AnimeCard key={index} anime={anime} isNew={false} />
            ))}
          </div>
        </div>
      ) : (
        /* DISPLAY BERANDA */
        <div className="space-y-10">
          {/* PANGGUNG PODIUM TOP 3 */}
          <Top3all popularTop3={allTimeTop3} />

          {/* SEKSI NEW UPDATE ANIME */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">New Update Anime</h2>
              <a href="#" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Lihat Jadwal &gt;</a>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {recentList.map((anime, index) => (
                <AnimeCard key={index} anime={anime} isNew={true} />
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="bg-slate-900 text-slate-300 text-xs px-4 py-2 rounded-xl border border-slate-800 disabled:opacity-40">← Prev</button>
              <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">Hal {page}</span>
              <button onClick={() => setPage((prev) => prev + 1)} className="bg-slate-900 text-slate-300 text-xs px-4 py-2 rounded-xl border border-slate-800">Next →</button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-900/50 py-6 text-center text-[10px] text-slate-600 mt-12">
        <p>© 2026 ME-ANIM. All rights reserved.</p>
      </footer>
    </main>
  );
}
