import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEpisodeStream, getAnimeServer } from "../../api/anime/api";

// Domain yang DIKETAHUI blokir embed
const BLOCKED_DOMAINS = [
  "filedon.co", "netu.tv", "desustream.com", "vidstream.io",
  "kwik.si", "samehadaku.care", "rplayer.co", "streamlare.com",
];

// Domain yang DIKETAHUI bisa di-embed
const EMBEDDABLE_DOMAINS = [
  "blogger.com", "blogspot.com", "googlevideo.com", "drive.google.com",
];

function isBlocked(url = "") {
  try { return BLOCKED_DOMAINS.some((d) => new URL(url).hostname.includes(d)); }
  catch { return false; }
}

function isEmbeddable(url = "") {
  try { return EMBEDDABLE_DOMAINS.some((d) => new URL(url).hostname.includes(d)); }
  catch { return false; }
}

// ─── Flatten data.server.qualities → array server datar ──────────────────────
// Struktur API:
//   data.server.qualities = [
//     { title: "720p", serverList: [{ title: "Wibufile 720p", serverId: "..." }] },
//     ...
//   ]
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
        quality: q.title === "unknown" ? "" : q.title, // sembunyikan label "unknown"
      });
    }
  }
  return result;
}

// ─── Tentukan server terbaik untuk dicoba pertama ─────────────────────────────
// Preferensi: Blogspot/Blogger > kualitas tertinggi > server pertama
function pickBestIndex(servers) {
  // Cari yang namanya mengandung "blogspot" atau "blogger" duluan
  const blogIdx = servers.findIndex((s) =>
    s.title?.toLowerCase().includes("blogspot") ||
    s.title?.toLowerCase().includes("blogger")
  );
  if (blogIdx >= 0) return blogIdx;

  // Kalau tidak ada, cari kualitas 720p dulu
  const hd = servers.findIndex((s) => s.quality === "720p");
  if (hd >= 0) return hd;

  return 0; // fallback server pertama
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Watch() {
  const { episodeId } = useParams();

  const [streamData, setStreamData]       = useState(null);
  const [servers, setServers]             = useState([]);   // flat server list
  const [iframeUrl, setIframeUrl]         = useState("");
  const [selectedIdx, setSelectedIdx]     = useState(null);
  const [embedBlocked, setEmbedBlocked]   = useState(false);
  const [loading, setLoading]             = useState(true);
  const [serverLoading, setServerLoading] = useState(false);

  // ─── Load data episode ──────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setIframeUrl("");
      setSelectedIdx(null);
      setEmbedBlocked(false);
      setServers([]);

      try {
        const res = await getEpisodeStream(episodeId);
        const data = res?.data?.data || res?.data;
        setStreamData(data);

        const flat = flattenServers(data);

        if (flat.length > 0) {
          setServers(flat);
          const bestIdx = pickBestIndex(flat);
          await loadServer(flat, bestIdx);
        } else {
          // Tidak ada server list → pakai defaultStreamingUrl (biasanya filedon)
          const url = data?.defaultStreamingUrl || data?.url || "";
          resolveUrl(url);
        }
      } catch (err) {
        console.error("[Watch] Error loading episode:", err);
      }

      setLoading(false);
    };

    init();
  }, [episodeId]);

  // ─── Fetch URL dari endpoint /server/:serverId ────────────────────────────
  const loadServer = async (serverList, idx) => {
    const srv = serverList[idx];
    setSelectedIdx(idx);
    setIframeUrl("");
    setEmbedBlocked(false);
    setServerLoading(true);

    try {
      const res = await getAnimeServer(srv.serverId);
      // axios: res.data.data | res.data
      // fetch mentah: res langsung
      const d = res?.data?.data || res?.data || res;
      const url = d?.url || d?.iframeUrl || d?.link || d?.embed || "";
      resolveUrl(url);
    } catch (err) {
      console.error("[Watch] Error loading server:", err);
    }

    setServerLoading(false);
  };

  const resolveUrl = (url) => {
    setIframeUrl(url);
    setEmbedBlocked(!!url && isBlocked(url));
  };

  const handleServerChange = (idx) => {
    loadServer(servers, idx);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="w-full max-w-5xl mx-auto px-4 py-6">
      <Link to={-1} className="text-xs font-semibold text-indigo-400 hover:underline mb-4 inline-block">
        ← Kembali
      </Link>

      <h1 className="text-lg sm:text-xl font-bold text-white mb-4">
        {streamData?.title || "Nonton Anime"}
      </h1>

      {/* ── NAVIGASI PREV / NEXT EPISODE ─────────────────────────────────── */}
      {(streamData?.hasPrevEpisode || streamData?.hasNextEpisode) && (
        <div className="flex gap-2 mb-4">
          {streamData.hasPrevEpisode && streamData.prevEpisode && (
            <Link
              to={`/watch/${streamData.prevEpisode.episodeId}`}
              className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-all"
            >
              ← Ep Sebelumnya
            </Link>
          )}
          {streamData.hasNextEpisode && streamData.nextEpisode && (
            <Link
              to={`/watch/${streamData.nextEpisode.episodeId}`}
              className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-all"
            >
              Ep Berikutnya →
            </Link>
          )}
        </div>
      )}

      {/* ── VIDEO PLAYER ─────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">

        {/* Loading */}
        {(loading || serverLoading) && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-400 text-xs z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800" />
            <span>Memuat Player...</span>
          </div>
        )}

        {/* Embed diblokir */}
        {!loading && !serverLoading && embedBlocked && iframeUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 text-center px-6 z-10">
            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-white">Server Ini Memblokir Embed</p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed mt-1">
                Coba server <span className="text-emerald-400 font-semibold">Blogspot</span> di bawah,
                atau tonton langsung di tab baru.
              </p>
            </div>
            <a href={iframeUrl} target="_blank" rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Buka di Tab Baru
            </a>
          </div>
        )}

        {/* Iframe (embed berhasil) */}
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

        {/* Tidak ada URL */}
        {!loading && !serverLoading && !iframeUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            Video tidak ditemukan atau server offline.
          </div>
        )}
      </div>

      {/* ── TOMBOL BUKA TAB BARU (saat embed sukses, opsional) ───────────── */}
      {iframeUrl && !embedBlocked && !loading && !serverLoading && (
        <div className="mt-3 flex items-center justify-between gap-3 bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800">
          <p className="text-[11px] text-slate-500">Player tidak muncul? Coba server lain atau buka di tab baru.</p>
          <a href={iframeUrl} target="_blank" rel="noopener noreferrer"
            className="shrink-0 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            Tab Baru
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* ── PILIHAN SERVER ────────────────────────────────────────────────── */}
      {servers.length > 0 && (
        <div className="mt-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Server Streaming</h3>
          <div className="flex flex-wrap gap-2">
            {servers.map((srv, idx) => {
              const isActive = selectedIdx === idx;
              // Tandai "Blogspot" sebagai rekomendasi (bisa embed)
              const isRecommended = srv.title?.toLowerCase().includes("blogspot") ||
                                    srv.title?.toLowerCase().includes("blogger");

              return (
                <button
                  key={idx}
                  onClick={() => handleServerChange(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {isRecommended && (
                    <span className={`text-[9px] ${isActive ? "text-emerald-300" : "text-emerald-400"}`}>✓</span>
                  )}
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
          <p className="text-[10px] text-slate-600 mt-2.5">✓ = bisa langsung diputar di halaman ini</p>
        </div>
      )}
    </main>
  );
}