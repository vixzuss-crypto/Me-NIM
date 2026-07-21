import React from 'react';
import { Link } from 'react-router-dom';

export default function AnimeCard({ anime, isNew }) {
  // Ambil ID/slug anime dari data API Samehadaku
  const animeId = anime.animeId || anime.slug || anime.endpointId || anime.endpoint || anime.id;

  return (
    // ✅ Mengarahkan langsung ke /detail/:animeId
    <Link 
      to={`/detail/${animeId}`} 
      className="group flex flex-col bg-slate-900/40 rounded-xl overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-950 rounded-xl">
        <img 
          src={anime.poster || anime.image || anime.thumb} 
          alt={anime.title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
          loading="lazy" 
        />
        {isNew && (
          <span className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">New</span>
        )}
        {anime.episodes && (
          <span className="absolute bottom-2 left-2 text-white text-[11px] font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Eps {anime.episodes}
          </span>
        )}
      </div>
      <div className="pt-2 pb-3 px-1">
        <h3 className="font-bold text-[11px] sm:text-xs text-slate-200 line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {anime.title}
        </h3>
      </div>
    </Link>
  );
}