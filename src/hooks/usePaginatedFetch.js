import { useEffect, useRef, useState } from 'react';
import { extractList, fetchWithRetry, throttledFetch } from '../lib/utils';

/**
 * Generic hook untuk halaman yang fetch list + pagination.
 * @param {Function} apiFn  — (page) => Promise
 * @param {number}   page   — current page (state dari parent)
 */
export function usePaginatedFetch(apiFn, page) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const res = await fetchWithRetry(() => throttledFetch(() => apiFn(page)));
        if (abortRef.current) return;
        setList(extractList(res));
      } catch (err) {
        if (!abortRef.current) setError('Gagal memuat data. Coba refresh.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();

    return () => { abortRef.current = true; };
  }, [apiFn, page]);

  return { list, loading, error };
}