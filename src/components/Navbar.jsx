import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Tv2, Menu, X, ChevronDown,
  Layers, CheckCircle2, Film, AlignLeft, Package,
  List, CalendarDays, Home, LayoutGrid, LogIn, Radio,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../firebase/firebase';
import LoginModal from './LoginModal';

// ── Data ──────────────────────────────────────────────────────────────────────
// section: null = divider label, to = link item
const BROWSE_ITEMS = [
  { section: 'Samehadaku' },
  { to: '/ongoing',    label: 'Ongoing',   icon: Layers,       desc: 'Anime yang sedang tayang' },
  { to: '/completed',  label: 'Completed', icon: CheckCircle2, desc: 'Anime yang sudah tamat'   },
  { to: '/movies',     label: 'Movies',    icon: Film,         desc: 'Film & OVA'               },
  { to: '/browse',     label: 'A–Z List',  icon: AlignLeft,    desc: 'Semua anime A–Z'          },
  { to: '/batch',      label: 'Batch',     icon: Package,      desc: 'Download batch'           },
  { section: 'Otakudesu' },
  { to: '/movies-od',  label: 'Movies OD', icon: Film,         desc: 'Movie dari Otakudesu'     },
  { section: 'Kuramanime' },
  { to: '/explore-km', label: 'Jelajah KM', icon: LayoutGrid,  desc: 'By studio/season/tipe (eksperimental)' },
  { section: 'Oploverz' },
  { to: '/home-ol',    label: 'Home OL',   icon: LayoutDashboard, desc: 'Populer & rilis terbaru Oploverz' },
  { to: '/browse-ol',  label: 'Browse OL', icon: AlignLeft,    desc: 'Direktori A–Z Oploverz'   },
  { to: '/jadwal-ol',  label: 'Jadwal OL', icon: Radio,        desc: 'Jadwal tayang Oploverz'   },
];

const NAV_LINKS = [
  { to: '/',       label: 'Beranda',  icon: Home,        exact: true },
  { to: '/populer', label: 'Peringkat', icon: List        },
  { to: '/jadwal',  label: 'Jadwal',  icon: CalendarDays },
];

function isActive(pathname, to, exact = false) {
  return exact ? pathname === to : pathname.startsWith(to);
}

export default function Navbar() {
  const location   = useLocation();
  const { user } = useAuth();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [browseOpen,   setBrowseOpen]   = useState(false);
  const [loginOpen,    setLoginOpen]    = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropRef     = useRef(null);
  const timerRef    = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setBrowseOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
    setBrowseOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error('[Auth] Logout gagal:', err);
    }
  };

  // Hover intent — small delay to avoid accidental close
  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setBrowseOpen(true);
  };
  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setBrowseOpen(false), 150);
  };

  const browseActive = BROWSE_ITEMS.some((l) => location.pathname.startsWith(l.to));

  return (
    <>
      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[#030712]/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-1">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-3 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500
              flex items-center justify-center shadow-lg shadow-indigo-500/25
              group-hover:shadow-indigo-500/50 transition-shadow duration-200">
              <Tv2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black tracking-tight text-white hidden sm:block">
              ME<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">ANIM</span>
            </span>
          </Link>

          {/* ── Desktop Nav ─────────────────────────────────────────────────── */}
          <nav className="hidden sm:flex items-center gap-0.5 flex-1">

            {/* Browse Megamenu — KIRI, paling pertama */}
            <div
              ref={dropRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setBrowseOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  transition-all duration-150 select-none ${
                  browseActive || browseOpen
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/8'
                }`}
              >
                Browse
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${browseOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown — fixed width, no overlap isu */}
              {browseOpen && (
                <div
                  className="absolute top-[calc(100%+8px)] left-0 w-56
                    bg-[#0d1117] border border-white/8 rounded-2xl shadow-2xl shadow-black/70
                    overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Gradient top accent */}
                  <div className="h-px w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-indigo-500/0" />

                  <div className="p-1.5">
                    {BROWSE_ITEMS.map((item, idx) => {
                      // Section divider label
                      if (item.section) {
                        return (
                          <p key={`sec-${idx}`}
                            className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 pt-2.5 pb-1 first:pt-1">
                            {item.section}
                          </p>
                        );
                      }
                      const { to, label, icon: Icon, desc } = item;
                      const active = location.pathname.startsWith(to);
                      return (
                        <Link
                          key={to}
                          to={to}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-100 group ${
                            active
                              ? 'bg-indigo-600/20 text-indigo-300'
                              : 'text-slate-300 hover:bg-white/6 hover:text-white'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            active ? 'bg-indigo-600/30' : 'bg-white/5 group-hover:bg-white/10'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold leading-none mb-0.5">{label}</p>
                            <p className="text-[10px] text-slate-500 leading-none truncate">{desc}</p>
                          </div>
                          {active && (
                            <div className="ml-auto w-1 h-4 rounded-full bg-indigo-400 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-indigo-500/0 via-white/5 to-indigo-500/0" />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Core nav links */}
            {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  transition-all duration-150 ${
                  isActive(location.pathname, to, exact)
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/8'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Auth + Mobile toggle ────────────────────────────────────────── */}
          <div className="ml-auto flex items-center gap-2">

            {user ? (
              <div ref={userMenuRef} className="relative shrink-0">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-1.5 sm:pr-2.5 py-1 rounded-full
                    hover:bg-white/8 transition-colors"
                >
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Akun'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full ring-1 ring-white/10"
                  />
                  <span className="hidden md:block text-xs font-semibold text-slate-300 max-w-[100px] truncate">
                    {user.displayName}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute top-[calc(100%+8px)] right-0 w-48
                      bg-[#0d1117] border border-white/8 rounded-2xl shadow-2xl shadow-black/70
                      overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="px-3.5 py-3 border-b border-white/6">
                      <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-red-400
                        hover:bg-white/6 transition-colors"
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white
                  shadow-lg shadow-indigo-600/20 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="sm:hidden text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/8"
              aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </header>

      {/* ── MOBILE MENU — rendered outside header agar tidak clipped ───────── */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-40 pt-14" onClick={() => setMenuOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="relative bg-[#0d1117] border-b border-white/8 px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Browse section */}
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">Browse</p>
            <div className="mb-3">
              {BROWSE_ITEMS.map((item, idx) => {
                if (item.section) {
                  return (
                    <p key={`msec-${idx}`}
                      className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-2 pt-2 pb-1 first:pt-0">
                      {item.section}
                    </p>
                  );
                }
                const { to, label, icon: Icon } = item;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mb-1 ${
                      location.pathname.startsWith(to)
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                        : 'bg-white/4 text-slate-300 hover:bg-white/8 hover:text-white border border-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="h-px w-full bg-white/6 mb-3" />

            {/* Core links */}
            <div className="flex flex-col gap-0.5">
              {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive(location.pathname, to, exact)
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/6 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Login Modal ─────────────────────────────────────────────────────── */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}