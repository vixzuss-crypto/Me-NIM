import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Tv2, CalendarDays, Clock3, Layers, ChevronRight, Play, BookOpen,
} from 'lucide-react';
import { getAnimeDetailOL } from '../../api/anime/api';
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

function MetaRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-xs text-slate-400">
      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-600" />
      <span className="text-slate-500 shrink-0">{label}:</span>
      <span className="text-slate-300">{value}</span>
    </div>
  );
}

// Detail anime sumber Oploverz — terpisah dari /detail/:animeId (Samehadaku)
export default function DetailOL() {
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
        const res = await getAnimeDetailOL(animeId);
        if (abortRef.current) return;
        const d = res?.data?.data?.details || res?.data?.data || res?.data;
        setDetail(d);
      } catch {
        if (!abortRef.current) setError('Gagal memuat detail anime dari Oploverz.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [animeId]);

  if (loading) return <main className="max-w-5xl mx-auto px-4 py-6"><p className="text-sm text-slate-500">Memuat...</p></main>;

  const poster   = fixUrl(detail?.poster || detail?.image || '');
  const synopsis = detail?.synopsis?.paragraphs?.join('\n\n') || detail?.synopsis || '';
  const episodes = (detail?.episodeList || []).slice().reverse();
  const genres   = detail?.genres ?? [];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <Link to="/browse-ol"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400
          hover:text-indigo-300 transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Browse (Oploverz)
      </Link>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {detail && (
        <div className="space-y-6">
          {/* Hero card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800/60 bg-slate-900/60 p-5 sm:p-6">
            <div className="relative flex gap-5 sm:gap-8">
              <div className="shrink-0 w-28 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden
                border border-slate-700/60 shadow-2xl shadow-black/60">
                {poster && <img src={poster} alt={detail?.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1">{detail?.title}</h1>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {detail?.rating && (
                    <Pill color="amber">
                      <Star className="w-2.5 h-2.5 fill-amber-400 mr-1" />
                      {detail.rating}
                    </Pill>
                  )}
                  {detail?.status && <Pill color="green">{detail.status}</Pill>}
                  {detail?.type   && <Pill>{detail.type}</Pill>}
                </div>

                <div className="space-y-1.5">
                  <MetaRow icon={Tv2}          label="Studio"    value={detail?.studio} />
                  <MetaRow icon={CalendarDays} label="Rilis"     value={detail?.releasedOn} />
                  <MetaRow icon={Clock3}       label="Durasi"    value={detail?.duration} />
                  <MetaRow icon={Layers}       label="Season"    value={detail?.season} />
                </div>

                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {genres.map((g, i) => <Pill key={g || i} color="indigo">{g}</Pill>)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          {synopsis && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Sinopsis
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{synopsis}</p>
            </div>
          )}

          {/* Episode list */}
          {episodes.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> Daftar Episode
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {episodes.map((ep, i) => {
                  // episodeId bisa berupa slug dari href Oploverz
                  const epSlug = ep?.href?.split('/').filter(Boolean).pop() ?? ep?.episodeId ?? i;
                  return (
                    <Link key={epSlug} to={`/watch-ol/${epSlug}`}
                      className="flex items-center justify-center px-2 py-2 rounded-xl text-xs font-semibold
                        bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-all
                        border border-slate-700/40 hover:border-indigo-500/60 text-center leading-tight">
                      {ep?.episode ?? ep?.title ?? i + 1}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}