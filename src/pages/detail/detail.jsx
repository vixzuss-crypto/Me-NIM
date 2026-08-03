import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Tv2, CalendarDays, Clock3,
  Layers, Package, ChevronRight, Play, BookOpen,
} from 'lucide-react';
import { getAnimeDetail } from '../../api/anime/api';
import { fixUrl, fetchWithRetry } from '../../lib/utils';
import AnimeImg from '../../components/AnimeImg';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner    from '../../components/ErrorBanner';

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

export default function Detail() {
  const { animeId } = useParams();
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [showFull, setShowFull] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true);
    setError('');
    setDetail(null);
    setShowFull(false);

    (async () => {
      try {
        const res = await fetchWithRetry(() => getAnimeDetail(animeId));
        if (abortRef.current) return;
        setDetail(res?.data?.data || res?.data);
      } catch (err) {
        if (!abortRef.current) setError('Gagal memuat detail anime. Coba refresh halaman.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();

    return () => { abortRef.current = true; };
  }, [animeId]);

  if (loading) return <main className="max-w-5xl mx-auto px-4 py-6"><LoadingSpinner fullPage /></main>;

  const poster   = fixUrl(detail?.poster || detail?.image || '');
  const score    = detail?.score?.value ?? detail?.score ?? null;
  const synopsis = detail?.synopsis?.paragraphs?.join('\n\n') || detail?.synopsis || '';
  const episodes = (detail?.episodeList || []).slice().reverse(); // ep 1 first
  const genres   = detail?.genreList   || [];
  const batches  = detail?.batchList   || [];

  const statusColor = {
    'Ongoing':   'green',
    'Completed': 'indigo',
  }[detail?.status] ?? 'slate';

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <Link to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400
          hover:text-indigo-300 transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
      </Link>

      <ErrorBanner message={error} />

      {detail && (
        <div className="space-y-6">

          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800/60
            bg-slate-900/60 p-5 sm:p-6">
            {/* BG blur */}
            {poster && (
              <AnimeImg src={poster} title={detail?.title} animeId={animeId} alt="" aria-hidden
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-10 pointer-events-none"
                showTitle={false} />
            )}

            <div className="relative flex gap-5 sm:gap-8">
              {/* Poster */}
              <div className="shrink-0 w-28 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden
                border border-slate-700/60 shadow-2xl shadow-black/60">
                <AnimeImg
                  src={poster}
                  title={detail?.title}
                  animeId={animeId}
                  alt={detail?.title}
                  className="w-full h-full object-cover"
                  iconSize="w-8 h-8"
                  showTitle
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-1">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1">
                  {detail?.title}
                </h1>
                {detail?.japanese && (
                  <p className="text-xs text-slate-500 mb-3">{detail.japanese}</p>
                )}

                {/* Meta pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {score && (
                    <Pill color="amber">
                      <Star className="w-2.5 h-2.5 fill-amber-400 mr-1" />
                      {typeof score === 'number' ? score.toFixed(2) : score}
                      {detail?.score?.users && (
                        <span className="ml-1 opacity-60">
                          ({Number(detail.score.users).toLocaleString()})
                        </span>
                      )}
                    </Pill>
                  )}
                  {detail?.status  && <Pill color={statusColor}>{detail.status}</Pill>}
                  {detail?.type    && <Pill>{detail.type}</Pill>}
                  {detail?.source  && <Pill>{detail.source}</Pill>}
                </div>

                {/* Detail grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
                  {[
                    { icon: CalendarDays, label: 'Tayang',  val: detail?.aired    },
                    { icon: Clock3,       label: 'Durasi',  val: detail?.duration },
                    { icon: Tv2,          label: 'Studio',  val: detail?.studios  },
                    { icon: Layers,       label: 'Season',  val: detail?.season   },
                    { icon: BookOpen,     label: 'Episode', val: detail?.episodes ?? (detail?.episodeList?.length ? `${detail.episodeList.length} ep` : null) },
                  ].filter((r) => r.val).map(({ icon: Icon, label, val }) => (
                    <div key={label} className="flex items-start gap-2 text-slate-400">
                      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-600" />
                      <span className="text-slate-600 shrink-0">{label}:</span>
                      <span className="text-slate-300 line-clamp-1">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Genres */}
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {genres.map((g) => (
                      <Link key={g.genreId} to={`/genres/${g.genreId}`}>
                        <Pill color="indigo">{g.title}</Pill>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── SINOPSIS ──────────────────────────────────────────────────── */}
          {synopsis && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Sinopsis
              </h3>
              <div className={`text-sm text-slate-300 leading-relaxed whitespace-pre-line ${!showFull ? 'line-clamp-4' : ''}`}>
                {synopsis}
              </div>
              {synopsis.length > 200 && (
                <button onClick={() => setShowFull((v) => !v)}
                  className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                  {showFull ? 'Sembunyikan ↑' : 'Selengkapnya ↓'}
                </button>
              )}
            </div>
          )}

          {/* ── EPISODE LIST ──────────────────────────────────────────────── */}
          {episodes.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> Daftar Episode
                <span className="ml-auto text-slate-700 font-normal normal-case tracking-normal">
                  {episodes.length} episode
                </span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2
                max-h-56 overflow-y-auto pr-1
                [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-slate-800
                [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                {episodes.map((ep, i) => (
                  <Link
                    key={ep.episodeId || i}
                    to={`/watch/${ep.episodeId}`}
                    className="flex items-center justify-center px-2 py-2 rounded-xl text-xs font-semibold
                      bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white
                      transition-all border border-slate-700/40 hover:border-indigo-500/60
                      hover:shadow-md hover:shadow-indigo-500/20"
                  >
                    {ep.title ?? i + 1}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── BATCH ─────────────────────────────────────────────────────── */}
          {batches.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Download Batch
              </h3>
              <div className="flex flex-col gap-2">
                {batches.map((b, i) => (
                  <Link
                    key={b.batchId || i}
                    to={`/batch/${b.batchId}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl
                      bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40
                      hover:border-indigo-500/30 transition-all group"
                  >
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors line-clamp-1">
                      {b.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
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