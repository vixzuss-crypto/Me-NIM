import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── Import video dari folder vidio ──────────────────────────────────────────
// Path: src/vidio/gabimaru.mp4 dll
import gabimaruVid from "../../vidio/gabimaru.mp4";
import leviVid     from "../../vidio/levi.mp4";
import vagabonVid  from "../../vidio/vagabon.mp4";

const VIDEO_LIST = [
  { id: 1, src: gabimaruVid,  label: "Hell's Paradise"   },
  { id: 2, src: leviVid,      label: "Attack on Titan"   },
  { id: 3, src: vagabonVid,   label: "Vagabond"          },
];

const INTERVAL_MS = 5000;

export default function Carousel() {
  const scrollRef   = useRef(null);
  const timerRef    = useRef(null);
  const [current, setCurrent] = useState(0);
  const total = VIDEO_LIST.length;

  // ── Scroll ke slide tertentu ──────────────────────────────────────────────
  const goTo = (idx) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
    setCurrent(idx);
  };

  const prev = () => goTo((current - 1 + total) % total);
  const next = () => goTo((current + 1) % total);

  // ── Auto-advance ──────────────────────────────────────────────────────────
  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const nextIdx = (c + 1) % total;
        // goTo pakai setCurrent dari dalam setInterval — baca ref scroll langsung
        const el = scrollRef.current;
        if (el) el.scrollTo({ left: el.clientWidth * nextIdx, behavior: "smooth" });
        return nextIdx;
      });
    }, INTERVAL_MS);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  // Pause auto-advance saat user hover
  const handleMouseEnter = () => clearInterval(timerRef.current);
  const handleMouseLeave = () => resetTimer();

  return (
    <div
      className="relative w-full group/carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Slide container ──────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex overflow-x-hidden snap-x snap-mandatory rounded-2xl border border-slate-800/60 bg-black shadow-2xl shadow-black/40"
        style={{ scrollBehavior: "smooth" }}
      >
        {VIDEO_LIST.map((vid) => (
          <div
            key={vid.id}
            className="flex-none w-full snap-center relative overflow-hidden"
            style={{ aspectRatio: "21/9", maxHeight: "300px" }}
          >
            <video
              src={vid.src}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay bawah */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

            {/* Label video (pojok bawah kiri) */}
            <span className="absolute bottom-3 left-4 text-[11px] font-bold text-white/70 tracking-widest uppercase select-none">
              {vid.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Tombol Prev / Next ────────────────────────────────────────────── */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10
          w-8 h-8 rounded-full bg-black/50 backdrop-blur border border-white/10
          flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70
          opacity-0 group-hover/carousel:opacity-100 transition-all duration-200"
        aria-label="Slide sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10
          w-8 h-8 rounded-full bg-black/50 backdrop-blur border border-white/10
          flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70
          opacity-0 group-hover/carousel:opacity-100 transition-all duration-200"
        aria-label="Slide berikutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* ── Dot indicators ───────────────────────────────────────────────── */}
      <div className="flex justify-center items-center gap-1.5 mt-3">
        {VIDEO_LIST.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { goTo(idx); resetTimer(); }}
            aria-label={`Slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              current === idx
                ? "w-6 bg-indigo-500"
                : "w-1.5 bg-slate-700 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}