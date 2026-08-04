import SkeletonCard from './SkeletonCard';

// SkeletonGrid — grid skeleton dengan jumlah kartu yang bisa dikonfigurasi
export default function SkeletonGrid({ count = 18 }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}