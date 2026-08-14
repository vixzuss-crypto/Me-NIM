import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Star } from 'lucide-react';
import { getMoviesOD } from '../../api/anime/api';
import { extractList, fixUrl } from '../../lib/utils';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner    from '../../components/ErrorBanner';
import PageHeader     from '../../components/PageHeader';
import Pagination     from '../../components/Pagination';

// Sumber: Otakudesu (self-host wajik-anime-api) — TIDAK ada rate limit,
// jadi TIDAK pakai throttledFetch. Halaman baru, terpisah dari /movies (Samehadaku).
export default function MoviesOD() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(1);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError('');
    (async () => {
      try {
        const res = await getMoviesOD(page);
        if (abortRef.current) return;
        setList(extractList(res));
      } catch {
        if (!abortRef.current) setError('Gagal memuat movies dari Otakudesu.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [page]);

  const changePage = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Film} title="Anime Movies (Otakudesu)" subtitle="Koleksi movie tambahan dari sumber Otakudesu" />
      <ErrorBanner message={error} />
      {loading ? <LoadingSpinner fullPage /> : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {list.map((anime, i) => {
              const animeId = anime?.animeId || anime?.slug;
              const poster  = fixUrl(anime?.poster || anime?.image || '');
              const score   = anime?.score?.value ?? anime?.score ?? null;
              return (
                <Link key={animeId || i} to={`/detail-od/${animeId}`}
                  className="group flex flex-col gap-1.5 focus:outline-none">
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900
                    border border-slate-800/60 group-hover:border-indigo-500/40 transition-all">
                    {poster && (
                      <img src={poster} alt={anime?.title} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    {score && (
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold
                        bg-black/70 text-amber-400 backdrop-blur-sm flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {typeof score === 'number' ? score.toFixed(1) : score}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white line-clamp-2 leading-tight px-0.5">
                    {anime?.title ?? '—'}
                  </p>
                </Link>
              );
            })}
          </div>
          {list.length > 0 && (
            <Pagination page={page} onPrev={() => changePage(Math.max(1, page - 1))} onNext={() => changePage(page + 1)} />
          )}
        </>
      )}
    </main>
  );
}
