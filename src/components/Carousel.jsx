import { useRef, useEffect, useState } from "react";

// Import video dari folder vidio
import gabimaruVid from "../../vidio/gabimaru.mp4";
import leviVid from "../../vidio/levi.mp4";
import vagabonVid from "../../vidio/vagabon.mp4";

export default function Carousel() {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const videoList = [
    { id: 1, src: gabimaruVid },
    { id: 2, src: leviVid },
    { id: 3, src: vagabonVid },
  ];

  // Auto-scroll tiap 4 detik
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % videoList.length;
      scrollToSlide(nextIndex);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const scrollToSlide = (index) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const slideWidth = container.clientWidth;
      container.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2">
      {/* MAIN CAROUSEL CONTAINER (CLEAN VIDEO ONLY) */}
      <div
        ref={scrollRef}
        className="flex overflow-x-hidden snap-x snap-mandatory rounded-2xl border border-slate-800 bg-black shadow-xl"
      >
        {videoList.map((vid) => (
          <div
            key={vid.id}
            className="flex-none w-full snap-center relative aspect-[16/9] sm:aspect-[21/9] max-h-[220px] sm:max-h-[280px] bg-black overflow-hidden"
          >
            {/* Background Video tanpa overlay teks/tombol */}
            <video
              src={vid.src}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* INDIKATOR TITIK (DOTS) DI BAWAH CARD */}
      <div className="flex justify-center items-center gap-1.5 mt-3">
        {videoList.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToSlide(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? "w-6 bg-indigo-500"
                : "w-2 bg-slate-700/80 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
