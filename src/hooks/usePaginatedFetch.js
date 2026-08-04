import { useEffect, useRef, useState } from 'react';
import { extractList, fetchWithRetry, throttledFetch } from '../lib/utils';

/**
 * Generic hook untuk halaman yang fetch list + pagination.
 *
 * Fitur anti-abuse:
 * - AbortController: kalau user pindah halaman/ganti page sebelum response
 *   datang, request di-abort dan di-skip dari antrian (tidak buang slot quota)
 * - Cache key per endpoint+page: kalau data sudah ada, tidak request ulang
 *
 * @param {Function} apiFn    — (page) => Promise
 * @param {number}   page     — current page (state dari parent)
 * @param {string}   [cacheKeyPrefix] — prefix untuk cache key, default nama fn
 */
export function usePaginatedFetch(apiFn, page, cacheKeyPrefix) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Ref untuk AbortController aktif — di-abort saat effect cleanup
  const acRef = useRef(null);

  useEffect(() => {
    // Abort request sebelumnya kalau user pindah halaman/page lebih cepat
    // dari selesainya response (pindah tab, ganti pagination, dsb)
    if (acRef.current) acRef.current.abort();
    const ac      = new AbortController();
    acRef.current = ac;

    setLoading(true);
    setError('');

    // Cache key unik per endpoint + halaman
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
        setList(extractList(res));
      } catch (err) {
        if (err?.name === 'AbortError') return; // user sudah pindah — abaikan
        if (!ac.signal.aborted) setError('Gagal memuat data. Coba refresh.');
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      ac.abort(); // cleanup: abort kalau komponen unmount atau dep berubah
    };
  }, [apiFn, page, cacheKeyPrefix]);

  return { list, loading, error };
}