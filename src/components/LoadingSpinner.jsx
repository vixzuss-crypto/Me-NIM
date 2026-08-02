export default function LoadingSpinner({ fullPage = false }) {
  return (
    <div className={`flex items-center justify-center ${fullPage ? 'min-h-[40vh]' : 'py-12'}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-500 border-slate-800" />
    </div>
  );
}
