import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tag, ArrowLeft } from 'lucide-react';
import { getGenres, getGenreAnime } from '../../api/anime/api';
import { extractList, fetchWithRetry } from '../../lib/utils';
import AnimeGrid      from '../../components/AnimeGrid';
import Pagination     from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner    from '../../components/ErrorBanner';
import PageHeader     from '../../components/PageHeader';

// ── Genre List (no param) ────────────────────────────────────────────────────
export function GenreList() {
  const [genres,  setGenres]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    (async () => {
      try {
        const res = await fetchWithRetry(() => getGenres());
        if (abortRef.current) return;
        const d = res?.data?.data;
        setGenres(d?.genreList ?? extractList(res));
      } catch {
        if (!abortRef.current) setError('Gagal memuat genre.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Tag} title="Genre Anime" subtitle="Jelajahi anime berdasarkan genre favorit kamu" />
      <ErrorBanner message={error} />
      {loading ? <LoadingSpinner fullPage /> : (
        <div className="flex flex-wrap gap-2.5">
          {genres.map((g, i) => (
            <Link key={g.genreId || i} to={`/genres/${g.genreId}`}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300
                hover:bg-indigo-600 hover:text-white border border-slate-800 hover:border-indigo-500
                transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/20">
              {g.title}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

// ── Genre Detail (with :genreId) ─────────────────────────────────────────────
export function GenreDetail() {
  const { genreId } = useParams();
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
        const res = await fetchWithRetry(() => getGenreAnime(genreId, page));
        if (abortRef.current) return;
        setList(extractList(res));
      } catch {
        if (!abortRef.current) setError('Gagal memuat anime untuk genre ini.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [genreId, page]);

  const genreLabel = genreId
    ? genreId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : '';

  const changePage = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Link to="/genres"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400
          hover:text-indigo-300 transition-colors mb-5">
        <ArrowLeft className="w-3.5 h-3.5" /> Semua Genre
      </Link>

      <PageHeader icon={Tag} title={`Genre: ${genreLabel}`} subtitle={`Anime dengan genre ${genreLabel}`} />
      <ErrorBanner message={error} />

      {loading ? <LoadingSpinner fullPage /> : (
        <>
          <AnimeGrid list={list} />
          {list.length > 0 && (
            <Pagination page={page} onPrev={() => changePage(Math.max(1, page - 1))} onNext={() => changePage(page + 1)} />
          )}
        </>
      )}
    </main>
  );
}
