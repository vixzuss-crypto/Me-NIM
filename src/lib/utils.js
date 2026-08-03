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

// ── Fetch with exponential backoff — handles 429 rate limit ──────────────────
export const fetchWithRetry = async (fn, _timeout, maxRetries = 3) => {
  let lastErr;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;

      if (status === 429) {
        // Rate limited: tunggu makin lama tiap retry: 3s → 7s → 15s
        const backoff = [3000, 7000, 15000][attempt] ?? 15000;
        console.warn(`[fetchWithRetry] 429 rate limit, retry ${attempt + 1}/${maxRetries} in ${backoff}ms`);
        await wait(backoff);
        continue;
      }

      if (status >= 400 && status < 500) {
        // 4xx lain (404, 403, dll) — tidak ada gunanya retry
        throw err;
      }

      // 5xx / network error — backoff pendek
      await wait((attempt + 1) * 1500);
    }
  }
  throw lastErr;
};

// ── Global request throttle ───────────────────────────────────────────────────
// Semua request lewat sini supaya tidak burst lebih dari 1 req per MIN_GAP ms.
// Pakai queue (serial) agar concurrent caller tidak saling bypass throttle.
const MIN_GAP = 1200;
let _queue = Promise.resolve();

export const throttledFetch = (fn) => {
  _queue = _queue.then(async () => {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      // pastikan jeda MIN_GAP dihitung dari selesainya request, bukan mulainya
      const elapsed = Date.now() - start;
      const remaining = MIN_GAP - elapsed;
      if (remaining > 0) await wait(remaining);
    }
  });
  return _queue;
};

// ── Pagination helper ─────────────────────────────────────────────────────────
export const clampPage = (p) => Math.max(1, p);