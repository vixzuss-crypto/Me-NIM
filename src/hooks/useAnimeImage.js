import { useEffect, useRef, useState } from 'react';

// ─── Cache global: animeId/title → URL | 'FAILED' ────────────────────────────
// Satu cache untuk semua instance — anime yang sama tidak pernah di-fetch dua kali
const imageCache = new Map();

// ─── Global queue — max 1 Jikan/Kitsu request per 800ms ──────────────────────
// Mencegah semua card onError tembak API bersamaan saat halaman muat
let _queueLast = 0;
const QUEUE_GAP = 800; // ms antar request ke Jikan/Kitsu

async function queuedFetch(url, signal) {
  const now = Date.now();
  const gap = _queueLast + QUEUE_GAP - now;
  if (gap > 0) await new Promise((r) => setTimeout(r, gap));
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  _queueLast = Date.now();
  return fetch(url, { signal });
}

// ─── Kitsu API fallback (jika Jikan down/504) ─────────────────────────────────
async function fetchKitsuPoster(title, signal) {
  try {
    const q   = encodeURIComponent(title.trim());
    const res = await queuedFetch(
      `https://kitsu.app/api/edge/anime?filter[text]=${q}&page[limit]=1`,
      signal,
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (
      json?.data?.[0]?.attributes?.posterImage?.large  ||
      json?.data?.[0]?.attributes?.posterImage?.medium ||
      null
    );
  } catch {
    return null;
  }
}

// ─── Jikan API (chain 1) ──────────────────────────────────────────────────────
async function fetchJikanPoster(title, signal) {
  try {
    const q   = encodeURIComponent(title.trim());
    const res = await queuedFetch(
      `https://api.jikan.moe/v4/anime?q=${q}&limit=1&sfw=true`,
      signal,
    );
    // 5xx = Jikan down → kembalikan null biar lanjut ke Kitsu
    if (!res.ok) return null;
    const json = await res.json();
    return (
      json?.data?.[0]?.images?.jpg?.large_image_url  ||
      json?.data?.[0]?.images?.jpg?.image_url        ||
      json?.data?.[0]?.images?.webp?.large_image_url ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * useAnimeImage — fallback chain:
 *   1. rawPoster dari samehadaku (via <img> onError)
 *   2. Jikan MAL API (by title, queued 800ms)
 *   3. Kitsu API (fallback jika Jikan 504/down)
 *   4. null → komponen render <ImageOff /> icon
 *
 * Fitur anti-abuse:
 * - Global queue 800ms antar request external
 * - AbortController: request di-cancel otomatis saat komponen unmount
 * - Cache global per animeId: anime yang sama tidak pernah refetch
 * - Hanya fetch jika samehadaku poster benar-benar gagal (onError)
 */
export default function useAnimeImage(rawPoster, title, animeId) {
  const cacheKey     = animeId || title || null;
  const cachedVal    = cacheKey ? imageCache.get(cacheKey) : undefined;

  // Jika sudah dicache → langsung pakai, tidak perlu state/effect overhead
  const initSrc    = cachedVal && cachedVal !== 'FAILED' ? cachedVal : (rawPoster || null);
  const initFailed = cachedVal === 'FAILED';

  const [src,    setSrc]    = useState(initSrc);
  const [failed, setFailed] = useState(initFailed);

  const tryingRef  = useRef(false);   // sudah mulai fallback fetch?
  const abortRef   = useRef(null);    // AbortController aktif

  // Reset saat anime berubah
  useEffect(() => {
    tryingRef.current = false;
    if (abortRef.current) abortRef.current.abort();

    // Cek cache
    if (cacheKey && imageCache.has(cacheKey)) {
      const cached = imageCache.get(cacheKey);
      if (cached === 'FAILED') { setSrc(null); setFailed(true); }
      else                     { setSrc(cached); setFailed(false); }
    } else {
      setSrc(rawPoster || null);
      setFailed(false);
    }

    return () => {
      // Cleanup saat unmount — ABORT request yang sedang jalan
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [animeId, rawPoster]);

  // ── Dipanggil oleh <img onError> ─────────────────────────────────────────
  const handleError = async () => {
    // Jangan double-fetch
    if (tryingRef.current) return;

    // Kalau sudah di-cache → langsung pakai, skip API call
    if (cacheKey && imageCache.has(cacheKey)) {
      const cached = imageCache.get(cacheKey);
      if (cached === 'FAILED') { setSrc(null); setFailed(true); }
      else                     { setSrc(cached); setFailed(false); }
      return;
    }

    if (!title) {
      setSrc(null);
      setFailed(true);
      if (cacheKey) imageCache.set(cacheKey, 'FAILED');
      return;
    }

    tryingRef.current = true;

    // Buat AbortController baru untuk request ini
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      // Chain 1: Jikan
      let url = await fetchJikanPoster(title, ac.signal);

      // Chain 2: Kitsu (jika Jikan gagal dan belum di-abort)
      if (!url && !ac.signal.aborted) {
        url = await fetchKitsuPoster(title, ac.signal);
      }

      // Jika sudah di-abort (komponen unmount) → jangan update state
      if (ac.signal.aborted) return;

      if (url) {
        if (cacheKey) imageCache.set(cacheKey, url);
        setSrc(url);
        setFailed(false);
      } else {
        if (cacheKey) imageCache.set(cacheKey, 'FAILED');
        setSrc(null);
        setFailed(true);
      }
    } catch (e) {
      // AbortError adalah normal — komponen unmount sebelum selesai
      if (e?.name === 'AbortError') return;
      if (cacheKey) imageCache.set(cacheKey, 'FAILED');
      setSrc(null);
      setFailed(true);
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
    }
  };

  return { src, failed, handleError };
}