import { useEffect, useState } from 'react';
import { getPopularAnime } from '../../api/anime/api'; // Keluar ke pages -> src -> masuk api
import AnimeCard from '../../components/AnimeCard';   // Keluar ke pages -> src -> masuk components

export default function Ranking() {
  const [popularList, setPopularList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPopularData = async () => {
      setLoading(true);
      try {
        const res = await getPopularAnime(page);
        if (res?.data?.data) {
          const list = Array.isArray(res.data.data) 
            ? res.data.data 
            : Object.values(res.data.data).find(val => Array.isArray(val)) || [];
          setPopularList(list);
        }
      } catch (err) {
        console.error("Error fetching popular ranking:", err);
      }
      setLoading(false);
    };
    fetchPopularData();
  }, [page]);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">
      {/* HEADER HALAMAN */}
      <div className="mb-8 flex flex-col gap-2">
        <a href="/" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors mb-2 block w-fit">
          ← Kembali ke Beranda
        </a>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          🏆 Peringkat Anime Terpopuler
        </h1>
        <p className="text-xs text-slate-400">Daftar anime dengan jumlah penonton terbanyak sepanjang masa.</p>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800"></div>
        </div>
      ) : (
        <div>
          {/* GRID PERINGKAT DARI 1 SAMPAI SETERUSNYA */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {popularList.map((anime, index) => {
              // Menghitung nomor peringkat dinamis berdasarkan halaman saat ini
              const globalRank = (page - 1) * popularList.length + (index + 1);

              return (
                <div key={index} className="relative group">
                  {/* Badge Nomor Peringkat */}
                  <div className={`absolute -top-2 -left-2 z-20 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg border text-slate-950
                    ${globalRank === 1 ? 'bg-amber-400 border-amber-300 scale-110' : 
                      globalRank === 2 ? 'bg-slate-300 border-slate-200' : 
                      globalRank === 3 ? 'bg-amber-700 border-amber-600 text-white' : 
                      'bg-slate-800 border-slate-700 text-slate-300'}`}
                  >
                    {globalRank}
                  </div>

                  {/* Memakai Kembali Komponen AnimeCard Lu */}
                  <AnimeCard anime={anime} isNew={false} />
                </div>
              );
            })}
          </div>

          {/* Navigasi Halaman / Pagination */}
          <div className="flex items-center justify-center gap-3 mt-12">
            <button 
              onClick={() => { setPage((prev) => Math.max(prev - 1, 1)); window.scrollTo(0, 0); }} 
              disabled={page === 1} 
              className="bg-slate-900 text-slate-300 text-xs px-4 py-2 rounded-xl border border-slate-800 disabled:opacity-40 cursor-pointer"
            >
              ← Prev
            </button>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
              Halaman {page}
            </span>
            <button 
              onClick={() => { setPage((prev) => prev + 1); window.scrollTo(0, 0); }} 
              className="bg-slate-900 text-slate-300 text-xs px-4 py-2 rounded-xl border border-slate-800 cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
