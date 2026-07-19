import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Ranking from './pages/popularity/ranking';

export default function App() {
  return (
    // Menambahkan class background gelap bawaan project lu agar warna putihnya hilang
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 antialiased">
      <Router>
        <Routes>
          {/* Halaman Beranda */}
          <Route path="/" element={<Home />} />

          {/* Halaman Peringkat Popularity */}
          <Route path="/populer-alltime" element={<Ranking />} />
        </Routes>
      </Router>
    </div>
  );
}
