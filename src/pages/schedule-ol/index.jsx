import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { getScheduleOL } from '../../api/anime/api';
import { fixUrl } from '../../lib/utils';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBanner    from '../../components/ErrorBanner';
import PageHeader     from '../../components/PageHeader';

const DAYS_ID = {
  Senin: 'Senin', Selasa: 'Selasa', Rabu: 'Rabu',
  Kamis: 'Kamis', Jumat: 'Jumat', Sabtu: 'Sabtu', Minggu: 'Minggu',
  Monday: 'Senin', Tuesday: 'Selasa', Wednesday: 'Rabu',
  Thursday: 'Kamis', Friday: 'Jumat', Saturday: 'Sabtu', Sunday: 'Minggu',
};

// Jadwal rilis Oploverz — sumber terpisah dari /jadwal (Samehadaku)
export default function ScheduleOL() {
  const [scheduleList, setScheduleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError('');
    (async () => {
      try {
        const res = await getScheduleOL();
        if (abortRef.current) return;
        const data = res?.data?.data || res?.data;
        setScheduleList(data?.scheduleList ?? (Array.isArray(data) ? data : []));
      } catch {
        if (!abortRef.current) setError('Gagal memuat jadwal dari Oploverz.');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={CalendarDays} title="Jadwal Tayang (Oploverz)" subtitle="Jadwal rilis anime per hari dari Oploverz" />
      <ErrorBanner message={error} />
      {loading ? <LoadingSpinner fullPage /> : (
        <div className="space-y-8">
          {scheduleList.map((dayObj, di) => {
            const dayLabel = DAYS_ID[dayObj?.day] ?? dayObj?.day ?? `Hari ${di + 1}`;
            const animes   = dayObj?.animeList ?? [];
            return (
              <section key={dayLabel}>
                <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> {dayLabel}
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                  {animes.map((anime, i) => {
                    const slug   = anime?.slug || anime?.href?.split('/').filter(Boolean).pop();
                    const poster = fixUrl(anime?.poster || anime?.image || '');
                    return (
                      <Link key={slug || i} to={`/detail-ol/${slug}`}
                        className="group flex flex-col gap-1.5 focus:outline-none">
                        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900
                          border border-slate-800/60 group-hover:border-indigo-500/40 transition-all">
                          {poster && (
                            <img src={poster} alt={anime?.title} loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          )}
                          {anime?.episode && (
                            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px]
                              font-bold bg-black/70 text-slate-300 backdrop-blur-sm">
                              {anime.episode}
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white line-clamp-2 leading-tight px-0.5">
                          {anime?.title ?? '—'}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {scheduleList.length === 0 && !error && (
            <p className="text-sm text-slate-600 text-center py-10">Tidak ada data jadwal.</p>
          )}
        </div>
      )}
    </main>
  );
}