import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Langsung export default di arrow function, gak pake try-catch, gak pake async/await di sini
export const home = () => axios.get(`${BASE_URL}samehadaku/home`);