import { useEffect, useRef, useState } from 'react';
import { extractList, fetchWithRetry, throttledFetch } from '../lib/utils';

/**
 * Generic hook untuk halaman yang fetch list + pagination.
 *
 * Return value tambahan:
 * - hasMore: false  → tombol Next disembunyikan (response error / data kosong / message error)
 *
 * Logika hasMore:
 * - Kalau response.data.message berisi string non-empty (misal "Error fetching...")  → hasMore = false
 * - Kalau list hasil parse kosong []                                                → hasMore = false
 * - Kalau fetch throw (429, network error setelah semua retry)                     → hasMore = false
 * - Kalau list ada isinya                                                           → hasMore = true
 */
export function usePaginatedFetch(apiFn, page, cacheKeyPrefix) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [hasMore, setHasMore] = useState(true);

  const acRef = useRef(null);

  useEffect(() => {
    if (acRef.current) acRef.current.abort();
    const ac      = new AbortController();
    acRef.current = ac;

    setLoading(true);
    setError('');
    // Reset hasMore saat page/endpoint berubah — optimistic
    setHasMore(true);

    const prefix   = cacheKeyPrefix || apiFn.name || 'fetch';
    const cacheKey = `${prefix}:page${page}`;

    (async () => {
      try {
        const res = await fetchWithRetry(
          () => throttledFetch(() => apiFn(page), ac.signal),
          cacheKey,
          ac.signal,
        );
        if (ac.signal.aborted) return;

        // Detect response error dari API (status: "success" tapi message berisi error string)
        const msg = res?.data?.message ?? '';
        if (typeof msg === 'string' && msg.toLowerCase().includes('error')) {
          setList([]);
          setHasMore(false);
          return;
        }

        const parsed = extractList(res);

        // Kalau data kosong → tidak ada halaman berikutnya
        setList(parsed);
        setHasMore(parsed.length > 0);

      } catch (err) {
        if (err?.name === 'AbortError') return;
        if (!ac.signal.aborted) {
          setError('Gagal memuat data. Coba refresh.');
          setHasMore(false); // error juga → sembunyikan Next
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => { ac.abort(); };
  }, [apiFn, page, cacheKeyPrefix]);

  return { list, loading, error, hasMore };
}