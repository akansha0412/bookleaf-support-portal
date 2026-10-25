export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = 'slate',
}: {
  label: string;
  value: number;
  detail: string;
  icon: string;
  tone?: 'slate' | 'red' | 'amber';
}) {
  const iconStyle = {
    slate: 'bg-slate-100 text-slate-700',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-700',
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg font-semibold ${iconStyle}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
