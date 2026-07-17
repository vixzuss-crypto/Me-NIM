import { useEffect, useState } from 'react';
import { home } from '../../api/anime/api'; // Menggunakan Named Export { home } sesuai file api.js lu

export default function Home() {
  const [dataAnime, setDataAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await home();
      if (res && res.data) {
        setDataAnime(res.data.data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800"></div>
          <p className="mt-4 text-slate-400 font-semibold animate-pulse">Memuat ME-ANIM...</p>
        </div>
      </div>
    );
  }

  // Ambil list anime terbaru dari response API
  const animeList = dataAnime?.recent?.animeList || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* 1. HEADER / NAVBAR SEDERHANA */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            ME-ANIM 🎬
          </h1>
          <nav className="flex gap-6 text-sm font-medium text-slate-400">
            <span className="text-indigo-400 cursor-pointer">Home</span>
            <span className="hover:text-slate-200 cursor-pointer">Daftar Anime</span>
            <span className="hover:text-slate-200 cursor-pointer">Jadwal</span>
          </nav>
        </div>
      </header>

      {/* 2. KONTEN UTAMA */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Sub-judul Halaman */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Update Terbaru</h2>
            <p className="text-sm text-slate-400">Episode teranyar yang rilis hari ini</p>
          </div>
          <span className="h-1 flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent ml-6 hidden md:block"></span>
        </div>

        {/* 3. GRID UTAMA ANIME */}
        {animeList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {animeList.map((anime, index) => (
              <div 
                key={index} 
                className="group relative flex flex-col bg-slate-900 border border-slate-900 rounded-xl overflow-hidden hover:border-slate-800 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                {/* Bagian Poster Gambar */}
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
                  <img 
                    src={anime.poster} 
                    alt={anime.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Badge Episode di Pojok Kiri Atas */}
                  <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
                    Ep {anime.episodes}
                  </span>
                </div>

                {/* Bagian Detail Teks */}
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <h3 className="font-bold text-sm text-slate-200 line-clamp-2 group-hover:text-indigo-400 transition-colors duration-200">
                    {anime.title}
                  </h3>
                  
                  {/* Info Tambahan di bawah judul */}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/50 pt-2">
                    <span className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300">
                      Samehadaku
                    </span>
                    <span>{anime.releasedOn}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-400">Tidak ada anime terbaru saat ini.</p>
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-8 text-center text-xs text-slate-500 mt-12">
        <p>© 2026 ME-ANIM. Powered by Samehadaku API.</p>
      </footer>
    </div>
  );
}