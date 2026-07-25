import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { getSchedule } from '../../api/anime/api';
import AnimeCard from '../../components/AnimeCard';

// Key `key` dipakai di UI (tombol hari, bahasa Indonesia).
// `apiDay` adalah nama hari ASLI yang dipakai API (ternyata bahasa Inggris,
// lihat field `day` di dalam data.days dari response).
const DAYS = [
  { key: 'senin',  label: 'Senin',  apiDay: 'Monday' },
  { key: 'selasa', label: 'Selasa', apiDay: 'Tuesday' },
  { key: 'rabu',   label: 'Rabu',   apiDay: 'Wednesday' },
  { key: 'kamis',  label: 'Kamis',  apiDay: 'Thursday' },
  { key: 'jumat',  label: 'Jumat',  apiDay: 'Friday' },
  { key: 'sabtu',  label: 'Sabtu',  apiDay: 'Saturday' },
  { key: 'minggu', label: 'Minggu', apiDay: 'Sunday' },
];

// ─── Parse "4d 23h 17m" (atau kombinasi sebagiannya) jadi milidetik ─────────
// API cuma ngasih COUNTDOWN relatif ke waktu fetch, bukan jam tayang tetap.
// Return null kalau formatnya gak dikenali sama sekali.
function parseEstimationToMs(estimation) {
  if (!estimation || typeof estimation !== 'string') return null;

  const dMatch = estimation.match(/(\d+)\s*d/i);
  const hMatch = estimation.match(/(\d+)\s*h/i);
  const mMatch = estimation.match(/(\d+)\s*m/i);

  if (!dMatch && !hMatch && !mMatch) return null;

  const days = dMatch ? parseInt(dMatch[1], 10) : 0;
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;

  return ((days * 24 + hours) * 60 + minutes) * 60 * 1000;
}

// ─── Info waktu + badge "Telat" di bawah tiap AnimeCard ─────────────────────
function ScheduleInfo({ anime, fetchedAt, now }) {
  const durationMs = parseEstimationToMs(anime?.estimation);

  if (durationMs == null || !fetchedAt) {
    return null; // format estimation gak dikenali, jangan nampilin info ngasal
  }

  const releaseAt = fetchedAt + durationMs;
  const isLate = now > releaseAt;

  const releaseDate = new Date(releaseAt);
  const dayLabel = releaseDate.toLocaleDateString('id-ID', { weekday: 'long' });
  const timeLabel = releaseDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mt-1 flex items-center justify-between gap-1.5 text-[10px]">
      <span className="inline-flex items-center gap-1 text-slate-500">
        <Clock className="w-3 h-3 shrink-0" />
        {dayLabel}, {timeLabel}
      </span>
      {isLate && (
        <span className="inline-flex items-center gap-1 text-red-400 font-semibold shrink-0">
          <AlertCircle className="w-3 h-3" />
          Telat
        </span>
      )}
    </div>
  );
}

export default function Schedule() {
  const [activeDay, setActiveDay] = useState('senin');
  const [allDays,   setAllDays]   = useState([]); // seluruh data.days (7 hari) dari API
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [fetchedAt, setFetchedAt] = useState(null); // jam device pas data ini di-fetch
  const [now,       setNow]       = useState(() => Date.now());

  // PENTING: endpoint /samehadaku/schedule ternyata SELALU balikin jadwal
  // satu minggu penuh sekaligus di data.days — parameter ?day=... diabaikan
  // backend. Jadi cukup fetch SEKALI saat halaman dibuka, lalu filter per
  // hari dilakukan di frontend (bukan refetch tiap klik tombol hari).
  //
  // fetchedAt dicatat di sini juga, karena field `estimation` dari tiap anime
  // ("4d 23h 17m") adalah COUNTDOWN dihitung relatif ke saat request ini
  // dikirim — bukan jam tayang absolut. Supaya waktu rilis tiap anime bisa
  // dihitung sekali dan tetap akurat selama sesi (fetchedAt + durasi), bukan
  // ikut mundur tiap kali komponen re-render.
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError('');
      try {
        const requestTime = Date.now();
        const res = await getSchedule();
        const days = res?.data?.data?.days;
        setAllDays(Array.isArray(days) ? days : []);
        setFetchedAt(requestTime);
      } catch (err) {
        console.error('Failed to load schedule:', err);
        setError('Gagal memuat jadwal. Coba refresh halaman.');
        setAllDays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []); // <- cuma sekali, bukan [activeDay]

  // Update "now" tiap 30 detik biar badge "Telat" bisa muncul otomatis
  // begitu waktunya lewat, tanpa perlu refresh halaman.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const animeList = useMemo(() => {
    const activeApiDay = DAYS.find((d) => d.key === activeDay)?.apiDay;
    const match = allDays.find(
      (d) => d?.day?.toLowerCase() === activeApiDay?.toLowerCase()
    );
    return Array.isArray(match?.animeList) ? match.animeList : [];
  }, [allDays, activeDay]);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[80vh]">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-indigo-400" />
        <h1 className="text-xl font-bold text-white">Jadwal Rilis Anime</h1>
      </div>

      {/* Filter Hari */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {DAYS.map((day) => (
          <button
            key={day.key}
            onClick={() => setActiveDay(day.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeDay === day.key
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 text-xs text-red-400 font-semibold">{error}</div>
      )}

      {/* List Anime */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800" />
        </div>
      ) : animeList.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm">
          Tidak ada jadwal tayang untuk hari ini.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {animeList.map((anime, i) => (
            <div key={anime.animeId || anime.href || i}>
              <AnimeCard anime={anime} />
              <ScheduleInfo anime={anime} fetchedAt={fetchedAt} now={now} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}