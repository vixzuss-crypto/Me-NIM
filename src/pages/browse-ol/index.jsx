import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Search } from 'lucide-react';
import { getAnimeDirectoryOL, searchAnimeOL } from '../../api/anime/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner    from '../../components/ErrorBanner';
import PageHeader     from '../../components/PageHeader';

// Browse & Search Oploverz — directory A-Z + search
export default function BrowseOL() {
  const [data,    setData]    = useState(null);   // { sectionList } untuk directory mode
  const [results, setResults] = useState([]);      // untuk search mode
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [query,   setQuery]   = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const abortRef  = useRef(false);
  const debouncer = useRef(null);

  // Load directory A-Z on mount
  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError('');
    (async () => {
      try {
        const res = await getAnimeDirectoryOL();
        if (abortRef.current) return;
        const d = res?.data?.data || res?.data;
        setData(d);
      } catch {
        if (!abortRef.current) setError('Gagal memuat daftar anime Oploverz.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, []);

  // Search dengan debounce 400ms
  const handleSearch = (val) => {
    setQuery(val);
    clearTimeout(debouncer.current);
    if (!val.trim()) { setIsSearching(false); setResults([]); return; }
    debouncer.current = setTimeout(async () => {
      setIsSearching(true); setLoading(true); setError('');
      try {
        const res = await searchAnimeOL(val.trim());
        const d   = res?.data?.data || res?.data;
        setResults(d?.animeList ?? (Array.isArray(d) ? d : []));
      } catch {
        setError('Pencarian gagal.');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const sections = data?.sectionList ?? [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={LayoutGrid} title="Browse Oploverz" subtitle="Direktori anime A-Z + pencarian dari Oploverz" />

      {/* Search bar */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Cari anime Oploverz..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60
            text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60
            focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
      </div>

      <ErrorBanner message={error} />
      {loading ? <LoadingSpinner fullPage /> : (

        /* ── Search results ───────────────────────────────────── */
        isSearching ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {results.length === 0 && !error && (
              <p className="col-span-full text-sm text-slate-600 text-center py-10">Tidak ada hasil.</p>
            )}
            {results.map((anime, i) => {
              const slug   = anime?.slug || anime?.href?.split('/').filter(Boolean).pop();
              const poster = anime?.poster || anime?.image || '';
              return (
                <Link key={`search-${slug || 'item'}-${i}`} to={`/detail-ol/${slug}`}
                  className="group flex flex-col gap-1.5 focus:outline-none">
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900
                    border border-slate-800/60 group-hover:border-indigo-500/40 transition-all">
                    {poster && (
                      <img src={poster} alt={anime?.title} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    {anime?.type && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px]
                        font-bold bg-black/70 text-indigo-300 backdrop-blur-sm uppercase">{anime.type}</div>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white line-clamp-2 leading-tight px-0.5">
                    {anime?.title ?? '—'}
                  </p>
                  {anime?.status && (
                    <p className="text-[10px] text-slate-500 px-0.5">{anime.status}</p>
                  )}
                </Link>
              );
            })}
          </div>

        /* ── A-Z Directory ────────────────────────────────────── */
        ) : (
          <div className="space-y-8">
            {sections.map((section, si) => (
              <section key={`sec-${section?.letter ?? si}`}>
                <h2 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3
                  pb-1 border-b border-slate-800/60">
                  {section?.letter ?? '—'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(section?.animeList ?? []).map((anime, i) => {
                    const slug = anime?.slug || anime?.href?.split('/').filter(Boolean).pop();
                    return (
                      <Link key={`az-${section?.letter || 'sec'}-${slug || 'item'}-${i}`} to={`/detail-ol/${slug}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-300
                          hover:bg-indigo-600 hover:text-white border border-slate-800 hover:border-indigo-500
                          transition-all">
                        {anime?.title ?? slug}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
            {sections.length === 0 && !error && (
              <p className="text-sm text-slate-600 text-center py-10">Tidak ada data direktori.</p>
            )}
          </div>
        )
      )}
    </main>
  );
}