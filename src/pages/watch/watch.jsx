import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEpisodeStream, getAnimeServer, getAnimeDetail } from '../../api/anime/api';
import { fetchWithRetry } from '../../lib/utils';
import {
  ArrowLeft, Lock, ExternalLink, Server, Loader2,
  VideoOff, CheckCircle, AlertTriangle, List,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner    from '../../components/ErrorBanner';

const BLOCKED = [
  'filedon.co', 'netu.tv', 'desustream.com', 'vidstream.io',
  'kwik.si', 'samehadaku.care', 'rplayer.co', 'streamlare.com',
];

const isBlocked = (url = '') => {
  try { return BLOCKED.some((d) => new URL(url).hostname.includes(d)); }
  catch { return false; }
};

const flattenServers = (data) => {
  const qualities = data?.server?.qualities;
  if (!Array.isArray(qualities)) return [];
  return qualities.flatMap((q) =>
    (q.serverList || [])
      .filter((s) => s?.serverId)
      .map((s) => ({ title: s.title, serverId: s.serverId, quality: q.title === 'unknown' ? '' : q.title }))
  );
};

const pickBestIdx = (servers) => {
  const bi = servers.findIndex((s) =>
    s.title?.toLowerCase().includes('blogspot') || s.title?.toLowerCase().includes('blogger'));
  if (bi >= 0) return bi;
  const hi = servers.findIndex((s) => s.quality === '720p');
  return hi >= 0 ? hi : 0;
};

export default function Watch() {
  const { episodeId } = useParams();
  const navigate = useNavigate();

  const [streamData,    setStreamData]    = useState(null);
  const [servers,       setServers]       = useState([]);
  const [episodeList,   setEpisodeList]   = useState([]);
  const [iframeUrl,     setIframeUrl]     = useState('');
  const [selectedIdx,   setSelectedIdx]   = useState(null);
  const [embedBlocked,  setEmbedBlocked]  = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [serverLoading, setServerLoading] = useState(false);
  const [error,         setError]         = useState('');
  const abortRef = useRef(false);

  const resolveUrl = (url) => {
    setIframeUrl(url);
    setEmbedBlocked(!!url && isBlocked(url));
  };

  const loadServer = async (list, idx) => {
    setSelectedIdx(idx);
    setIframeUrl('');
    setEmbedBlocked(false);
    setServerLoading(true);
    try {
      const res = await fetchWithRetry(() => getAnimeServer(list[idx].serverId));
      const d   = res?.data?.data || res?.data || res;
      resolveUrl(d?.url || d?.iframeUrl || d?.link || d?.embed || '');
    } catch { /* silent */ }
    setServerLoading(false);
  };

  useEffect(() => {
    abortRef.current = false;
    setLoading(true);
    setIframeUrl(''); setSelectedIdx(null); setEmbedBlocked(false);
    setServers([]); setStreamData(null); setEpisodeList([]); setError('');

    (async () => {
      try {
        // Step 1 — stream
        const res  = await fetchWithRetry(() => getEpisodeStream(episodeId));
        if (abortRef.current) return;
        const data = res?.data?.data || res?.data;
        setStreamData(data);

        const flat = flattenServers(data);
        if (flat.length > 0) {
          setServers(flat);
          if (!abortRef.current) await loadServer(flat, pickBestIdx(flat));
        } else {
          resolveUrl(data?.defaultStreamingUrl || data?.url || '');
        }

        // Step 2 — episode list dari detail (bukan recommendedEpisodeList yg bug)
        const animeId = data?.animeId || data?.anime_id || data?.anime?.animeId;
        if (animeId && !abortRef.current) {
          try {
            const dr = await fetchWithRetry(() => getAnimeDetail(animeId));
            if (abortRef.current) return;
            const d2 = dr?.data?.data || dr?.data;
            const epList = d2?.episodeList || d2?.episodes || d2?.episodesList || [];
            // sort ascending (ep 1 dulu)
            const sorted = [...epList].sort((a, b) => {
              const na = Number(a?.title ?? a?.episode ?? 0);
              const nb = Number(b?.title ?? b?.episode ?? 0);
              return na - nb;
            });
            if (!abortRef.current) setEpisodeList(sorted);
          } catch { /* silent */ }
        }
      } catch {
        if (!abortRef.current) setError('Gagal memuat episode. Coba refresh halaman.');
      }
      if (!abortRef.current) setLoading(false);
    })();

    return () => { abortRef.current = true; };
  }, [episodeId]);

  const animeId = streamData?.animeId || streamData?.anime_id || streamData?.anime?.animeId;

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Link to={animeId ? `/detail/${animeId}` : '/'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          {animeId ? 'Kembali ke Detail' : 'Beranda'}
        </Link>
      </div>

      <ErrorBanner message={error} />

      {loading ? <LoadingSpinner fullPage /> : (
        <>
          <h1 className="text-base sm:text-lg font-black text-white mb-4 leading-snug">
            {streamData?.title || 'Nonton Anime'}
          </h1>

          {/* ── VIDEO PLAYER ──────────────────────────────────────────────── */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden
            border border-slate-800 shadow-2xl">

            {serverLoading && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-400 z-10">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
                <span className="text-xs">Memuat Player...</span>
              </div>
            )}

            {!serverLoading && embedBlocked && iframeUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4
                bg-slate-950 text-center px-6 z-10">
                <Lock className="w-10 h-10 text-yellow-400" />
                <div>
                  <p className="text-sm font-bold text-white">Server Ini Memblokir Embed</p>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed mt-1">
                    Coba server <span className="text-emerald-400 font-bold">Blogspot</span> di bawah,
                    atau tonton langsung di tab baru.
                  </p>
                </div>
                <a href={iframeUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold
                    px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Buka di Tab Baru
                </a>
              </div>
            )}

            {!serverLoading && iframeUrl && !embedBlocked && (
              <iframe src={iframeUrl} title="Player" className="w-full h-full border-0"
                allowFullScreen referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            )}

            {!serverLoading && !iframeUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600">
                <VideoOff className="w-8 h-8" />
                <span className="text-xs">Video tidak tersedia atau server offline.</span>
              </div>
            )}
          </div>

          {/* Tab baru fallback */}
          {iframeUrl && !embedBlocked && (
            <div className="mt-3 flex items-center justify-between gap-3
              bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800">
              <p className="text-[11px] text-slate-500">Player tidak muncul? Coba server lain atau buka di tab baru.</p>
              <a href={iframeUrl} target="_blank" rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold
                  text-indigo-400 hover:text-indigo-300 transition-colors">
                Tab Baru <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* ── EPISODE LIST ──────────────────────────────────────────────── */}
          {episodeList.length > 0 && (
            <div className="mt-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <List className="w-3.5 h-3.5" /> Pilih Episode
              </h3>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1
                [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-slate-800
                [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                {episodeList.map((ep, i) => {
                  const epId    = ep?.episodeId || ep?.id || ep?.slug;
                  const epNum   = ep?.title ?? ep?.episode ?? i + 1;
                  const isActive = !!epId && epId === episodeId;
                  return (
                    <button key={epId || i}
                      onClick={() => { if (!isActive && epId) navigate(`/watch/${epId}`); }}
                      disabled={isActive}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white cursor-default shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/40'
                      }`}>
                      Ep {epNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SERVER LIST ───────────────────────────────────────────────── */}
          {servers.length > 0 && (
            <div className="mt-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" /> Server Streaming
              </h3>
              <div className="flex flex-wrap gap-2">
                {servers.map((srv, idx) => {
                  const isActive = selectedIdx === idx;
                  const isGood   = srv.title?.toLowerCase().includes('blogspot') || srv.title?.toLowerCase().includes('blogger');
                  return (
                    <button key={idx} onClick={() => loadServer(servers, idx)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/40'
                      }`}>
                      {isGood
                        ? <CheckCircle  className={`w-3 h-3 ${isActive ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        : <AlertTriangle className={`w-3 h-3 ${isActive ? 'text-yellow-300' : 'text-yellow-600'}`} />}
                      {srv.title}
                      {srv.quality && (
                        <span className={`text-[9px] ${isActive ? 'text-indigo-200' : 'text-slate-600'}`}>
                          {srv.quality}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-700 mt-2.5 flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5 text-emerald-700" /> bisa langsung diputar
                </span>
                <span className="inline-flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-yellow-800" /> perlu tab baru
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
