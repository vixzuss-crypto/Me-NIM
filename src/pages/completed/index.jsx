import { useCallback, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getCompleted } from '../../api/anime/api';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import AnimeGrid   from '../../components/AnimeGrid';
import Pagination  from '../../components/Pagination';
import ErrorBanner from '../../components/ErrorBanner';
import PageHeader  from '../../components/PageHeader';

export default function Completed() {
  const [page, setPage] = useState(1);
  const apiFn = useCallback((p) => getCompleted(p), []);
  const { list, loading, error, hasMore } = usePaginatedFetch(apiFn, page, 'completed');

  const changePage = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={CheckCircle2} title="Anime Completed" subtitle="Anime yang sudah tamat sepenuhnya" />
      <ErrorBanner message={error} />
      <AnimeGrid list={list} loading={loading} />
      {!loading && list.length > 0 && (
        <Pagination
          page={page}
          hasMore={hasMore}
          onPrev={() => changePage(Math.max(1, page - 1))}
          onNext={() => changePage(page + 1)}
        />
      )}
    </main>
  );
}