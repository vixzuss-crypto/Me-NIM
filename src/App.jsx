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

// Otakudesu (OD)
import MoviesOD  from './pages/movies-od/index';
import DetailOD  from './pages/detail-od/detail';
import WatchOD   from './pages/watch-od/watch';

// Kuramanime (KM)
import DetailKM  from './pages/detail-km/detail';
import { ExploreKMTypes, ExploreKMPropertyList, ExploreKMAnimeList } from './pages/explore-km/index';

// Oploverz (OL)
import HomeOL    from './pages/home-ol/index';
import DetailOL  from './pages/detail-ol/detail';
import WatchOL   from './pages/watch-ol/watch';
import ScheduleOL from './pages/schedule-ol/index';
import BrowseOL  from './pages/browse-ol/index';

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

          {/* Otakudesu (OD) */}
          <Route path="/movies-od"             element={<MoviesOD />}  />
          <Route path="/detail-od/:animeId"    element={<DetailOD />}  />
          <Route path="/watch-od/:episodeId"   element={<WatchOD />}   />

          {/* Kuramanime (KM) */}
          <Route path="/detail-km/:animeId/:animeSlug"                element={<DetailKM />}            />
          <Route path="/explore-km"                                    element={<ExploreKMTypes />}      />
          <Route path="/explore-km/:propertyType"                      element={<ExploreKMPropertyList />} />
          <Route path="/explore-km/:propertyType/:propertyId"          element={<ExploreKMAnimeList />}  />

          {/* Oploverz (OL) */}
          <Route path="/home-ol"               element={<HomeOL />}     />
          <Route path="/jadwal-ol"             element={<ScheduleOL />} />
          <Route path="/browse-ol"             element={<BrowseOL />}   />
          <Route path="/detail-ol/:animeId"    element={<DetailOL />}   />
          <Route path="/watch-ol/:episodeId"   element={<WatchOL />}    />

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