import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tv2, List, CalendarDays, X, Menu } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glass bar */}
      <nav className="w-full bg-[#030712]/80 backdrop-blur-md border-b border-slate-800/60 px-4 sm:px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <Tv2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black tracking-tight text-white">
              ME<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">ANIM</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isHome
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/populer-alltime"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                location.pathname === '/populer-alltime'
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Peringkat
            </Link>
            <span className="text-slate-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-not-allowed opacity-50">
              <CalendarDays className="w-3.5 h-3.5" />
              Jadwal
            </span>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden bg-[#030712]/95 backdrop-blur border-b border-slate-800/60 px-4 py-3 flex flex-col gap-1 text-xs font-semibold">
          <Link to="/" onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
            Beranda
          </Link>
          <Link to="/populer-alltime" onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5">
            <List className="w-3.5 h-3.5" /> Peringkat
          </Link>
          <span className="px-3 py-2 rounded-lg text-slate-500 flex items-center gap-1.5 opacity-50">
            <CalendarDays className="w-3.5 h-3.5" /> Jadwal
          </span>
        </div>
      )}
    </header>
  );
}