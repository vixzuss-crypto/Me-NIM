import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, VideoOff } from 'lucide-react';
import { getEpisodeStreamOL } from '../../api/anime/api';
import { fixUrl } from '../../lib/utils';

// Watch episode sumber Oploverz — terpisah dari /watch/:episodeId (Samehadaku)
// Oploverz memakai streamingUrl langsung (bukan server ID seperti OD),
// jadi cukup satu request ke /oploverz/episode/:episodeId.
export default function WatchOL() {
  const { episodeId } = useParams();
  const [streamData, setStreamData] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setStreamData(null);
    (async () => {
      try {
        const res  = await getEpisodeStreamOL(episodeId);
        if (abortRef.current) return;
        const data = res?.data?.data?.details || res?.data?.data || res?.data;
        setStreamData(data);
      } catch {
        /* silent — ditampilkan lewat VideoOff fallback */
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [episodeId]);

  const iframeUrl  = streamData?.streamingUrl || streamData?.url || streamData?.iframeUrl || '';
  const seriesSlug = streamData?.seriesSlug   || streamData?.seriesName?.toLowerCase().replace(/\s+/g, '-') || '';
  const prevSlug   = streamData?.prevEpisode?.href?.split('/').filter(Boolean).pop();
  const nextSlug   = streamData?.nextEpisode?.href?.split('/').filter(Boolean).pop();

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Nav bar */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <Link to={seriesSlug ? `/detail-ol/${seriesSlug}` : '/browse-ol'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          {seriesSlug ? 'Kembali ke Detail' : 'Browse Oploverz'}
        </Link>

        {/* Prev / Next episode */}
        <div className="flex items-center gap-2">
          {prevSlug && (
            <Link to={`/watch-ol/${prevSlug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg
                bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-700/40
                hover:border-indigo-500 transition-all">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </Link>
          )}
          {nextSlug && (
            <Link to={`/watch-ol/${nextSlug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg
                bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-700/40
                hover:border-indigo-500 transition-all">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Memuat...</p>
      ) : (
        <>
          <h1 className="text-base sm:text-lg font-black text-white mb-1">
            {streamData?.title || 'Nonton'}
          </h1>
          {streamData?.releasedOn && (
            <p className="text-xs text-slate-500 mb-4">Rilis: {streamData.releasedOn}</p>
          )}

          {/* Player */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {iframeUrl ? (
              <iframe
                src={iframeUrl}
                title="Player"
                className="w-full h-full border-0"
                allowFullScreen
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600">
                <VideoOff className="w-8 h-8" />
                <span className="text-xs">Video tidak tersedia.</span>
              </div>
            )}
          </div>

          {iframeUrl && (
            <a href={iframeUrl} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Buka di Tab Baru <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Download links jika ada */}
          {streamData?.download?.length > 0 && (
            <div className="mt-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Download</h3>
              <div className="flex flex-wrap gap-2">
                {streamData.download.map((fmt, fi) => (
                  <div key={fi} className="flex flex-col gap-1">
                    {fmt?.qualities?.map((q, qi) => (
                      <div key={qi} className="flex flex-wrap gap-1.5">
                        {q?.links?.map((link, li) => (
                          <a key={li} href={link?.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold
                              bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-700/40
                              hover:border-indigo-500 transition-all">
                            {fmt?.format} {q?.quality} — {link?.host}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    ))}
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