import { useEffect, useRef, useState } from 'react';

// ─── Satu cache & queue global untuk SELURUH app ─────────────────────────────
// Dipakai bersama oleh useAnimeImage & AnimeImg — tidak ada dua queue terpisah
export const imageCache = new Map(); // key → url | 'FAILED'

let _queueLast = 0;
const QUEUE_GAP = 1000; // ms antar request ke Jikan/Kitsu (naik dari 800)

export async function queuedFetch(url, signal) {
  const gap = _queueLast + QUEUE_GAP - Date.now();
  if (gap > 0) await new Promise((r) => setTimeout(r, gap));
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  _queueLast = Date.now();
  return fetch(url, { signal });
}

// ─── Jikan API ────────────────────────────────────────────────────────────────
export async function fetchJikanPoster(title, signal) {
  try {
    const res = await queuedFetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title.trim())}&limit=1&sfw=true`,
      signal,
    );
    if (!res.ok) return null; // 504/5xx → lanjut ke Kitsu
    const json = await res.json();
    return (
      json?.data?.[0]?.images?.jpg?.large_image_url  ||
      json?.data?.[0]?.images?.jpg?.image_url        ||
      json?.data?.[0]?.images?.webp?.large_image_url ||
      null
    );
  } catch { return null; }
}

// ─── Kitsu API fallback ───────────────────────────────────────────────────────
export async function fetchKitsuPoster(title, signal) {
  try {
    const res = await queuedFetch(
      `https://kitsu.app/api/edge/anime?filter[text]=${encodeURIComponent(title.trim())}&page[limit]=1`,
      signal,
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (
      json?.data?.[0]?.attributes?.posterImage?.large  ||
      json?.data?.[0]?.attributes?.posterImage?.medium ||
      null
    );
  } catch { return null; }
}

// ─── Core fallback logic ──────────────────────────────────────────────────────
export async function resolvePoster(title, cacheKey, signal) {
  // Jikan dulu, kalau gagal/504 → Kitsu
  let url = await fetchJikanPoster(title, signal);
  if (!url && !signal?.aborted) url = await fetchKitsuPoster(title, signal);
  if (signal?.aborted) return undefined; // komponen sudah unmount

  if (url) {
    if (cacheKey) imageCache.set(cacheKey, url);
    return url;
  } else {
    if (cacheKey) imageCache.set(cacheKey, 'FAILED');
    return null;
  }
}

/**
 * useAnimeImage — fallback chain:
 *   1. rawPoster dari samehadaku (via <img> onError)
 *   2. Jikan MAL API (by title, queue 1000ms)
 *   3. Kitsu API (fallback jika Jikan 504/down)
 *   4. null → komponen render <ImageOff /> icon
 *
 * Fitur anti-abuse:
 * - Satu cache & queue global (shared dengan AnimeImg)
 * - AbortController: request di-cancel saat komponen unmount
 * - Tidak pernah refetch anime yang sudah dicache
 * - Hanya fetch jika samehadaku poster benar-benar gagal (onError)
 */
export default function useAnimeImage(rawPoster, title, animeId) {
  const cacheKey  = animeId || title || null;
  const cachedVal = cacheKey ? imageCache.get(cacheKey) : undefined;

  const initSrc    = cachedVal && cachedVal !== 'FAILED' ? cachedVal : (rawPoster || null);
  const initFailed = cachedVal === 'FAILED';

  const [src,    setSrc]    = useState(initSrc);
  const [failed, setFailed] = useState(initFailed);
  const tryingRef = useRef(false);
  const abortRef  = useRef(null);

  // Reset saat anime berubah
  useEffect(() => {
    tryingRef.current = false;
    if (abortRef.current) abortRef.current.abort();

    if (cacheKey && imageCache.has(cacheKey)) {
      const cached = imageCache.get(cacheKey);
      if (cached === 'FAILED') { setSrc(null); setFailed(true); }
      else                     { setSrc(cached); setFailed(false); }
    } else {
      setSrc(rawPoster || null);
      setFailed(false);
    }

    return () => {
      if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    };
  }, [animeId, rawPoster]);

  const handleError = async () => {
    if (tryingRef.current) return;

    if (cacheKey && imageCache.has(cacheKey)) {
      const cached = imageCache.get(cacheKey);
      if (cached === 'FAILED') { setSrc(null); setFailed(true); }
      else                     { setSrc(cached); setFailed(false); }
      return;
    }

    if (!title) {
      if (cacheKey) imageCache.set(cacheKey, 'FAILED');
      setSrc(null); setFailed(true); return;
    }

    tryingRef.current = true;
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const url = await resolvePoster(title, cacheKey, ac.signal);
      if (url === undefined) return; // aborted
      if (url) { setSrc(url); setFailed(false); }
      else     { setSrc(null); setFailed(true); }
    } catch (e) {
      if (e?.name === 'AbortError') return;
      if (cacheKey) imageCache.set(cacheKey, 'FAILED');
      setSrc(null); setFailed(true);
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
    }
  };

  return { src, failed, handleError };
}