import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// 1. Ambil data halaman utama ringkas
export const home = () => axios.get(`${BASE_URL}samehadaku/home`);

// 2. Ambil anime terbaru lengkap dengan pagination (default halaman 1)
export const getRecent = (page = 1) => axios.get(`${BASE_URL}samehadaku/recent?page=${page}`);

// 3. Cari anime berdasarkan kata kunci (q) dan pagination
export const searchAnime = (query, page = 1) => axios.get(`${BASE_URL}samehadaku/search?q=${query}&page=${page}`);

// 4. Mengambil anime yang sedang populer
export const getPopularAnime = (page = 1) => axios.get(`${BASE_URL}samehadaku/popular?page=${page}`);

// ========================================================
// 🚀 TAMBAHAN BARU UNTUK FITUR NONTON & DETAIL ANIME
// ========================================================

// 5. Ambil detail anime & daftar episodenya (Parameter: animeId / slug anime)
// Contoh usage: getAnimeDetail('one-piece')
export const getAnimeDetail = (animeId) => axios.get(`${BASE_URL}samehadaku/anime/${animeId}`);

// 6. Ambil data episode & link video streaming (Parameter: episodeId / slug episode)
// Contoh usage: getEpisodeStream('one-piece-episode-1100')
export const getEpisodeStream = (episodeId) => axios.get(`${BASE_URL}samehadaku/episode/${episodeId}`);

// Tambahkan jika belum ada di api.js
export const getAnimeServer = async (serverId) => {
  const response = await fetch(`https://DOMAIN_API_LU/anime/samehadaku/server/${serverId}`);
  return await response.json();
};