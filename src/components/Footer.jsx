import { Link } from 'react-router-dom';
import { Tv2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Tv2 className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-black tracking-tight text-white">
              ME<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">ANIM</span>
            </span>
          </div>

          {/* Credit */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="text-[11px] text-slate-700">© 2026 MEANIM · Tonton sepuasnya</p>
            <p className="text-[11px] text-slate-700">Data dari samehadaku.how</p>
          </div>
        </div>
      </div>
    </footer>
  );
}