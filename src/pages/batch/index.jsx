import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Package, ArrowLeft, Download, ChevronRight, HardDrive } from 'lucide-react';
import { getBatchList, getBatchDetail } from '../../api/anime/api';
import { extractList, fetchWithRetry, fixUrl } from '../../lib/utils';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import ErrorBanner from '../../components/ErrorBanner';
import PageHeader  from '../../components/PageHeader';
import Pagination  from '../../components/Pagination';

// ── Skeleton batch row ────────────────────────────────────────────────────────
function SkeletonBatchList({ count = 10 }) {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/40">
          <div className="shrink-0 w-12 h-16 rounded-lg bg-slate-800/70" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-slate-800/70" />
            <div className="h-2.5 w-1/4 rounded bg-slate-800/50" />
          </div>
          <div className="w-4 h-4 rounded bg-slate-800/40 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ── Batch List ────────────────────────────────────────────────────────────────
export function BatchList() {
  const [page, setPage] = useState(1);
  const apiFn = useCallback((p) => getBatchList(p), []);
  const { list, loading, error } = usePaginatedFetch(apiFn, page);
  const changePage = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={Package} title="Batch Download" subtitle="Download koleksi episode sekaligus" />
      <ErrorBanner message={error} />

      {loading ? <SkeletonBatchList /> : (
        <>
          <div className="flex flex-col gap-2">
            {list.length === 0
              ? <p className="text-sm text-slate-600 text-center py-10">Tidak ada batch tersedia.</p>
              : list.map((batch, i) => {
                  const poster = fixUrl(batch?.poster || '');
                  return (
                    <Link key={batch.batchId || i} to={`/batch/${batch.batchId}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40
                        hover:bg-slate-800/60 border border-slate-800/40 hover:border-indigo-500/30
                        transition-all group">
                      <div className="shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/40">
                        {poster
                          ? <img src={poster} alt={batch.title} loading="lazy" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-600" />
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                          {batch.title}
                        </p>
                        {batch.status && (
                          <span className="mt-1 inline-flex items-center text-[10px] font-semibold
                            text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
                            {batch.status}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 shrink-0 transition-colors" />
                    </Link>
                  );
                })
            }
          </div>
          {list.length > 0 && (
            <Pagination page={page} onPrev={() => changePage(Math.max(1, page - 1))} onNext={() => changePage(page + 1)} />
          )}
        </>
      )}
    </main>
  );
}

// ── Batch Detail ──────────────────────────────────────────────────────────────
function SkeletonBatchDetail() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex gap-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60">
        <div className="shrink-0 w-24 aspect-[3/4] rounded-xl bg-slate-800/70" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-5 w-2/3 rounded bg-slate-800/70" />
          <div className="h-3 w-1/3 rounded bg-slate-800/50" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 w-16 rounded-md bg-slate-800/60" />
            <div className="h-5 w-12 rounded-md bg-slate-800/50" />
          </div>
        </div>
      </div>
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 space-y-3">
        <div className="h-3 w-24 rounded bg-slate-800/60" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 rounded-lg bg-slate-800/40" />
        ))}
      </div>
    </div>
  );
}

export function BatchDetail() {
  const { batchId } = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError(''); setData(null);
    (async () => {
      try {
        const res = await fetchWithRetry(() => getBatchDetail(batchId));
        if (abortRef.current) return;
        setData(res?.data?.data || res?.data);
      } catch {
        if (!abortRef.current) setError('Gagal memuat detail batch.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [batchId]);

  const poster  = fixUrl(data?.poster || data?.image || '');
  const formats = data?.downloadUrl?.formats ?? [];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Link to="/batch"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400
          hover:text-indigo-300 transition-colors mb-5">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Batch
      </Link>
      <ErrorBanner message={error} />

      {loading ? <SkeletonBatchDetail /> : data && (
        <div className="space-y-5">
          <div className="flex gap-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60">
            {poster && (
              <div className="shrink-0 w-24 aspect-[3/4] rounded-xl overflow-hidden border border-slate-700/40 shadow-xl">
                <img src={poster} alt={data.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-black text-white leading-tight mb-2">{data.title}</h1>
              {data.japanese && <p className="text-xs text-slate-500 mb-3">{data.japanese}</p>}
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                {data.status   && <span className="bg-slate-800 px-2 py-0.5 rounded-md">{data.status}</span>}
                {data.episodes && <span className="bg-slate-800 px-2 py-0.5 rounded-md">{data.episodes} ep</span>}
                {data.season   && <span className="bg-slate-800 px-2 py-0.5 rounded-md">{data.season}</span>}
              </div>
            </div>
          </div>

          {formats.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Link Download
              </h3>
              <div className="space-y-4">
                {formats.map((fmt, fi) => (
                  <div key={fi}>
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                      <p className="text-xs font-bold text-slate-400">{fmt.title}</p>
                    </div>
                    {fmt.qualities?.map((q, qi) => (
                      <div key={qi} className="mb-3">
                        <p className="text-[10px] font-semibold text-indigo-400 mb-1.5 ml-5">{q.title}</p>
                        <div className="flex flex-wrap gap-2 ml-5">
                          {q.urls?.map((u, ui) => (
                            <a key={ui} href={u.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold
                                bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white
                                px-3 py-1.5 rounded-lg border border-slate-700/40 hover:border-indigo-500/60
                                transition-all">
                              <Download className="w-3 h-3" />
                              {u.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}