import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trophy, ArrowRight } from 'lucide-react';
import { fixUrl } from '../lib/utils';

// ─── 3D depth offset ──────────────────────────────────────────────────────────
const D = 14;

// ─── Per-rank config (dari Figma AI — podium 3D proper) ──────────────────────
const RANK_CONFIG = {
  1: {
    capW: 102, capH: 11, bodyH: 84,
    bodyTopW: 74, bodyBotW: 55,
    posterW: 102,
    colors: { top: '#F7CC1E', front: '#E8AC00', side: '#B88000', bodyFront: '#DFA000', bodySide: '#A87000', text: '#1a0e00' },
    glow: 'rgba(245,195,0,0.55)',
  },
  2: {
    capW: 86, capH: 11, bodyH: 58,
    bodyTopW: 62, bodyBotW: 46,
    posterW: 86,
    colors: { top: '#D4D9DF', front: '#B0B8C0', side: '#8A9399', bodyFront: '#ACB6BE', bodySide: '#7E8D95', text: '#1a1a1a' },
    glow: 'rgba(150,175,190,0.35)',
  },
  3: {
    capW: 76, capH: 11, bodyH: 38,
    bodyTopW: 55, bodyBotW: 40,
    posterW: 76,
    colors: { top: '#D08B3C', front: '#B26A18', side: '#8A4E0A', bodyFront: '#A86016', bodySide: '#7A4408', text: '#fff5cc' },
    glow: 'rgba(185,115,30,0.45)',
  },
};

const pts = (coords) => coords.map(([x, y]) => `${x},${y}`).join(' ');

// ─── 3D Podium SVG (Figma AI design) ─────────────────────────────────────────
function PodiumSVG({ rank }) {
  const { capW, capH, bodyH, bodyTopW, bodyBotW, colors, glow } = RANK_CONFIG[rank];

  const svgW = D + capW;
  const svgH = D + capH + bodyH;

  const capTop   = pts([[D + capW, D], [D, D], [0, 0], [capW, 0]]);
  const capFront = pts([[D, D], [D + capW, D], [D + capW, D + capH], [D, D + capH]]);
  const capSide  = pts([[D, D], [0, 0], [0, capH], [D, D + capH]]);

  const y1 = D + capH;
  const y2 = D + capH + bodyH;

  const bodyFront = pts([[D, y1], [D + bodyTopW, y1], [D + bodyBotW, y2], [D, y2]]);
  const bodySide  = pts([[D, y1], [0, capH], [0, capH + bodyH], [D, y2]]);

  const label   = rank === 1 ? '1ST' : rank === 2 ? '2ND' : '3RD';
  const textX   = D + (bodyTopW + bodyBotW) / 4;
  const textY   = y1 + bodyH / 2;
  const fontSize = rank === 1 ? 19 : rank === 2 ? 15 : 13;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} width={svgW} height={svgH}
      style={{ display: 'block', filter: `drop-shadow(0 8px 18px ${glow})` }}>
      <polygon points={bodySide}  fill={colors.bodySide}  />
      <polygon points={capSide}   fill={colors.side}      />
      <polygon points={capTop}    fill={colors.top}       />
      <polygon points={capFront}  fill={colors.front}     />
      <polygon points={bodyFront} fill={colors.bodyFront} />
      <text x={textX} y={textY} textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill={colors.text} letterSpacing="1">
        {label}
      </text>
    </svg>
  );
}

// ─── Podium Card ──────────────────────────────────────────────────────────────
function PodiumCard({ anime, rank }) {
  const cfg     = RANK_CONFIG[rank];
  const animeId = anime?.animeId || anime?.slug;
  const poster  = fixUrl(anime?.poster || anime?.image || '');
  const score   = anime?.score?.value ?? anime?.score ?? null;
  const posterW = cfg.posterW;
  const posterH = Math.round(posterW * 4 / 3);

  const ringClass = {
    1: 'ring-2 ring-amber-400 shadow-amber-400/30',
    2: 'ring-2 ring-slate-400 shadow-slate-400/20',
    3: 'ring-2 ring-amber-700 shadow-amber-700/20',
  }[rank];

  const badgeClass = {
    1: 'bg-amber-400 text-slate-950',
    2: 'bg-slate-300 text-slate-950',
    3: 'bg-amber-700 text-white',
  }[rank];

  return (
    <div className="flex flex-col items-center">
      <Link to={`/detail/${animeId}`}
        className={`relative rounded-xl overflow-hidden ${ringClass} shadow-lg
          hover:scale-105 transition-transform duration-300 block`}
        style={{ width: posterW, height: posterH, flexShrink: 0 }}>
        {poster
          ? <img src={poster} alt={anime?.title} loading="lazy" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <span className="text-slate-600 text-4xl font-black">{rank}</span>
            </div>
        }
        {score && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5
            bg-black/75 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-400">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            {typeof score === 'number' ? score.toFixed(1) : score}
          </div>
        )}
        <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-md flex items-center justify-center
          text-[9px] font-black shadow ${badgeClass}`}>{rank}</div>
      </Link>

      <PodiumSVG rank={rank} />

      <p className="mt-2 text-[10px] sm:text-[11px] font-semibold text-slate-300
        text-center line-clamp-2 leading-tight"
        style={{ width: cfg.posterW + D }}>
        {anime?.title ?? '—'}
      </p>
    </div>
  );
}

// ─── Mini Rank Card ───────────────────────────────────────────────────────────
function MiniRankCard({ anime, rank }) {
  const animeId = anime?.animeId || anime?.slug;
  const poster  = fixUrl(anime?.poster || anime?.image || '');
  const score   = anime?.score?.value ?? anime?.score ?? null;

  return (
    <Link to={`/detail/${animeId}`} className="flex-shrink-0 w-24 group">
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden
        bg-slate-900 border border-slate-800/60
        group-hover:border-indigo-500/40 group-hover:shadow-lg group-hover:shadow-indigo-500/10
        transition-all duration-300">
        {poster
          ? <img src={poster} alt={anime?.title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full bg-slate-800" />
        }
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md
          text-[9px] font-black bg-slate-900/85 text-slate-400 border border-slate-700/60">
          #{rank}
        </div>
        {score && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5
            bg-black/75 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-400">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            {typeof score === 'number' ? score.toFixed(1) : score}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      <p className="mt-1.5 text-[10px] font-semibold text-slate-400 group-hover:text-white
        line-clamp-2 leading-tight text-center transition-colors">
        {anime?.title ?? '—'}
      </p>
    </Link>
  );
}

// ─── Infinite Auto-Scroll Strip ─────────────────────────────────────────────────
// Pakai ResizeObserver untuk ukur halfWidth setelah layout selesai.
// List di-tile minimal 3x lebar container agar tidak pernah ada gap.
function InfiniteScrollStrip({ miniList }) {
  const trackRef = useRef(null);
  const animRef  = useRef(null);
  const posRef   = useRef(0);
  const pauseRef = useRef(false);
  const halfRef  = useRef(0);
  const SPEED    = 0.6; // px per frame ≈ 36px/s @ 60fps

  useEffect(() => {
    if (!miniList?.length) return;
    const track = trackRef.current;
    if (!track) return;

    // Reset state
    if (animRef.current) cancelAnimationFrame(animRef.current);
    posRef.current  = 0;
    halfRef.current = 0;
    track.style.transform = 'translateX(0px)';

    const ro = new ResizeObserver(() => {
      const sw = track.scrollWidth;
      if (sw > 0 && halfRef.current === 0) {
        // half = lebar SATU set (bukan dua)
        // track berisi [set A, set B] — half = sw / 2
        halfRef.current = sw / 2;
        ro.disconnect();

        const tick = () => {
          if (!pauseRef.current) {
            posRef.current += SPEED;
            if (posRef.current >= halfRef.current) {
              posRef.current -= halfRef.current; // seamless reset
            }
            track.style.transform = `translateX(-${posRef.current}px)`;
          }
          animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
      }
    });
    ro.observe(track);

    return () => {
      ro.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [miniList]);

  if (!miniList?.length) return null;

  // Tile list minimal sampai ada ≥ 14 item per set agar tidak ada gap
  // di viewport sempit (7 card × 2 = 14 cukup untuk cover semua lebar layar)
  const MIN_ITEMS = 14;
  let tiled = [...miniList];
  while (tiled.length < MIN_ITEMS) tiled = [...tiled, ...miniList];

  // Doubled untuk seamless loop
  const doubled = [...tiled, ...tiled];

  return (
    <div
      className="overflow-hidden rounded-xl select-none"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
      onMouseEnter={() => { pauseRef.current = true;  }}
      onMouseLeave={() => { pauseRef.current = false; }}
    >
      <div
        ref={trackRef}
        style={{ display: 'flex', gap: '8px', width: 'max-content', willChange: 'transform' }}
      >
        {doubled.map((anime, i) => (
          <MiniRankCard
            key={`${anime?.animeId ?? i}-${i}`}
            anime={anime}
            rank={(i % miniList.length) + 4}
          />
        ))}
      </div>
    </div>
  );
}


// ─── Main Export ──────────────────────────────────────────────────────────────
export default function PodiumSection({ topAnime = [] }) {
  if (topAnime.length < 3) return null;

  const [rank1, rank2, rank3] = topAnime;

  const podiumOrder = [
    { anime: rank2, rank: 2 },
    { anime: rank1, rank: 1 },
    { anime: rank3, rank: 3 },
  ].filter((d) => d.anime);

  const miniList = topAnime.slice(3, 10);

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-bold text-white">Top Anime Populer</h2>
        </div>
        <Link to="/populer"
          className="inline-flex items-center gap-1 text-xs font-semibold
            text-indigo-400 hover:text-indigo-300 transition-colors">
          Lihat semua <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Podium 1–3 ── */}
      <div className="flex justify-center gap-4 sm:gap-8 mb-8 items-end">
        {podiumOrder.map(({ anime, rank }) => (
          <PodiumCard key={rank} anime={anime} rank={rank} />
        ))}
      </div>

      {/* ── Infinite auto-scroll strip rank 4–10 ── */}
      {miniList.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Peringkat 4 – {Math.min(10, 3 + miniList.length)}
          </p>
          <InfiniteScrollStrip miniList={miniList} />
        </div>
      )}
    </section>
  );
}