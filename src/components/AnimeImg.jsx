/**
 * AnimeImg — drop-in pengganti <img> untuk poster anime.
 *
 * Fallback chain:
 *   1. src (dari samehadaku) — jika ERR/504 → onError
 *   2. Jikan MAL API (by title)
 *   3. Kitsu API (jika Jikan down)
 *   4. <ImageOff /> icon dari lucide-react
 *
 * Anti-abuse:
 *   - Cache global per animeId/title (tidak pernah refetch anime yang sama)
 *   - Global queue 800ms antar request ke Jikan/Kitsu
 *   - AbortController per instance → request dibatalkan saat unmount
 */

import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';

// ─── Cache & Queue global ──────────────────────────────────────────────────────
const imgCache  = new Map();   // key → url | 'FAILED'
let   _lastReq  = 0;
const QUEUE_GAP = 800;         // ms antar request ke external API

async function queuedFetch(url, signal) {
  const gap = _lastReq + QUEUE_GAP - Date.now();
  if (gap > 0) await new Promise((r) => setTimeout(r, gap));
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  _lastReq = Date.now();
  return fetch(url, { signal });
}

async function fetchJikan(title, signal) {
  try {
    const r = await queuedFetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1&sfw=true`,
      signal,
    );
    if (!r.ok) return null;
    const j = await r.json();
    return (
      j?.data?.[0]?.images?.jpg?.large_image_url ||
      j?.data?.[0]?.images?.jpg?.image_url       ||
      j?.data?.[0]?.images?.webp?.large_image_url || null
    );
  } catch { return null; }
}

async function fetchKitsu(title, signal) {
  try {
    const r = await queuedFetch(
      `https://kitsu.app/api/edge/anime?filter[text]=${encodeURIComponent(title)}&page[limit]=1`,
      signal,
    );
    if (!r.ok) return null;
    const j = await r.json();
    return (
      j?.data?.[0]?.attributes?.posterImage?.large  ||
      j?.data?.[0]?.attributes?.posterImage?.medium || null
    );
  } catch { return null; }
}

// ─── Komponen ─────────────────────────────────────────────────────────────────
export default function AnimeImg({
  src: rawSrc,
  title      = '',
  animeId    = '',
  alt        = '',
  className  = '',
  iconSize   = 'w-7 h-7',        // ukuran icon fallback
  showTitle  = true,             // tampilkan judul di bawah icon
  style,
  loading    = 'lazy',
  ...rest
}) {
  const cacheKey = animeId || title || null;
  const cached   = cacheKey ? imgCache.get(cacheKey) : undefined;

  const initSrc    = cached && cached !== 'FAILED' ? cached : (rawSrc || null);
  const initFailed = cached === 'FAILED' || (!rawSrc && !cached);

  const [src,    setSrc]    = useState(initSrc);
  const [failed, setFailed] = useState(initFailed);
  const tryingRef = useRef(false);
  const abortRef  = useRef(null);

  useEffect(() => {
    tryingRef.current = false;
    if (abortRef.current) abortRef.current.abort();

    if (cacheKey && imgCache.has(cacheKey)) {
      const c = imgCache.get(cacheKey);
      if (c === 'FAILED') { setSrc(null); setFailed(true); }
      else                { setSrc(c);    setFailed(false); }
    } else {
      setSrc(rawSrc || null);
      setFailed(!rawSrc);
    }

    return () => {
      if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    };
  }, [animeId, rawSrc]);

  const handleError = async () => {
    if (tryingRef.current) return;

    if (cacheKey && imgCache.has(cacheKey)) {
      const c = imgCache.get(cacheKey);
      if (c === 'FAILED') { setSrc(null); setFailed(true); }
      else                { setSrc(c);    setFailed(false); }
      return;
    }

    if (!title) {
      if (cacheKey) imgCache.set(cacheKey, 'FAILED');
      setSrc(null); setFailed(true); return;
    }

    tryingRef.current = true;
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      let url = await fetchJikan(title, ac.signal);
      if (!url && !ac.signal.aborted) url = await fetchKitsu(title, ac.signal);
      if (ac.signal.aborted) return;

      if (url) {
        if (cacheKey) imgCache.set(cacheKey, url);
        setSrc(url); setFailed(false);
      } else {
        if (cacheKey) imgCache.set(cacheKey, 'FAILED');
        setSrc(null); setFailed(true);
      }
    } catch (e) {
      if (e?.name === 'AbortError') return;
      if (cacheKey) imgCache.set(cacheKey, 'FAILED');
      setSrc(null); setFailed(true);
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
    }
  };

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        onError={handleError}
        {...rest}
      />
    );
  }

  // Icon fallback
  return (
    <div className={`flex flex-col items-center justify-center gap-1 bg-slate-900 ${className}`} style={style}>
      <ImageOff className={`${iconSize} text-slate-700`} />
      {showTitle && title && (
        <span className="text-[9px] text-slate-700 text-center px-1 line-clamp-2 leading-tight">
          {title}
        </span>
      )}
    </div>
  );
}