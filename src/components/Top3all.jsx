import { Link } from 'react-router-dom';
import { Trophy, Medal, Crown } from 'lucide-react';

const PODIUM = [
  { pos: 2, height: 'h-16 sm:h-20', barColor: 'from-slate-600 to-slate-500', textColor: 'text-slate-300', borderColor: 'border-slate-600', Icon: Medal, iconColor: 'text-slate-300' },
  { pos: 1, height: 'h-24 sm:h-28', barColor: 'from-amber-600 to-amber-400', textColor: 'text-amber-400', borderColor: 'border-amber-500', Icon: Crown, iconColor: 'text-amber-400' },
  { pos: 3, height: 'h-12 sm:h-14', barColor: 'from-amber-900 to-amber-800', textColor: 'text-amber-700', borderColor: 'border-amber-800', Icon: Trophy, iconColor: 'text-amber-700' },
];

export default function Top3all({ popularTop3 }) {
  if (!popularTop3 || popularTop3.length !== 3) return null;

  // susunan yang masuk: [juara2, juara1, juara3]
  const ordered = [
    { ...popularTop3[0], ...PODIUM[0] },
    { ...popularTop3[1], ...PODIUM[1] },
    { ...popularTop3[2], ...PODIUM[2] },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-900/30 p-5 sm:p-6">
      {/* subtle radial glow behind podium */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full bg-indigo-500/5 blur-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-black text-slate-100 tracking-wide uppercase">Top 3 Terpopuler</h2>
        </div>
        <Link
          to="/populer-alltime"
          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-all"
        >
          Lihat semua →
        </Link>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 sm:gap-5 max-w-sm mx-auto">
        {ordered.map((item, i) => {
          const animeId = item.animeId || item.slug || item.endpointId || item.id;
          const isFirst = item.pos === 1;
          return (
            <div
              key={i}
              className={`flex flex-col items-center flex-1 transition-transform duration-300 ${isFirst ? 'hover:-translate-y-2' : 'hover:-translate-y-1'}`}
            >
              {/* Crown / icon */}
              <item.Icon className={`w-4 h-4 mb-1.5 ${item.iconColor} ${isFirst ? 'w-5 h-5' : ''}`} />

              {/* Poster */}
              <Link to={`/detail/${animeId}`} className="w-full">
                <div className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-lg border ${item.borderColor} ${isFirst ? 'shadow-amber-500/20 scale-105' : ''}`}>
                  <img
                    src={item.poster || item.image || item.thumb}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {/* Position badge */}
                  <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shadow
                    ${item.pos === 1 ? 'bg-amber-400 text-slate-950' :
                      item.pos === 2 ? 'bg-slate-300 text-slate-950' :
                      'bg-amber-800 text-white'}`}
                  >
                    {item.pos}
                  </div>
                </div>
              </Link>

              {/* Title */}
              <p className={`text-[10px] font-bold mt-2 text-center line-clamp-1 w-full ${item.textColor}`}>
                {item.title}
              </p>

              {/* Bar */}
              <div className={`w-full bg-gradient-to-t ${item.barColor} ${item.height} mt-2 rounded-t-xl`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}