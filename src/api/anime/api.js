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

// ══════════════════════════════════════════════════════════════════════════════
// TAMBAHAN — self-host wajik-anime-api (Otakudesu + Kuramanime)
// Semua export di bawah ini BARU, tidak mengganti apapun yang di atas.
// Client ini terpisah dari `api` (samehadaku) dan tidak ada rate limit.
// ══════════════════════════════════════════════════════════════════════════════
const wajikApi = axios.create({
  baseURL: import.meta.env.VITE_WAJIK_URL,
  timeout: 10000,
});
wajikApi.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url    = err?.config?.url ?? '';
    if (status === 403) console.warn(`[WajikAPI] 403 Forbidden → ${url}`);
    else if (!status)   console.warn(`[WajikAPI] Network Error → ${url}`);
    return Promise.reject(err);
  }
);

// ── Oploverz ──────────────────────────────────────────────────────────────────
export const getHomeOL            = ()                      => wajikApi.get('oploverz/home');
export const getScheduleOL        = ()                      => wajikApi.get('oploverz/schedule');
export const getAnimeDirectoryOL  = (filters = {})          => wajikApi.get('oploverz/anime', { params: filters });
export const searchAnimeOL        = async (q)               => {
  try {
    return await wajikApi.get(`oploverz/search?q=${encodeURIComponent(q)}`);
  } catch (err) {
    if (err?.response?.status === 404) {
      return { data: { statusCode: 200, data: { animeList: [] } } };
    }
    throw err;
  }
};
export const getAnimeDetailOL     = (animeId)               => wajikApi.get(`oploverz/anime/${animeId}`);
export const getEpisodeStreamOL   = (episodeId)             => wajikApi.get(`oploverz/episode/${encodeURIComponent(episodeId)}`);

// ── Movies dari Otakudesu (via filter genre "movie") ──────────────────────────
export const getMoviesOD      = (page = 1)          => wajikApi.get(`otakudesu/genre/movie?page=${page}`);
export const getAnimeDetailOD = (animeId)           => wajikApi.get(`otakudesu/anime/${animeId}`);
export const getEpisodeStreamOD = (episodeId)       => wajikApi.get(`otakudesu/episode/${episodeId}`);
export const getAnimeServerOD   = (serverId)        => wajikApi.get(`otakudesu/server/${serverId}`);

// ── Jelajah Kuramanime by Studio / Season / Type / Quality / Source / Country ─
// PERINGATAN: endpoint /kuramanime/* pernah balikin 403 Forbidden waktu dites
// sebelumnya (kemungkinan Cloudflare situs Kuramanime nge-block IP Vercel).
// Coba dulu 1 request manual sebelum pasang halaman baru yang bergantung ke ini.
export const getKuramanimeProperties       = (type)              => wajikApi.get(`kuramanime/properties/${type}`);
export const getKuramanimeAnimeByProperty  = (type, id, page = 1) => wajikApi.get(`kuramanime/properties/${type}/${id}?page=${page}`);
export const getAnimeDetailKM              = (animeId, animeSlug) => wajikApi.get(`kuramanime/anime/${animeId}/${animeSlug}`);
export const getEpisodeStreamKM            = (animeId, animeSlug, episodeId) => wajikApi.get(`kuramanime/episode/${animeId}/${animeSlug}/${episodeId}`);