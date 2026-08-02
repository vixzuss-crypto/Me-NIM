import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ── Axios instance ────────────────────────────────────────────────────────────
// JANGAN tambah header custom di sini — server sankavollerei tidak allow
// header selain default (Cache-Control, Pragma, dll trigger CORS preflight).
// Biarkan browser kirim default headers saja.
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ── Interceptor: log error biar debugging lebih mudah ────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url    = err?.config?.url ?? '';
    if (status === 403) {
      console.warn(`[API] 403 Forbidden → ${url}`);
    } else if (status === 429) {
      console.warn(`[API] 429 Too Many Requests → ${url}`);
    } else if (!status) {
      console.warn(`[API] Network Error → ${url} (CORS atau server down)`);
    }
    return Promise.reject(err);
  }
);

// ── Core ─────────────────────────────────────────────────────────────────────
export const home            = ()                   => api.get('samehadaku/home');
export const getRecent       = (page = 1)           => api.get(`samehadaku/recent?page=${page}`);
export const searchAnime     = (q, page = 1)        => api.get(`samehadaku/search?q=${encodeURIComponent(q)}&page=${page}`);
export const getPopularAnime = (page = 1)           => api.get(`samehadaku/popular?page=${page}`);
export const getSchedule     = ()                   => api.get('samehadaku/schedule');

// ── Detail & Stream ───────────────────────────────────────────────────────────
export const getAnimeDetail   = (animeId)           => api.get(`samehadaku/anime/${animeId}`);
export const getEpisodeStream = (episodeId)         => api.get(`samehadaku/episode/${episodeId}`);
export const getAnimeServer   = (serverId)          => api.get(`samehadaku/server/${serverId}`);

// ── Browse / Filter ───────────────────────────────────────────────────────────
export const getGenres        = ()                  => api.get('samehadaku/genres');
export const getGenreAnime    = (genreId, page = 1) => api.get(`samehadaku/genres/${genreId}?page=${page}`);
export const getOngoing       = (page = 1)          => api.get(`samehadaku/ongoing?page=${page}`);
export const getCompleted     = (page = 1)          => api.get(`samehadaku/completed?page=${page}`);
export const getMovies        = (page = 1)          => api.get(`samehadaku/movies?page=${page}`);
export const getAnimeList     = (page = 1)          => api.get(`samehadaku/list?page=${page}`);

// ── Batch ─────────────────────────────────────────────────────────────────────
export const getBatchList     = (page = 1)          => api.get(`samehadaku/batch?page=${page}`);
export const getBatchDetail   = (batchId)           => api.get(`samehadaku/batch/${batchId}`);