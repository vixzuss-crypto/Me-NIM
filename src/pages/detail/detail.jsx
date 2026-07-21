import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnimeDetail } from "../../api/anime/api";

export default function DetailAnime() {
  const { animeId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getAnimeDetail(animeId);
        setDetail(res?.data?.data || res?.data);
      } catch (err) {
        console.error("Gagal load detail anime:", err);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [animeId]);

  // Helper function aman untuk merender sinopsis agar tidak bikin React crash
  const renderSynopsis = () => {
    if (!detail?.synopsis) return <p>Tidak ada sinopsis.</p>;

    // Jika synopsis berbentuk string biasa
    if (typeof detail.synopsis === "string") {
      return <p>{detail.synopsis}</p>;
    }

    // Jika synopsis berbentuk Object { paragraphs, connections }
    if (typeof detail.synopsis === "object") {
      const paragraphs = detail.synopsis?.paragraphs;

      if (Array.isArray(paragraphs) && paragraphs.length > 0) {
        return paragraphs.map((paragraph, i) => (
          <p key={i}>
            {/* Pastikan isi paragraph berupa string/text, bukan object */}
            {typeof paragraph === "string"
              ? paragraph
              : typeof paragraph === "object"
              ? JSON.stringify(paragraph)
              : String(paragraph)}
          </p>
        ));
      }
    }

    return <p>Tidak ada sinopsis.</p>;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800"></div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="text-xs font-semibold text-indigo-400 hover:underline mb-6 inline-block"
      >
        ← Kembali ke Beranda
      </Link>

      {/* HEADER ANIME & INFO */}
      <div className="flex flex-col md:flex-row gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur">
        <img
          src={detail?.poster || detail?.image}
          alt={detail?.title || "Poster"}
          className="w-full md:w-56 h-80 object-cover rounded-xl shadow-lg shrink-0"
        />
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-black text-white">{detail?.title}</h1>
          
          {/* SINOPSIS AMAN */}
          <div className="text-xs text-slate-400 leading-relaxed space-y-2">
            {renderSynopsis()}
          </div>
        </div>
      </div>

      {/* LIST EPISODE */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          🎬 Daftar Episode
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {detail?.episodeList?.map((ep, idx) => (
            <Link
              key={idx}
              to={`/watch/${ep.episodeId || ep.slug || ep.endpoint}`}
              className="bg-slate-900 hover:bg-indigo-600/20 hover:border-indigo-500 border border-slate-800 p-3 rounded-xl transition-all text-center group"
            >
              <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 block">
                {ep.title || `Episode ${ep.episode || idx + 1}`}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}