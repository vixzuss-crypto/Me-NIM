import React from 'react';

export default function Top3all({ popularTop3 }) {
  if (!popularTop3 || popularTop3.length !== 3) return null;
  return (
    <div className="bg-slate-900/10 border border-slate-900/40 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base sm:text-lg font-black text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
          🏆 Top 3 Anime Terpopuler
        </h2>
        <a href="/populer-alltime" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-xl">
          Lihat Peringkat &gt;
        </a>
      </div>
      <div className="flex items-end justify-center gap-2 sm:gap-6 max-w-xl mx-auto pt-8 pb-2">
        {/* Juara 2 */}
        <div className="flex flex-col items-center flex-1 transition-transform duration-300 hover:-translate-y-1">
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-lg border border-slate-800">
            <img src={popularTop3[0]?.poster || popularTop3[0]?.image || popularTop3[0]?.thumb} alt={popularTop3[0]?.title} className="w-full h-full object-cover" />
            <span className="absolute top-1.5 left-1.5 bg-slate-300 text-slate-950 text-[10px] font-black h-4 w-4 flex items-center justify-center rounded-full shadow-md">2</span>
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 mt-2 text-center line-clamp-1 w-full">{popularTop3[0]?.title}</h3>
          <div className="w-full bg-gradient-to-t from-slate-700 to-slate-600 h-16 sm:h-20 mt-2 rounded-t-xl shadow-md"></div>
        </div>
        {/* Juara 1 */}
        <div className="flex flex-col items-center flex-1 transition-transform duration-300 hover:-translate-y-2 z-10 scale-105 sm:scale-110">
          <div className="absolute -top-6 text-base animate-bounce">👑</div>
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-xl border-2 border-amber-500">
            <img src={popularTop3[1]?.poster || popularTop3[1]?.image || popularTop3[1]?.thumb} alt={popularTop3[1]?.title} className="w-full h-full object-cover" />
            <span className="absolute top-1.5 left-1.5 bg-amber-400 text-slate-950 text-[10px] font-black h-4 w-4 flex items-center justify-center rounded-full shadow-md">1</span>
          </div>
          <h3 className="text-[10px] font-black text-amber-500 mt-2 text-center line-clamp-1 w-full">{popularTop3[1]?.title}</h3>
          <div className="w-full bg-gradient-to-t from-amber-600 to-amber-500 h-24 sm:h-28 mt-2 rounded-t-xl shadow-md"></div>
        </div>
        {/* Juara 3 */}
        <div className="flex flex-col items-center flex-1 transition-transform duration-300 hover:-translate-y-1">
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-lg border border-slate-800">
            <img src={popularTop3[2]?.poster || popularTop3[2]?.image || popularTop3[2]?.thumb} alt={popularTop3[2]?.title} className="w-full h-full object-cover" />
            <span className="absolute top-1.5 left-1.5 bg-amber-800 text-white text-[10px] font-black h-4 w-4 flex items-center justify-center rounded-full shadow-md">3</span>
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 mt-2 text-center line-clamp-1 w-full">{popularTop3[2]?.title}</h3>
          <div className="w-full bg-gradient-to-t from-amber-900/80 to-amber-800/80 h-12 sm:h-14 mt-2 rounded-t-xl shadow-md"></div>
        </div>
      </div>
    </div>
  );
}
