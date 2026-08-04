import { useCallback, useState } from 'react';
import { List } from 'lucide-react';
import { getPopularAnime } from '../../api/anime/api';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import AnimeGrid   from '../../components/AnimeGrid';
import Pagination  from '../../components/Pagination';
import ErrorBanner from '../../components/ErrorBanner';
import PageHeader  from '../../components/PageHeader';

export default function Ranking() {
  const [page, setPage] = useState(1);
  const apiFn = useCallback((p) => getPopularAnime(p), []);
  const { list, loading, error } = usePaginatedFetch(apiFn, page);
  const changePage = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={List} title="Peringkat Anime" subtitle="Berdasarkan popularitas & rating pengguna" />
      <ErrorBanner message={error} />
      <AnimeGrid list={list} withRank loading={loading} />
      {!loading && list.length > 0 && (
        <Pagination page={page} onPrev={() => changePage(Math.max(1, page - 1))} onNext={() => changePage(page + 1)} />
      )}
    </main>
  );
}