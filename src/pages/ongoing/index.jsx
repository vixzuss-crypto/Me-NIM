import { useCallback, useState } from 'react';
import { Layers } from 'lucide-react';
import { getOngoing } from '../../api/anime/api';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import AnimeGrid      from '../../components/AnimeGrid';
import Pagination     from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner    from '../../components/ErrorBanner';
import PageHeader     from '../../components/PageHeader';

export default function Ongoing() {
  const [page, setPage] = useState(1);
  const apiFn = useCallback((p) => getOngoing(p), []);
  const { list, loading, error } = usePaginatedFetch(apiFn, page);

  const changePage = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Layers} title="Anime Ongoing" subtitle="Anime yang sedang tayang musim ini" />
      <ErrorBanner message={error} />
      {loading ? <LoadingSpinner fullPage /> : (
        <>
          <AnimeGrid list={list} isNew />
          {list.length > 0 && (
            <Pagination page={page} onPrev={() => changePage(Math.max(1, page - 1))} onNext={() => changePage(page + 1)} />
          )}
        </>
      )}
    </main>
  );
}
