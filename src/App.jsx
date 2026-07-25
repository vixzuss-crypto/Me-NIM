import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/home/index';
import Ranking from './pages/popularity/ranking';
import Schedule from './pages/schedule/schedule';
import DetailAnime from './pages/detail/detail';
import Watch from './pages/watch/watch';

export default function App() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/populer-alltime" element={<Ranking />} />
          <Route path="/jadwal" element={<Schedule />} />
          <Route path="/detail/:animeId" element={<DetailAnime />} />
          <Route path="/watch/:episodeId" element={<Watch />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}