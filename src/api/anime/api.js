import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// 1. Ambil data halaman utama ringkas
export const home = () => axios.get(`${BASE_URL}samehadaku/home`);

// 2. Ambil anime terbaru lengkap dengan pagination (default halaman 1)
export const getRecent = (page = 1) => axios.get(`${BASE_URL}samehadaku/recent?page=${page}`);

// 3. Cari anime berdasarkan kata kunci (q) dan pagination
export const searchAnime = (query, page = 1) => axios.get(`${BASE_URL}samehadaku/search?q=${query}&page=${page}`);