import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { getAnimeDetailKM } from '../../api/anime/api';
import { fixUrl } from '../../lib/utils';

// Detail anime sumber Kuramanime — eksperimental, lihat peringatan 403 di halaman Jelajah.
export default function DetailKM() {
  const { animeId, animeSlug } = useParams();
  const [detail,  setDetail]  = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError(''); setDetail(null);
    (async () => {
      try {
        const res = await getAnimeDetailKM(animeId, animeSlug);
        if (abortRef.current) return;
        setDetail(res?.data?.data || res?.data);
      } catch {
        if (!abortRef.current) setError('Gagal memuat detail — kemungkinan Kuramanime lagi nge-block (403).');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [animeId, animeSlug]);

  const poster = fixUrl(detail?.poster || detail?.image || '');
  const score  = detail?.score?.value ?? detail?.score ?? null;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <Link to="/explore-km" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Jelajah
      </Link>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">Memuat...</p> : detail && (
        <div className="flex gap-5 sm:gap-8 p-5 sm:p-6 rounded-2xl border border-slate-800/60 bg-slate-900/60">
          <div className="shrink-0 w-28 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden border border-slate-700/60">
            {poster && <img src={poster} alt={detail?.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0 py-1">
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">{detail?.title}</h1>
            {score && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 mb-3">
                <Star className="w-3 h-3 fill-amber-400" /> {score}
              </span>
            )}
            {detail?.synopsis && <p className="text-sm text-slate-300 leading-relaxed">{detail.synopsis}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
