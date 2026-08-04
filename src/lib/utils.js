// ── URL helpers ───────────────────────────────────────────────────────────────
export const fixUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://${url}`;
};

// ── API response normalizer ───────────────────────────────────────────────────
export const extractList = (res) => {
  const d = res?.data?.data;
  if (!d) return [];
  if (Array.isArray(d)) return d;
  for (const key of ['animeList', 'batchList', 'list', 'results']) {
    if (Array.isArray(d[key])) return d[key];
  }
  const found = Object.values(d).find((v) => Array.isArray(v));
  return found || [];
};

// ── wait ──────────────────────────────────────────────────────────────────────
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL REQUEST QUEUE
// Limit: 30 req/menit → aman di 2000ms gap = maks 30/menit
// Semua request di-serialize lewat satu antrian.
// Kalau request di-abort sebelum dieksekusi, dia di-skip (tidak buang slot).
// ══════════════════════════════════════════════════════════════════════════════
const MIN_GAP     = 2100; // ms antar request — 2100ms = ~28 req/menit (safety margin)
let   _queueChain = Promise.resolve();
let   _lastSent   = 0;

export const throttledFetch = (fn, signal) => {
  // Setiap caller menyambung ke ujung antrian
  const result = _queueChain.then(async () => {
    // Kalau sudah di-abort sebelum giliran tiba, skip tanpa kirim request
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    // Hitung jeda sejak request terakhir benar-benar dikirim
    const elapsed   = Date.now() - _lastSent;
    const remaining = MIN_GAP - elapsed;
    if (remaining > 0) await wait(remaining);

    // Kalau selama nunggu user sudah pindah halaman, skip
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    _lastSent = Date.now();
    return fn();
  });

  // Sambungkan ke chain tapi jangan biarkan error satu request
  // menghentikan seluruh antrian
  _queueChain = result.catch(() => {});
  return result;
};

// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE CACHE
// Cache in-memory per URL key. TTL default 5 menit.
// Kalau data sudah ada di cache, tidak perlu request sama sekali.
// ══════════════════════════════════════════════════════════════════════════════
const _cache    = new Map(); // key → { data, ts }
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

export const getCached = (key) => {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
  return entry.data;
};

export const setCached = (key, data) => {
  _cache.set(key, { data, ts: Date.now() });
};

export const clearCache = (key) => {
  if (key) _cache.delete(key);
  else _cache.clear();
};

// ── Fetch with retry + cache ──────────────────────────────────────────────────
// cacheKey: string unik per endpoint+page. Kalau null, tidak di-cache.
export const fetchWithRetry = async (fn, cacheKey, signal, maxRetries = 3) => {
  // Cek cache dulu — tidak butuh request sama sekali
  if (cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  let lastErr;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const res = await fn();
      if (cacheKey) setCached(cacheKey, res); // simpan ke cache
      return res;
    } catch (err) {
      if (err?.name === 'AbortError') throw err; // propagate abort langsung
      lastErr = err;
      const status = err?.response?.status;

      if (status === 429) {
        const backoff = [4000, 10000, 20000][attempt] ?? 20000;
        console.warn(`[fetchWithRetry] 429 rate limit, retry ${attempt + 1}/${maxRetries} in ${backoff}ms`);
        await wait(backoff);
        continue;
      }

      if (status >= 400 && status < 500) throw err; // 4xx — tidak ada gunanya retry
      await wait((attempt + 1) * 2000); // 5xx / network error
    }
  }
  throw lastErr;
};

// ── Pagination helper ─────────────────────────────────────────────────────────
export const clampPage = (p) => Math.max(1, p);