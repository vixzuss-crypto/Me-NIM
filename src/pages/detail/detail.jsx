import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnimeDetail } from "../../api/anime/api";
import {
  ArrowLeft,
  Clapperboard,
  Star,
  Calendar,
  Tv,
  Tag,
  PlayCircle,
  BookOpen,
} from "lucide-react";

export default function DetailAnime() {
  const { animeId } = useParams();
  const [detail, setDetail] = useState(null);
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getAnimeDetail(animeId);
        const data = res?.data?.data || res?.data;
        setRaw(data); // debug
        setDetail(data);
        // DEBUG: lihat semua key yang tersedia
        // console.log("[Detail] Keys:", Object.keys(data || {}));
        // console.log("[Detail] Full data:", JSON.stringify(data, null, 2));
      } catch (err) {
        console.error("[Detail] Gagal load:", err);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [animeId]);

  // ─── Poster: coba semua kemungkinan field name ──────────────────────────
  const posterUrl =
    detail?.poster ||
    detail?.image ||
    detail?.thumbnail ||
    detail?.cover ||
    detail?.coverImage ||
    detail?.img ||
    detail?.imageUrl ||
    null;

  // ─── Title: title bisa string kosong "", fallback ke english lalu japanese
  const title =
    (detail?.title && detail.title.trim() !== "" ? detail.title : null) ||
    detail?.english ||
    detail?.japanese ||
    detail?.name ||
    detail?.animeName ||
    "Judul tidak tersedia";

  // ─── Synopsis ────────────────────────────────────────────────────────────
  const renderSynopsis = () => {
    const syn =
      detail?.synopsis ||
      detail?.description ||
      detail?.desc ||
      detail?.overview ||
      detail?.sinopsis;

    if (!syn) return <p className="italic">Tidak ada sinopsis.</p>;
    if (typeof syn === "string") return <p>{syn}</p>;

    if (typeof syn === "object") {
      const paragraphs = syn?.paragraphs || syn?.text || syn?.content;
      if (Array.isArray(paragraphs) && paragraphs.length > 0) {
        return paragraphs.map((p, i) => (
          <p key={i}>{typeof p === "string" ? p : JSON.stringify(p)}</p>
        ));
      }
      // Kalau object tapi tidak ada paragraphs, coba toString
      const str = syn?.paragraphs?.[0] || JSON.stringify(syn);
      if (str) return <p>{str}</p>;
    }

    return <p className="italic">Tidak ada sinopsis.</p>;
  };

  // ─── Episode list: coba semua kemungkinan field name ────────────────────
  const episodeList =
    detail?.episodeList ||
    detail?.episodes ||
    detail?.episodesList ||
    detail?.episode_list ||
    detail?.listEpisode ||
    detail?.eps ||
    [];

  // ─── Genre list ──────────────────────────────────────────────────────────
  const genreList =
    detail?.genreList ||
    detail?.genres ||
    detail?.genre ||
    [];

  // ─── Info metadata ────────────────────────────────────────────────────────
  // score bisa berupa string "8.5" atau object { value: "6.73", users: "4,380" }
  const rawScore = detail?.score || detail?.rating || detail?.mal_score || null;
  const scoreValue = rawScore
    ? (typeof rawScore === "object" ? rawScore?.value : rawScore)
    : null;
  const scoreUsers = typeof rawScore === "object" ? rawScore?.users : null;

  const status  = detail?.status || detail?.airing || null;
  const type    = detail?.type || detail?.animeType || null;
  const aired   = detail?.aired || detail?.releaseDate || detail?.releasedOn || null;
  const studio  = detail?.studios || detail?.studio || detail?.producer || null;
  const season  = detail?.season || null;
  const duration = detail?.duration || null;

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-400">
        <Tv className="w-10 h-10 text-slate-600" />
        <p className="text-sm">Data anime tidak ditemukan.</p>
        <Link to="/" className="text-xs text-indigo-400 hover:underline">← Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Tombol kembali */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Beranda
      </Link>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur">

        {/* Poster */}
        <div className="shrink-0">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full md:w-52 h-72 object-cover rounded-xl shadow-lg"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-full md:w-52 h-72 bg-slate-800 rounded-xl flex items-center justify-center">
              <Tv className="w-10 h-10 text-slate-600" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <h1 className="text-2xl font-black text-white leading-tight">{title}</h1>

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2">
            {scoreValue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
                <Star className="w-3 h-3" />
                {scoreValue}
                {scoreUsers && <span className="text-yellow-600 font-normal">({scoreUsers})</span>}
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                <Tv className="w-3 h-3" /> {status}
              </span>
            )}
            {type && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                <Clapperboard className="w-3 h-3" /> {type}
              </span>
            )}
            {aired && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-700/60 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3 h-3" /> {aired}
              </span>
            )}
            {season && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-700/60 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3 h-3" /> {season}
              </span>
            )}
            {studio && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-700/60 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-lg">
                <Tv className="w-3 h-3" /> {studio}
              </span>
            )}
          </div>

          {/* Genre */}
          {Array.isArray(genreList) && genreList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {genreList.map((g, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                  <Tag className="w-2.5 h-2.5" />
                  {g?.title || g?.name || g}
                </span>
              ))}
            </div>
          )}

          {/* Sinopsis */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <BookOpen className="w-3 h-3" /> Sinopsis
            </div>
            <div className="text-xs text-slate-400 leading-relaxed space-y-2">
              {renderSynopsis()}
            </div>
          </div>
        </div>
      </div>

      {/* ── DAFTAR EPISODE ───────────────────────────────────────────────── */}
      <div className="mt-10">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Clapperboard className="w-5 h-5 text-indigo-400" />
          Daftar Episode
          {episodeList.length > 0 && (
            <span className="text-xs font-normal text-slate-500">({episodeList.length} episode)</span>
          )}
        </h2>

        {episodeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-600 bg-slate-900/40 rounded-2xl border border-slate-800">
            <PlayCircle className="w-8 h-8" />
            <p className="text-sm">
              Belum ada episode tersedia.
            </p>
            {/* Debug info kalau episode list kosong */}
            {raw && (
              <p className="text-[10px] text-slate-700 max-w-sm text-center">
                Keys tersedia: {Object.keys(raw).join(", ")}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {episodeList.map((ep, idx) => {
              const epId =
                ep?.episodeId ||
                ep?.id ||
                ep?.slug ||
                ep?.endpoint ||
                ep?.episode_id;
              // ep.title bisa berupa number (3, 2, 1) dari API
              const rawEpTitle = ep?.title ?? ep?.name ?? ep?.episode ?? null;
              const epTitle = rawEpTitle !== null && rawEpTitle !== ""
                ? `Episode ${rawEpTitle}`
                : `Episode ${idx + 1}`;

              return (
                <Link
                  key={idx}
                  to={epId ? `/watch/${epId}` : "#"}
                  className="bg-slate-900 hover:bg-indigo-600/20 hover:border-indigo-500 border border-slate-800 p-3 rounded-xl transition-all text-center group flex flex-col items-center gap-1.5"
                >
                  <PlayCircle className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-indigo-300 transition-colors leading-tight">
                    {epTitle}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
