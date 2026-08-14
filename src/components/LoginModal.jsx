import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { signInWithGoogle } from '../firebase/firebase';

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" {...props}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16 4 9.1 8.6 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.5 35 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.1 39.4 16 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.6 5.6C40.9 36.9 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

/**
 * Popup login. Tombol "Masuk dengan Google" dan link "Daftar sekarang"
 * sama-sama manggil signInWithGoogle() — di Firebase Auth, provider Google
 * otomatis BUAT akun baru kalau emailnya belum pernah login, atau langsung
 * masuk kalau sudah pernah. Jadi gak perlu form daftar terpisah.
 */
export default function LoginModal({ open, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      // User nutup popup Google sendiri — jangan tampilkan sebagai error
      if (err?.code === 'auth/popup-closed-by-user') return;
      console.error('[Auth] Login gagal:', err);
      setError('Login gagal, coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm bg-[#0d1117] border border-white/8 rounded-2xl
          shadow-2xl shadow-black/70 p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors
            p-1 rounded-lg hover:bg-white/8"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500
            flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-3">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <h2 className="text-base font-bold text-white">Masuk ke akun kamu</h2>
          <p className="text-xs text-slate-500 mt-1">Simpan favorit &amp; riwayat nontonmu</p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100
            disabled:opacity-60 disabled:cursor-not-allowed text-slate-800 text-sm font-semibold
            px-4 py-2.5 rounded-xl transition-colors"
        >
          <GoogleIcon />
          {busy ? 'Menghubungkan...' : 'Masuk dengan Google'}
        </button>

        {error && (
          <p className="text-xs text-red-400 text-center mt-3">{error}</p>
        )}

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-[10px] text-slate-600 uppercase tracking-wider">atau</span>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        <p className="text-xs text-slate-500 text-center">
          Belum punya akun?{' '}
          <button
            onClick={handleGoogle}
            disabled={busy}
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Daftar sekarang
          </button>
        </p>

        <p className="text-[10px] text-slate-600 text-center mt-4 leading-relaxed">
          Akun langsung dibuat lewat Google saat pertama kali masuk.
        </p>
      </div>
    </div>,
    document.body
  );
}