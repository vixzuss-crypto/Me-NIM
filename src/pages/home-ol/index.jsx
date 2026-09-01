import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, Star, Tv2, CalendarDays, ChevronRight, Search } from 'lucide-react';
import { getHomeOL, searchAnimeOL } from '../../api/anime/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner    from '../../components/ErrorBanner';

// ── Anime Card ────────────────────────────────────────────────────────────────
function AnimeCard({ anime }) {
  const slug = anime?.slug || anime?.href?.split('/').filter(Boolean).pop() || '';
  const poster = anime?.poster || anime?.image || '';

  return (
    <Link to={`/detail-ol/${slug}`} className="group flex flex-col gap-2 focus:outline-none">
      {/* Poster */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900
        border border-slate-800/50 group-hover:border-indigo-500/50
        shadow-lg group-hover:shadow-indigo-500/10 transition-all duration-300">
        {poster ? (
          <img
            src={poster}
            alt={anime?.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv2 className="w-8 h-8 text-slate-700" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Type badge */}
        {anime?.type && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px]
            font-bold bg-black/70 text-indigo-300 backdrop-blur-sm uppercase tracking-wide">
            {anime.type}
          </div>
        )}

        {/* Episode badge */}
        {anime?.episode && (
          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px]
            font-bold bg-indigo-600/90 text-white backdrop-blur-sm">
            {anime.episode}
          </div>
        )}

        {/* Score badge */}
        {anime?.score && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5
            px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/70 text-amber-400 backdrop-blur-sm">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            {anime.score}
          </div>
        )}

        {/* Status hover bar */}
        {anime?.status && (
          <div className="absolute bottom-0 left-0 right-0 py-1.5 px-2
            bg-gradient-to-t from-indigo-900/95 to-transparent
            translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-[10px] font-semibold text-indigo-300">{anime.status}</p>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="px-0.5">
        <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white
          line-clamp-2 leading-tight transition-colors">
          {anime?.seriesName || anime?.title || '—'}
        </p>
        {anime?.releaseTime && (
          <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {anime.releaseTime}
          </p>
        )}
      </div>
    </Link>
  );
}

// ── Popular Card (horizontal hero style) ─────────────────────────────────────
function PopularCard({ anime, rank }) {
  const slug   = anime?.slug || anime?.href?.split('/').filter(Boolean).pop() || '';
  const poster = anime?.poster || anime?.image || '';

  return (
    <Link to={`/detail-ol/${slug}`}
      className="group relative flex gap-3 p-3 rounded-xl bg-slate-900/40
        border border-slate-800/50 hover:border-indigo-500/40 hover:bg-slate-800/60
        transition-all duration-200 overflow-hidden">
      {/* Rank number */}
      <span className="absolute top-2 right-3 text-4xl font-black text-slate-800/70 select-none leading-none">
        {rank}
      </span>

      {/* Poster */}
      <div className="relative shrink-0 w-14 aspect-[3/4] rounded-lg overflow-hidden bg-slate-800
        border border-slate-700/50 group-hover:border-indigo-500/30 transition-all">
        {poster ? (
          <img src={poster} alt={anime?.title} loading="lazy"
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv2 className="w-5 h-5 text-slate-700" />
          </div>
        )}
        {anime?.episode && (
          <div className="absolute bottom-0.5 left-0.5 right-0.5 text-center py-0.5 rounded-sm
            text-[8px] font-bold bg-indigo-600/90 text-white leading-tight">
            {anime.episode}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2 leading-tight mb-1 pr-6 transition-colors">
          {anime?.seriesName || anime?.title || '—'}
        </p>
        <div className="flex flex-wrap gap-1">
          {anime?.type && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
              {anime.type}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, to }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Icon className="w-4 h-4 text-indigo-400" />
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold
          text-indigo-400 hover:text-indigo-300 transition-colors">
          Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomeOL() {
  const [popular,  setPopular]  = useState([]);
  const [latest,   setLatest]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Search
  const [query,      setQuery]      = useState('');
  const [searchRes,  setSearchRes]  = useState([]);
  const [searching,  setSearching]  = useState(false);
  const [searchLoad, setSearchLoad] = useState(false);
  const debouncer = useRef(null);
  const abortRef  = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError('');
    (async () => {
      try {
        const res = await getHomeOL();
        if (abortRef.current) return;
        const d = res?.data?.data || res?.data;
        setPopular(d?.popularAnime?.animeList   ?? d?.popular?.animeList   ?? []);
        setLatest (d?.latestRelease?.animeList  ?? d?.latest?.animeList    ?? []);
      } catch {
        if (!abortRef.current) setError('Gagal memuat data dari Oploverz. Coba lagi nanti.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, []);

  const handleSearch = (val) => {
    setQuery(val);
    clearTimeout(debouncer.current);
    if (!val.trim()) { setSearching(false); setSearchRes([]); return; }
    setSearching(true);
    debouncer.current = setTimeout(async () => {
      setSearchLoad(true);
      try {
        const res = await searchAnimeOL(val.trim());
        const d   = res?.data?.data || res?.data;
        setSearchRes(d?.animeList ?? (Array.isArray(d) ? d : []));
      } catch {
        setSearchRes([]);
      } finally {
        setSearchLoad(false);
      }
    }, 400);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/60
        bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-900/60
        p-6 sm:p-8 mb-8">
        {/* Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),_transparent_60%)] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500
              flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Flame className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Oploverz</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
            Anime <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Terpopuler</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-lg">
            Tonton anime subtitle Indonesia dari Oploverz — populer, terbaru, dan selalu update.
          </p>

          {/* Search */}
          <div className="relative mt-5 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Cari anime Oploverz..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60
                text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60
                focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* ── Search Results ────────────────────────────────────────────────── */}
      {searching && (
        <div className="mb-10">
          <SectionHeader icon={Search} title={`Hasil Pencarian "${query}"`} />
          {searchLoad ? (
            <LoadingSpinner />
          ) : searchRes.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Tidak ada hasil ditemukan.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {searchRes.map((anime, i) => (
                <AnimeCard key={`search-ol-${anime?.slug || anime?.href || 'item'}-${i}`} anime={anime} />
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSpinner fullPage />
      ) : !searching && (
        <div className="space-y-12">

          {/* ── Latest Release ──────────────────────────────────────────── */}
          {latest.length > 0 && (
            <section>
              <SectionHeader
                icon={Clock}
                title="Rilis Terbaru"
                subtitle="Episode terbaru yang baru diupload"
                to="/jadwal-ol"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {latest.map((anime, i) => (
                  <AnimeCard key={`latest-ol-${anime?.href || anime?.slug || 'item'}-${i}`} anime={anime} />
                ))}
              </div>
            </section>
          )}

          {/* ── Popular Anime ────────────────────────────────────────────── */}
          {popular.length > 0 && (
            <section>
              <SectionHeader
                icon={Flame}
                title="Anime Populer"
                subtitle="Anime paling banyak ditonton di Oploverz"
                to="/browse-ol"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {popular.map((anime, i) => (
                  <PopularCard key={`pop-ol-${anime?.href || anime?.slug || 'item'}-${i}`} anime={anime} rank={i + 1} />
                ))}
              </div>
            </section>
          )}

          {/* Quick links */}
          <section className="border-t border-slate-800/60 pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { to: '/jadwal-ol', icon: CalendarDays, label: 'Jadwal Tayang',  desc: 'Jadwal anime per hari' },
                { to: '/browse-ol', icon: Search,       label: 'Browse & Cari', desc: 'Direktori A-Z + pencarian' },
              ].map(({ to, icon: Icon, label, desc }) => (
                <Link key={to} to={to}
                  className="group flex items-center gap-3 p-4 rounded-xl bg-slate-900/40
                    border border-slate-800/50 hover:border-indigo-500/40 hover:bg-slate-800/50
                    transition-all duration-200">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20
                    flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
                    <Icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{label}</p>
                    <p className="text-[10px] text-slate-500">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>
      )}
    </main>
  );
}
