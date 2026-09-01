import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, ExternalLink,
  VideoOff, Download, Tv2, CalendarDays,
} from 'lucide-react';
import { getEpisodeStreamOL } from '../../api/anime/api';
import { fixUrl } from '../../lib/utils';

// Watch episode sumber Oploverz — terpisah dari /watch/:episodeId (Samehadaku)
// Struktur episode API:
//   streamingUrl: string (blogger embed)
//   download[].title, download[].qualityList[].title, download[].qualityList[].urlList[].title/.url
export default function WatchOL() {
  const { episodeId } = useParams();
  const [streamData, setStreamData] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setStreamData(null); setError('');
    (async () => {
      try {
        const res  = await getEpisodeStreamOL(episodeId);
        if (abortRef.current) return;
        const data = res?.data?.data?.details || res?.data?.data || res?.data;
        setStreamData(data);
      } catch {
        if (!abortRef.current) setError('Gagal memuat episode dari Oploverz.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [episodeId]);

  const iframeUrl  = fixUrl(streamData?.streamingUrl || streamData?.url || '');
  const seriesSlug = streamData?.seriesSlug || '';
  const prevSlug   = streamData?.prevEpisode?.href?.split('/').filter(Boolean).pop();
  const nextSlug   = streamData?.nextEpisode?.href?.split('/').filter(Boolean).pop();

  // download: [{ title, qualityList: [{ title: "480p", urlList: [{ title, url }] }] }]
  const downloadList = streamData?.download ?? [];

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">

      {/* ── Nav bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
        <Link
          to={seriesSlug ? `/detail-ol/${seriesSlug}` : '/home-ol'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400
            hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {seriesSlug ? 'Kembali ke Detail' : 'Home Oploverz'}
        </Link>

        {/* Prev / Next episode */}
        <div className="flex items-center gap-2">
          {prevSlug && (
            <Link to={`/watch-ol/${prevSlug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg
                bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white
                border border-slate-700/40 hover:border-indigo-500 transition-all">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </Link>
          )}
          {nextSlug && (
            <Link to={`/watch-ol/${nextSlug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg
                bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white
                border border-slate-700/40 hover:border-indigo-500 transition-all">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">Memuat episode...</div>
      ) : (
        <>
          {/* Episode title */}
          {streamData?.title && (
            <div className="mb-4">
              <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
                {streamData.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                {streamData.seriesName && (
                  <span className="flex items-center gap-1">
                    <Tv2 className="w-3.5 h-3.5" />
                    {streamData.seriesName}
                  </span>
                )}
                {streamData.releasedOn && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {streamData.releasedOn}
                  </span>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          {/* ── Player ─────────────────────────────────────────────────── */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden
            border border-slate-800 shadow-2xl shadow-black/60 mb-4">
            {iframeUrl ? (
              <iframe
                src={iframeUrl}
                title="Player Oploverz"
                className="w-full h-full border-0"
                allowFullScreen
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600">
                <VideoOff className="w-10 h-10" />
                <span className="text-sm">Video tidak tersedia.</span>
                <p className="text-xs text-slate-700 max-w-xs text-center">
                  Server streaming tidak dapat dimuat. Coba link download di bawah.
                </p>
              </div>
            )}
          </div>

          {/* Open in new tab */}
          {iframeUrl && (
            <a href={iframeUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400
                hover:text-indigo-300 transition-colors mb-6">
              Buka di Tab Baru <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* ── Download Section ──────────────────────────────────────── */}
          {downloadList.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4
                flex items-center gap-2">
                <Download className="w-3.5 h-3.5" />
                Link Download
              </h3>

              <div className="space-y-4">
                {downloadList.map((batch, bi) => (
                  <div key={bi}>
                    {batch?.title && (
                      <p className="text-xs font-semibold text-slate-400 mb-2">{batch.title}</p>
                    )}
                    <div className="space-y-2">
                      {(batch?.qualityList ?? []).map((q, qi) => (
                        <div key={qi} className="flex items-start gap-3">
                          {/* Quality label */}
                          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg
                            text-[10px] font-bold bg-indigo-600/10 text-indigo-400
                            border border-indigo-500/20 min-w-[48px] justify-center">
                            {q?.title ?? '?'}
                          </span>
                          {/* Download links */}
                          <div className="flex flex-wrap gap-1.5">
                            {(q?.urlList ?? []).map((link, li) => (
                              <a
                                key={li}
                                href={link?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                                  text-[11px] font-semibold bg-slate-800 text-slate-300
                                  hover:bg-indigo-600 hover:text-white
                                  border border-slate-700/40 hover:border-indigo-500 transition-all"
                              >
                                {link?.title ?? 'Download'}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}