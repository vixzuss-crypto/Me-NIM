import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, Star, ChevronRight } from 'lucide-react';
import { getSchedule } from '../../api/anime/api';
import { fixUrl, fetchWithRetry } from '../../lib/utils';
import AnimeImg    from '../../components/AnimeImg';
import ErrorBanner from '../../components/ErrorBanner';
import PageHeader  from '../../components/PageHeader';

const DAYS_ID = {
  Monday: 'Senin', Tuesday: 'Selasa', Wednesday: 'Rabu',
  Thursday: 'Kamis', Friday: 'Jumat', Saturday: 'Sabtu', Sunday: 'Minggu',
};
const DAY_KEYS = Object.keys(DAYS_ID);

function parseEstimation(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.match(/(\d+)d\s*(\d+)h\s*(\d+)m/);
  if (!m) return null;
  return (parseInt(m[1]) * 86400 + parseInt(m[2]) * 3600 + parseInt(m[3]) * 60) * 1000;
}

function ReleaseTag({ estimation, fetchedAt }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const ms = parseEstimation(estimation);
    if (!ms || !fetchedAt) { setLabel(''); return; }
    const update = () => {
      const diff = (fetchedAt + ms) - Date.now();
      if (diff <= 0) { setLabel('Sudah rilis'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLabel(h > 0 ? `${h}j ${m}m lagi` : `${m}m lagi`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [estimation, fetchedAt]);

  if (!label) return null;
  const released = label === 'Sudah rilis';
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
      released ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
               : 'bg-slate-800 text-slate-500 border border-slate-700/40'
    }`}>
      <Clock3 className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

function AnimeRow({ anime, fetchedAt }) {
  const poster  = fixUrl(anime?.poster || '');
  const score   = anime?.score ?? null;
  const animeId = anime?.animeId || anime?.slug;

  return (
    <Link to={`/detail/${animeId}`}
      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/60
        border border-slate-800/40 hover:border-indigo-500/30 transition-all group">
      <div className="shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/40">
        <AnimeImg src={poster} title={anime?.title} animeId={anime?.animeId}
          alt={anime?.title} className="w-full h-full object-cover"
          iconSize="w-4 h-4" showTitle={false} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
          {anime?.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {score && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400 font-semibold">
              <Star className="w-2.5 h-2.5 fill-amber-400" />{score}
            </span>
          )}
          {anime?.genres && (
            <span className="text-[10px] text-slate-600 line-clamp-1">{anime.genres}</span>
          )}
          <ReleaseTag estimation={anime?.estimation} fetchedAt={fetchedAt} />
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 shrink-0 transition-colors" />
    </Link>
  );
}

// ── Skeleton Schedule ─────────────────────────────────────────────────────────
function SkeletonSchedule() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Day tabs skeleton */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="shrink-0 h-8 w-16 rounded-lg bg-slate-800/70" />
        ))}
      </div>
      {/* Rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <div className="shrink-0 w-10 h-14 rounded-lg bg-slate-800/70" />
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded bg-slate-800/70" style={{ width: `${55 + (i % 4) * 10}%` }} />
              <div className="h-2.5 w-1/3 rounded bg-slate-800/50" />
            </div>
            <div className="w-4 h-4 rounded bg-slate-800/40 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Schedule() {
  const [schedule,  setSchedule]  = useState({});
  const [activeDay, setActiveDay] = useState('');
  const [fetchedAt, setFetchedAt] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError('');

    (async () => {
      try {
        const res  = await fetchWithRetry(() => getSchedule());
        if (abortRef.current) return;
        const days = res?.data?.data?.days ?? [];
        const map  = {};
        for (const d of days) if (d.day && d.animeList) map[d.day] = d.animeList;
        setSchedule(map);
        setFetchedAt(Date.now());
        const todayEn = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        setActiveDay(map[todayEn] ? todayEn : DAY_KEYS.find((k) => map[k]) ?? '');
      } catch {
        if (!abortRef.current) setError('Gagal memuat jadwal. Coba refresh halaman.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();

    return () => { abortRef.current = true; };
  }, []);

  const animeList = schedule[activeDay] ?? [];
  const todayEn   = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={CalendarDays} title="Jadwal Rilis"
        subtitle="Update setiap minggu · data dari samehadaku.how" />
      <ErrorBanner message={error} />

      {loading ? <SkeletonSchedule /> : (
        <>
          {/* Day tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 mb-5 no-scrollbar">
            {DAY_KEYS.filter((d) => schedule[d]).map((day) => {
              const isToday  = day === todayEn;
              const isActive = day === activeDay;
              return (
                <button key={day} onClick={() => setActiveDay(day)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}>
                  {DAYS_ID[day]}
                  {isToday && (
                    <span className={`ml-1 text-[9px] ${isActive ? 'text-indigo-200' : 'text-indigo-500'}`}>●</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Anime list */}
          <div className="space-y-2">
            {animeList.length === 0
              ? <p className="text-sm text-slate-600 text-center py-10">Tidak ada jadwal untuk hari ini.</p>
              : animeList.map((anime, i) => (
                  <AnimeRow key={anime.animeId || i} anime={anime} fetchedAt={fetchedAt} />
                ))
            }
          </div>
        </>
      )}
    </main>
  );
}