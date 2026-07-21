import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEpisodeStream, getAnimeServer } from "../../api/anime/api"; // Impor getAnimeServer

export default function Watch() {
  const { episodeId } = useParams();
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverLoading, setServerLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [selectedServerId, setSelectedServerId] = useState(null);

  useEffect(() => {
    const fetchStream = async () => {
      setLoading(true);
      setIframeUrl("");
      setSelectedServerId(null);

      try {
        const res = await getEpisodeStream(episodeId);
        const data = res?.data?.data || res?.data;
        setStreamData(data);

        // Ambil daftar server
        const servers = data?.serverList || data?.servers || data?.streamServers;
        
        if (Array.isArray(servers) && servers.length > 0) {
          // Ambil server pertama
          const firstServer = servers[0];
          const serverId = firstServer?.serverId || firstServer?.id || firstServer?.server_id;

          if (serverId) {
            setSelectedServerId(serverId);
            await fetchServerUrl(serverId);
          } else if (firstServer?.url) {
            setIframeUrl(firstServer.url);
          }
        } else {
          // Fallback ke default URL jika tidak ada serverList
          setIframeUrl(data?.url || data?.defaultStreamingUrl || "");
        }
      } catch (err) {
        console.error("Gagal load stream video:", err);
      }
      setLoading(false);
    };

    fetchStream();
  }, [episodeId]);

  // Fungsi khusus untuk fetch URL embed murni berdasarkan serverId
  const fetchServerUrl = async (serverId) => {
    setServerLoading(true);
    try {
      const res = await getAnimeServer(serverId);
      const serverData = res?.data?.data || res?.data;
      // Ambil URL hasil response endpoint server
      const realUrl = serverData?.url || serverData?.iframeUrl || serverData?.link;
      if (realUrl) {
        setIframeUrl(realUrl);
      }
    } catch (err) {
      console.error("Gagal load link server:", err);
    }
    setServerLoading(false);
  };

  const handleServerChange = (serverId, directUrl) => {
    setSelectedServerId(serverId);
    if (serverId) {
      fetchServerUrl(serverId);
    } else if (directUrl) {
      setIframeUrl(directUrl);
    }
  };

  return (
    <main className="w-full max-w-5xl mx-auto px-4 py-6">
      <Link
        to={-1}
        className="text-xs font-semibold text-indigo-400 hover:underline mb-4 inline-block"
      >
        ← Kembali
      </Link>

      <h1 className="text-lg sm:text-xl font-bold text-white mb-4">
        {streamData?.title || "Nonton Anime"}
      </h1>

      {/* VIDEO PLAYER FRAME */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        {loading || serverLoading ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800"></div>
            <span>Memuat Player...</span>
          </div>
        ) : iframeUrl ? (
          <iframe
            src={iframeUrl}
            title="Anime Stream Player"
            className="w-full h-full border-0"
            allowFullScreen
            referrerPolicy="no-referrer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            Video tidak ditemukan atau server offline.
          </div>
        )}
      </div>

      {/* TOMBOL ALTERNATIF JIKA EMBED MASIH DIBLOKIR */}
      {iframeUrl && (
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-300">
              Player tidak muncul atau kena limit embed?
            </p>
            <p className="text-[11px] text-slate-500">
              Coba ganti pilihan server di bawah atau tonton langsung di tab baru.
            </p>
          </div>
          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Buka Player di Tab Baru</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* PILIHAN SERVER */}
      {(streamData?.serverList || streamData?.servers) && (
        <div className="mt-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 mb-3">
            Pilih Server Streaming:
          </h3>
          <div className="flex flex-wrap gap-2">
            {(streamData?.serverList || streamData?.servers)?.map((srv, idx) => {
              const srvId = srv?.serverId || srv?.id || srv?.server_id;
              const srvUrl = srv?.url || srv?.iframeUrl;
              const isActive = selectedServerId === srvId;

              return (
                <button
                  key={idx}
                  onClick={() => handleServerChange(srvId, srvUrl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {srv?.name || srv?.title || `Server ${idx + 1}`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}