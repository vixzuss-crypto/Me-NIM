import { useCallback, useState } from 'react';
import { Film } from 'lucide-react';
import { getMovies } from '../../api/anime/api';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import AnimeGrid   from '../../components/AnimeGrid';
import Pagination  from '../../components/Pagination';
import ErrorBanner from '../../components/ErrorBanner';
import PageHeader  from '../../components/PageHeader';

export default function Movies() {
  const [page, setPage] = useState(1);
  const apiFn = useCallback((p) => getMovies(p), []);
  const { list, loading, error } = usePaginatedFetch(apiFn, page);
  const changePage = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Film} title="Anime Movies" subtitle="Film & OVA koleksi lengkap" />
      <ErrorBanner message={error} />
      <AnimeGrid list={list} loading={loading} />
      {!loading && list.length > 0 && (
        <Pagination page={page} onPrev={() => changePage(Math.max(1, page - 1))} onNext={() => changePage(page + 1)} />
      )}
    </main>
  );
}