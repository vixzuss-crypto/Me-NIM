import { useEffect, useRef, useState } from 'react';
import { AlignLeft } from 'lucide-react';
import { getAnimeList } from '../../api/anime/api';
import { fetchWithRetry } from '../../lib/utils';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner    from '../../components/ErrorBanner';
import PageHeader     from '../../components/PageHeader';
import Pagination     from '../../components/Pagination';

export default function Browse() {
  const [sections, setSections] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [page,     setPage]     = useState(1);
  const [activeLetter, setActiveLetter] = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError('');

    (async () => {
      try {
        const res = await fetchWithRetry(() => getAnimeList(page));
        if (abortRef.current) return;
        // Response: data.list: [{startWith: "A", animeList: [...]}]
        const raw = res?.data?.data?.list ?? res?.data?.data ?? [];
        setSections(Array.isArray(raw) ? raw : []);
        setActiveLetter(Array.isArray(raw) && raw[0]?.startWith ? raw[0].startWith : '');
      } catch {
        if (!abortRef.current) setError('Gagal memuat daftar anime.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();

    return () => { abortRef.current = true; };
  }, [page]);

  // Kumpulkan huruf dari sections yang ada
  const letters = sections.map((s) => s.startWith).filter(Boolean);
  const activeSection = sections.find((s) => s.startWith === activeLetter);

  const changePage = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={AlignLeft} title="A–Z Anime" subtitle="Semua anime diurutkan alfabetis" />
      <ErrorBanner message={error} />

      {loading ? <LoadingSpinner fullPage /> : (
        <>
          {/* Letter tabs */}
          {letters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {letters.map((l) => (
                <button key={l} onClick={() => setActiveLetter(l)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    activeLetter === l
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          )}

          {/* Anime list for active letter */}
          {activeSection?.animeList?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {activeSection.animeList.map((anime, i) => (
                <Link key={anime.animeId || i} to={`/detail/${anime.animeId}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/40
                    hover:bg-slate-800/60 border border-slate-800/40 hover:border-indigo-500/30
                    transition-all group">
                  <span className="text-xl font-black text-slate-800 group-hover:text-indigo-500 transition-colors w-7 text-center">
                    {activeLetter}
                  </span>
                  <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {anime.title}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 text-center py-10">Pilih huruf di atas untuk melihat daftar.</p>
          )}

          <Pagination page={page} onPrev={() => changePage(Math.max(1, page - 1))} onNext={() => changePage(page + 1)} />
        </>
      )}
    </main>
  );
}
