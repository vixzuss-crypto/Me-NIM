import { useEffect, useState } from 'react';
import { getRecent, searchAnime } from '../../api/anime/api';

export default function Home() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk nyimpen input ketikan user & kata kunci pencarian aktif
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  
  // State untuk halaman (pagination)
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let res;
      
      // Kalau user lagi nyari sesuatu, tembak API search. Kalau gak, tembak recent biasa.
      if (activeSearch) {
        res = await searchAnime(activeSearch, page);
      } else {
        res = await getRecent(page);
      }
      
      // Ambil array list anime dari struktur data API-mu
      if (res && res.data && res.data.data) {
        // Sesuaikan jika search/recent mengembalikan struktur array langsung atau dibungkus objek
        const list = res.data.data.animeList || res.data.data.recent?.animeList || res.data.data || [];
        setAnimeList(list);
      }
      setLoading(false);
    };

    fetchData();
  }, [page, activeSearch]); // Efek ini bakal jalan tiap kali page berubah atau keyword search berubah

  // Fungsi trigger pas tombol search diklik atau enter
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Balikin ke page 1 tiap nyari anime baru
    setActiveSearch(searchQuery);
  };

  // Fungsi buat nge-reset pencarian kembali ke anime terbaru
  const resetSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setPage(1);
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {/* 1. BAR PENCARIAN ANIME */}
      <div className="mb-8 max-w-md mx-auto sm:mx-0">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Cari anime seru di sini..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Cari
          </button>
        </form>
        {activeSearch && (
          <button 
            onClick={resetSearch} 
            className="mt-2 text-xs text-indigo-400 hover:underline cursor-pointer"
          >
            ← Kembali ke Anime Terbaru
          </button>
        )}
      </div>

      {/* 2. JUDUL KATEGORI */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {activeSearch ? `Hasil Pencarian: "${activeSearch}"` : 'Anime Baru & Update Episode'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeSearch ? 'Menampilkan kecocokan data dari server' : 'Yang baru rilis nangkring di paling atas'}
          </p>
        </div>
        <span className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent ml-6 hidden md:block"></span>
      </div>

      {/* 3. AREA KONTEN GRID ANIME & LOADING LOADING STATE */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800"></div>
        </div>
      ) : animeList.length > 0 ? (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {animeList.map((anime, index) => (
              <div 
                key={index} 
                className="group relative flex flex-col bg-slate-900 border border-slate-900 rounded-xl overflow-hidden hover:border-slate-800 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
                  <img src={anime.poster} alt={anime.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  {anime.episodes && (
                    <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-md">
                      Ep {anime.episodes}
                    </span>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-200 line-clamp-2 group-hover:text-indigo-400 transition-colors duration-200">{anime.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/50 pt-2">
                    <span className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300">Samehadaku</span>
                    <span>{anime.releasedOn || 'Ongoing'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4. PAGINATION BUTTONS CONTROL */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <button 
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium px-4 py-2 rounded-xl border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              ← Prev
            </button>
            <span className="text-sm font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              Page {page}
            </span>
            <button 
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium px-4 py-2 rounded-xl border border-slate-800 cursor-pointer transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-500">Anime tidak ditemukan. Coba keyword lain, Bro.</p>
        </div>
      )}

      <footer className="border-t border-slate-900/50 py-8 text-center text-[11px] text-slate-600 mt-16">
        <p>© 2026 ME-ANIM. Powered by Samehadaku API.</p>
      </footer>
    </main>
  );
}