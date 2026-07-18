import React from 'react';

export default function Navbar() {
  return (
    // Bener-bener polos, cuma block w-full biasa biar dia normal mengalir di HTML
    <nav className="block w-full border-b border-slate-900 bg-slate-950 px-4 sm:px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* LOGO */}
        <h1 className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 cursor-pointer">
          ME-ANIM 🎬
        </h1>

        {/* MENU UTAMA */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-400">
          <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
            Home
          </span>
          <span className="hover:text-slate-200 cursor-pointer transition-colors">
            Daftar Anime
          </span>
          <span className="hover:text-slate-200 cursor-pointer transition-colors">
            Jadwal
          </span>
        </div>

      </div>
    </nav>
  );
}