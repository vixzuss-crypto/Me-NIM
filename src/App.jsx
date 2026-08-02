import { Routes, Route } from 'react-router-dom';
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';

import Home     from './pages/home/index';
import Detail   from './pages/detail/detail';
import Watch    from './pages/watch/watch';
import Schedule from './pages/schedule/schedule';
import Ranking  from './pages/popularity/ranking';

import Ongoing   from './pages/ongoing/index';
import Completed from './pages/completed/index';
import Movies    from './pages/movies/index';
import Browse    from './pages/browse/index';
import { GenreList, GenreDetail } from './pages/genres/index';
import { BatchList, BatchDetail } from './pages/batch/index';

export default function App() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <Routes>
          {/* Core */}
          <Route path="/"                 element={<Home />}     />
          <Route path="/detail/:animeId"  element={<Detail />}   />
          <Route path="/watch/:episodeId" element={<Watch />}    />
          <Route path="/jadwal"           element={<Schedule />} />
          <Route path="/populer"          element={<Ranking />}  />

          {/* Browse */}
          <Route path="/ongoing"          element={<Ongoing />}   />
          <Route path="/completed"        element={<Completed />} />
          <Route path="/movies"           element={<Movies />}    />
          <Route path="/browse"           element={<Browse />}    />

          {/* Genres */}
          <Route path="/genres"           element={<GenreList />}   />
          <Route path="/genres/:genreId"  element={<GenreDetail />} />

          {/* Batch */}
          <Route path="/batch"            element={<BatchList />}   />
          <Route path="/batch/:batchId"   element={<BatchDetail />} />

          {/* 404 */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-600">
              <p className="text-6xl font-black">404</p>
              <p className="text-sm">Halaman tidak ditemukan.</p>
              <a href="/" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-2">
                ← Kembali ke Beranda
              </a>
            </div>
          } />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}