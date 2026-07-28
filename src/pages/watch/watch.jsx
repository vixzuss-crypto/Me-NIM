import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getEpisodeStream, getAnimeServer, getAnimeDetail } from "../../api/anime/api";
import {
  ArrowLeft,
  Lock,
  ExternalLink,
  Server,
  Loader2,
  VideoOff,
  CheckCircle,
  AlertTriangle,
  List,
} from "lucide-react";

// ─── Domain lists ─────────────────────────────────────────────────────────────
const BLOCKED_DOMAINS = [
  "filedon.co", "netu.tv", "desustream.com", "vidstream.io",
  "kwik.si", "samehadaku.care", "rplayer.co", "streamlare.com",
];
function isBlocked(url = "") {
  try { return BLOCKED_DOMAINS.some((d) => new URL(url).hostname.includes(d)); }
  catch { return false; }
}

// ─── Flatten data.server.qualities ───────────────────────────────────────────
function flattenServers(data) {
  const qualities = data?.server?.qualities;
  if (!Array.isArray(qualities)) return [];
  const result = [];
  for (const q of qualities) {
    if (!Array.isArray(q.serverList)) continue;
    for (const srv of q.serverList) {
      if (!srv?.serverId) continue;
      result.push({
        title: srv.title,
        serverId: srv.serverId,
        quality: q.title === "unknown" ? "" : q.title,
      });
    }
  }
  return result;
}

function pickBestIndex(servers) {
  const blogIdx = servers.findIndex((s) =>
    s.title?.toLowerCase().includes("blogspot") ||
    s.title?.toLowerCase().includes("blogger")
  );
  if (blogIdx >= 0) return blogIdx;
  const hd = servers.findIndex((s) => s.quality === "720p");
  if (hd >= 0) return hd;
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Watch() {
  const { episodeId } = useParams();
  const navigate = useNavigate();

  const [streamData,    setStreamData]    = useState(null);
  const [servers,       setServers]       = useState([]);
  const [episodeList,   setEpisodeList]   = useState([]);  // dari getAnimeDetail
  const [iframeUrl,     setIframeUrl]     = useState("");
  const [selectedIdx,   setSelectedIdx]   = useState(null);
  const [embedBlocked,  setEmbedBlocked]  = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [serverLoading, setServerLoading] = useState(false);
  const [epError,       setEpError]       = useState("");
  const abortRef = useRef(false);

  const resolveUrl = (url) => {
    setIframeUrl(url);
    setEmbedBlocked(!!url && isBlocked(url));
  };

  const loadServer = async (serverList, idx) => {
    const srv = serverList[idx];
    setSelectedIdx(idx);
    setIframeUrl("");
    setEmbedBlocked(false);
    setServerLoading(true);
    try {
      const res = await getAnimeServer(srv.serverId);
      const d = res?.data?.data || res?.data || res;
      resolveUrl(d?.url || d?.iframeUrl || d?.link || d?.embed || "");
    } catch (err) {
      console.error("[Watch] Server error:", err);
    }
    setServerLoading(false);
  };

  // ─── Load episode stream + detail anime untuk episode list ────────────────
  useEffect(() => {
    abortRef.current = false;

    const init = async () => {
      setLoading(true);
      setIframeUrl("");
      setSelectedIdx(null);
      setEmbedBlocked(false);
      setServers([]);
      setStreamData(null);
      setEpisodeList([]);
      setEpError("");

      try {
        // Step 1 — stream data (server, judul, animeId)
        const res = await getEpisodeStream(episodeId);
        if (abortRef.current) return;
        const data = res?.data?.data || res?.data;
        setStreamData(data);

        const flat = flattenServers(data);
        if (flat.length > 0) {
          setServers(flat);
          if (!abortRef.current) await loadServer(flat, pickBestIndex(flat));
        } else {
          if (!abortRef.current) resolveUrl(data?.defaultStreamingUrl || data?.url || "");
        }

        // Step 2 — ambil episode list dari detail anime (bukan recommendedEpisodeList
        //           yang buggy — field episodeId & title-nya selalu ikut episode aktif)
        const animeId =
          data?.animeId ||
          data?.anime_id ||
          data?.anime?.animeId ||
          data?.anime?.id;

        if (animeId && !abortRef.current) {
          try {
            const detailRes = await getAnimeDetail(animeId);
            if (abortRef.current) return;
            const detail = detailRes?.data?.data || detailRes?.data;
            const epList =
              detail?.episodeList ||
              detail?.episodes    ||
              detail?.episodesList ||
              detail?.episode_list ||
              detail?.listEpisode  ||
              detail?.eps          ||
              [];
            // Urutkan ascending (ep 1 → ep terakhir)
            const sorted = [...epList].sort((a, b) => {
              const numA = Number(a?.title ?? a?.name ?? a?.episode ?? 0);
              const numB = Number(b?.title ?? b?.name ?? b?.episode ?? 0);
              return numA - numB;
            });
            if (!abortRef.current) setEpisodeList(sorted);
          } catch (_) { /* detail gagal → episode list tetap kosong */ }
        }

      } catch (err) {
        if (!abortRef.current) {
          console.error("[Watch] Error:", err);
          setEpError("Gagal memuat episode. Coba refresh halaman.");
        }
      }
      if (!abortRef.current) setLoading(false);
    };

    init();
    return () => { abortRef.current = true; };
  }, [episodeId]);

  // ─── Data turunan ─────────────────────────────────────────────────────────
  const animeId = streamData?.animeId || streamData?.anime_id || streamData?.anime?.animeId;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="w-full max-w-5xl mx-auto px-4 py-6">

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to={animeId ? `/detail/${animeId}` : -1}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {animeId ? "Kembali ke Detail" : "Kembali"}
        </Link>
      </div>

      {/* ── ERROR BANNER ─────────────────────────────────────────────────── */}
      {epError && (
        <div className="mb-4 flex items-center gap-2 bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {epError}
        </div>
      )}

      <h1 className="text-base sm:text-lg font-bold text-white mb-4 leading-snug">
        {streamData?.title || "Nonton Anime"}
      </h1>

      {/* ── VIDEO PLAYER ─────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        {(loading || serverLoading) && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-400 text-xs z-10">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
            <span>Memuat Player...</span>
          </div>
        )}

        {!loading && !serverLoading && embedBlocked && iframeUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 text-center px-6 z-10">
            <Lock className="w-10 h-10 text-yellow-400" />
            <div>
              <p className="text-sm font-bold text-white">Server Ini Memblokir Embed</p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed mt-1">
                Coba server <span className="text-emerald-400 font-semibold">Blogspot</span> di bawah,
                atau tonton langsung di tab baru.
              </p>
            </div>
            <a href={iframeUrl} target="_blank" rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Buka di Tab Baru
            </a>
          </div>
        )}

        {!loading && !serverLoading && iframeUrl && !embedBlocked && (
          <iframe
            src={iframeUrl}
            title="Anime Stream Player"
            className="w-full h-full border-0"
            allowFullScreen
            referrerPolicy="no-referrer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}

        {!loading && !serverLoading && !iframeUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
            <VideoOff className="w-8 h-8" />
            <span className="text-xs">Video tidak ditemukan atau server offline.</span>
          </div>
        )}
      </div>

      {/* ── FALLBACK TAB BARU ────────────────────────────────────────────── */}
      {iframeUrl && !embedBlocked && !loading && !serverLoading && (
        <div className="mt-3 flex items-center justify-between gap-3 bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800">
          <p className="text-[11px] text-slate-500">Player tidak muncul? Coba server lain atau buka di tab baru.</p>
          <a href={iframeUrl} target="_blank" rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Tab Baru <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* ── EPISODE LIST — dari getAnimeDetail (bukan recommendedEpisodeList) */}
      {episodeList.length > 0 && (
        <div className="mt-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <List className="w-3.5 h-3.5" />
            Pilih Episode
          </h3>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1
            [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-slate-800
            [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
            {episodeList.map((ep, idx) => {
              const epId =
                ep?.episodeId ||
                ep?.id        ||
                ep?.slug      ||
                ep?.endpoint  ||
                ep?.episode_id;

              const rawNum = ep?.title ?? ep?.name ?? ep?.episode ?? null;
              const epNum  = rawNum !== null && rawNum !== "" ? rawNum : idx + 1;

              const isActive = !!epId && epId === episodeId;

              return (
                <button
                  key={epId || idx}
                  onClick={() => {
                    if (isActive || !epId) return;
                    navigate(`/watch/${epId}`);
                  }}
                  disabled={isActive}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white cursor-default shadow-lg shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  Ep {epNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SERVER LIST ──────────────────────────────────────────────────── */}
      {servers.length > 0 && (
        <div className="mt-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            Server Streaming
          </h3>
          <div className="flex flex-wrap gap-2">
            {servers.map((srv, idx) => {
              const isActive = selectedIdx === idx;
              const isRecommended =
                srv.title?.toLowerCase().includes("blogspot") ||
                srv.title?.toLowerCase().includes("blogger");
              return (
                <button
                  key={idx}
                  onClick={() => loadServer(servers, idx)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {isRecommended
                    ? <CheckCircle className={`w-3 h-3 ${isActive ? "text-emerald-300" : "text-emerald-400"}`} />
                    : <AlertTriangle className={`w-3 h-3 ${isActive ? "text-yellow-300" : "text-yellow-600"}`} />
                  }
                  {srv.title}
                  {srv.quality && (
                    <span className={`text-[9px] ${isActive ? "text-indigo-200" : "text-slate-500"}`}>
                      {srv.quality}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-600 mt-2.5 flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> bisa langsung diputar
            </span>
            <span className="inline-flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5 text-yellow-700" /> perlu dibuka di tab baru
            </span>
          </p>
        </div>
      )}
    </main>
  );
}