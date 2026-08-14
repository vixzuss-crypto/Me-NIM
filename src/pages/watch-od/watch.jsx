import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, VideoOff } from 'lucide-react';
import { getEpisodeStreamOD, getAnimeServerOD } from '../../api/anime/api';

// Watch episode sumber Otakudesu — halaman baru, terpisah dari /watch/:episodeId (Samehadaku)
export default function WatchOD() {
  const { episodeId } = useParams();
  const [streamData, setStreamData] = useState(null);
  const [iframeUrl,  setIframeUrl]  = useState('');
  const [loading,    setLoading]    = useState(true);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setIframeUrl(''); setStreamData(null);
    (async () => {
      try {
        const res  = await getEpisodeStreamOD(episodeId);
        if (abortRef.current) return;
        const data = res?.data?.data || res?.data;
        setStreamData(data);

        const defaultServerId = data?.server?.qualities?.[0]?.serverList?.[0]?.serverId;
        if (defaultServerId) {
          const sres = await getAnimeServerOD(defaultServerId);
          if (abortRef.current) return;
          const d = sres?.data?.data || sres?.data;
          setIframeUrl(d?.url || d?.iframeUrl || d?.link || '');
        } else {
          setIframeUrl(data?.defaultStreamingUrl || data?.url || '');
        }
      } catch {
        /* silent, ditampilkan lewat VideoOff fallback */
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [episodeId]);

  const animeId = streamData?.animeId || streamData?.anime?.animeId;

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <Link to={animeId ? `/detail-od/${animeId}` : '/movies-od'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> {animeId ? 'Kembali ke Detail' : 'Movies (Otakudesu)'}
        </Link>
      </div>

      {loading ? <p className="text-sm text-slate-500">Memuat...</p> : (
        <>
          <h1 className="text-base sm:text-lg font-black text-white mb-4">{streamData?.title || 'Nonton'}</h1>
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {iframeUrl ? (
              <iframe src={iframeUrl} title="Player" className="w-full h-full border-0" allowFullScreen
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
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
        </>
      )}
    </main>
  );
}
