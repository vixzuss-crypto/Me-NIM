import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Tv2, CalendarDays, Clock3, Layers, ChevronRight, Play, BookOpen,
} from 'lucide-react';
import { getAnimeDetailOD } from '../../api/anime/api';
import { fixUrl } from '../../lib/utils';

function Pill({ children, color = 'slate' }) {
  const cls = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    slate:  'bg-slate-800/60 text-slate-400 border-slate-700/40',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }[color];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}>
      {children}
    </span>
  );
}

// Detail anime sumber Otakudesu — halaman baru, terpisah dari /detail/:animeId (Samehadaku)
export default function DetailOD() {
  const { animeId } = useParams();
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError(''); setDetail(null);
    (async () => {
      try {
        const res = await getAnimeDetailOD(animeId);
        if (abortRef.current) return;
        setDetail(res?.data?.data || res?.data);
      } catch {
        if (!abortRef.current) setError('Gagal memuat detail anime.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [animeId]);

  if (loading) return <main className="max-w-5xl mx-auto px-4 py-6"><p className="text-sm text-slate-500">Memuat...</p></main>;

  const poster   = fixUrl(detail?.poster || detail?.image || '');
  const score    = detail?.score?.value ?? detail?.score ?? null;
  const synopsis = detail?.synopsis?.paragraphs?.join('\n\n') || detail?.synopsis || '';
  const episodes = (detail?.episodeList || []).slice().reverse();
  const genres   = detail?.genreList   || [];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <Link to="/movies-od"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400
          hover:text-indigo-300 transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Movies (Otakudesu)
      </Link>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {detail && (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800/60 bg-slate-900/60 p-5 sm:p-6">
            <div className="relative flex gap-5 sm:gap-8">
              <div className="shrink-0 w-28 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden
                border border-slate-700/60 shadow-2xl shadow-black/60">
                {poster && <img src={poster} alt={detail?.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1">{detail?.title}</h1>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {score && (
                    <Pill color="amber"><Star className="w-2.5 h-2.5 fill-amber-400 mr-1" />
                      {typeof score === 'number' ? score.toFixed(2) : score}
                    </Pill>
                  )}
                  {detail?.status && <Pill color="green">{detail.status}</Pill>}
                  {detail?.type   && <Pill>{detail.type}</Pill>}
                </div>
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {genres.map((g, i) => <Pill key={g.genreId || i} color="indigo">{g.title}</Pill>)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {synopsis && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Sinopsis
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{synopsis}</p>
            </div>
          )}

          {episodes.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> Daftar Episode
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {episodes.map((ep, i) => (
                  <Link key={ep.episodeId || i} to={`/watch-od/${ep.episodeId}`}
                    className="flex items-center justify-center px-2 py-2 rounded-xl text-xs font-semibold
                      bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-all
                      border border-slate-700/40 hover:border-indigo-500/60">
                    {ep.title ?? i + 1}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
