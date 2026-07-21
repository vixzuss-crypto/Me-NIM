import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Ranking from './pages/popularity/ranking';
import DetailAnime from './pages/detail/detail'; // Import file detail
import Watch from './pages/watch/watch';             // Import file watch

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 antialiased">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/populer-alltime" element={<Ranking />} />

          {/* Rute Baru untuk Detail & Nonton */}
          <Route path="/detail/:animeId" element={<DetailAnime />} />
          <Route path="/watch/:episodeId" element={<Watch />} />
        </Routes>
      </Router>
    </div>
  );
}