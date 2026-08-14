import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, LayoutGrid } from 'lucide-react';
import { getKuramanimeProperties, getKuramanimeAnimeByProperty } from '../../api/anime/api';
import { fixUrl } from '../../lib/utils';
import PageHeader from '../../components/PageHeader';

const PROPERTY_TYPES = ['genre', 'season', 'studio', 'type', 'quality', 'source', 'country'];

// PERINGATAN: /kuramanime/* pernah balikin 403 Forbidden waktu dites (kemungkinan
// Cloudflare situs Kuramanime nge-block IP datacenter Vercel). Kalau semua request
// di halaman ini gagal terus, itu bukan bug di kode — situsnya yang nge-block.
function KMWarning() {
  return (
    <div className="mb-5 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-200/80 leading-relaxed">
        Fitur ini eksperimental — sumber Kuramanime pernah kasih error <strong>403 Forbidden</strong> saat dites.
        Kalau data gak muncul sama sekali, kemungkinan situsnya lagi nge-block server, bukan salah kode.
      </p>
    </div>
  );
}

// ── Pilih tipe properti (genre/season/studio/dll) ────────────────────────────
export function ExploreKMTypes() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader icon={LayoutGrid} title="Jelajah Kuramanime" subtitle="Browse berdasarkan studio, season, tipe, dll" />
      <KMWarning />
      <div className="flex flex-wrap gap-2.5">
        {PROPERTY_TYPES.map((t) => (
          <Link key={t} to={`/explore-km/${t}`}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300
              hover:bg-indigo-600 hover:text-white border border-slate-800 hover:border-indigo-500 transition-all capitalize">
            {t}
          </Link>
        ))}
      </div>
    </main>
  );
}

// ── Daftar nilai utk 1 tipe properti (misal: daftar semua studio) ────────────
export function ExploreKMPropertyList() {
  const { propertyType } = useParams();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError('');
    (async () => {
      try {
        const res = await getKuramanimeProperties(propertyType);
        if (abortRef.current) return;
        const d = res?.data?.data;
        setItems(Array.isArray(d) ? d : (d?.properties ?? d?.list ?? []));
      } catch {
        if (!abortRef.current) setError('Gagal memuat data — kemungkinan Kuramanime lagi nge-block (403).');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [propertyType]);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <Link to="/explore-km" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-5">
        <ArrowLeft className="w-3.5 h-3.5" /> Semua Tipe
      </Link>
      <PageHeader icon={LayoutGrid} title={`Kuramanime: ${propertyType}`} subtitle="Pilih salah satu untuk lihat animenya" />
      <KMWarning />
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">Memuat...</p> : (
        <div className="flex flex-wrap gap-2.5">
          {items.length === 0 && !error && <p className="text-sm text-slate-600">Tidak ada data.</p>}
          {items.map((it, i) => {
            const id    = it?.id ?? it?.slug ?? it;
            const label = it?.name ?? it?.title ?? String(it);
            return (
              <Link key={id || i} to={`/explore-km/${propertyType}/${id}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300
                  hover:bg-indigo-600 hover:text-white border border-slate-800 hover:border-indigo-500 transition-all">
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

// ── Anime hasil filter properti tertentu (misal: studio = MAPPA) ─────────────
export function ExploreKMAnimeList() {
  const { propertyType, propertyId } = useParams();
  const navigate = useNavigate();
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true); setError('');
    (async () => {
      try {
        const res = await getKuramanimeAnimeByProperty(propertyType, propertyId);
        if (abortRef.current) return;
        const d = res?.data?.data;
        setList(Array.isArray(d) ? d : (d?.animeList ?? []));
      } catch {
        if (!abortRef.current) setError('Gagal memuat anime — kemungkinan Kuramanime lagi nge-block (403).');
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    })();
    return () => { abortRef.current = true; };
  }, [propertyType, propertyId]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Link to={`/explore-km/${propertyType}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-5">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali
      </Link>
      <KMWarning />
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">Memuat...</p> : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {list.length === 0 && !error && <p className="text-sm text-slate-600 col-span-full">Tidak ada anime ditemukan.</p>}
          {list.map((anime, i) => {
            const poster = fixUrl(anime?.poster || anime?.image || '');
            const slug   = anime?.animeSlug || anime?.slug;
            const id     = anime?.animeId || anime?.id;
            return (
              <button key={id || i}
                onClick={() => id && slug && navigate(`/detail-km/${id}/${slug}`)}
                className="group flex flex-col gap-1.5 text-left">
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800/60">
                  {poster && <img src={poster} alt={anime?.title} loading="lazy" className="w-full h-full object-cover" />}
                </div>
                <p className="text-[11px] font-semibold text-slate-300 line-clamp-2 leading-tight px-0.5">{anime?.title ?? '—'}</p>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
