export default function PageHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          {Icon && <Icon className="w-5 h-5 text-indigo-400 shrink-0" />}
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h1>
        </div>
        {subtitle && <p className="text-xs text-slate-500 ml-7">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
