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
 *   - Shared cache & queue global dengan useAnimeImage (satu antrian untuk seluruh app)
 *   - AbortController per instance → request dibatalkan saat unmount
 */

import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { imageCache, resolvePoster } from '../hooks/useAnimeImage';

export default function AnimeImg({
  src: rawSrc,
  title      = '',
  animeId    = '',
  alt        = '',
  className  = '',
  iconSize   = 'w-7 h-7',
  showTitle  = true,
  style,
  loading    = 'lazy',
  onLoad,
  ...rest
}) {
  const cacheKey = animeId || title || null;
  const cached   = cacheKey ? imageCache.get(cacheKey) : undefined;

  const initSrc    = cached && cached !== 'FAILED' ? cached : (rawSrc || null);
  const initFailed = cached === 'FAILED' || (!rawSrc && !cached);

  const [src,    setSrc]    = useState(initSrc);
  const [failed, setFailed] = useState(initFailed);
  const tryingRef = useRef(false);
  const abortRef  = useRef(null);

  useEffect(() => {
    tryingRef.current = false;
    if (abortRef.current) abortRef.current.abort();

    if (cacheKey && imageCache.has(cacheKey)) {
      const c = imageCache.get(cacheKey);
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

    if (cacheKey && imageCache.has(cacheKey)) {
      const c = imageCache.get(cacheKey);
      if (c === 'FAILED') { setSrc(null); setFailed(true); }
      else                { setSrc(c);    setFailed(false); }
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
      if (url === undefined) return; // aborted — komponen sudah unmount
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

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        onError={handleError}
        onLoad={onLoad}
        {...rest}
      />
    );
  }

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