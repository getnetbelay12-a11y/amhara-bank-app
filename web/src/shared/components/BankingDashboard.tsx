import type { PropsWithChildren, ReactNode } from 'react';

export function DashboardPage({ children }: PropsWithChildren) {
  return <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 pb-4">{children}</div>;
}

export function DashboardGrid({
  children,
  cols = 2,
}: PropsWithChildren<{ cols?: 1 | 2 }>) {
  return (
    <div
      className={
        cols === 2
          ? 'grid grid-cols-1 gap-4 xl:grid-cols-2'
          : 'grid grid-cols-1 gap-4'
      }
    >
      {children}
    </div>
  );
}

export function DashboardCard({
  title,
  description,
  action,
  children,
}: PropsWithChildren<{
  title: string;
  description?: string;
  action?: ReactNode;
}>) {
  return (
    <section className="rounded-[20px] border border-slate-200/90 bg-white p-4 shadow-[0_14px_30px_rgba(15,47,63,0.05)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900 md:text-lg">{title}</h2>
          {description ? (
            <p className="mt-1 text-[13px] leading-5 text-slate-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function DashboardDataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-slate-200/90 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-[13px] [&_tbody_td:first-child]:font-semibold [&_tbody_td:first-child]:text-slate-900">
          <thead className="bg-slate-50/90">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50/70">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2.5 align-middle text-slate-600">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardKpiCard({
  icon,
  label,
  value,
  trend,
  trendDirection = 'neutral',
}: {
  icon: string;
  label: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}) {
  return (
    <article className="rounded-[20px] border border-slate-200/90 bg-white p-4 shadow-[0_12px_24px_rgba(15,47,63,0.045)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-extrabold tracking-[0.14em] text-blue-900">
          {icon}
        </span>
        {trend ? (
          <span
            className={
              trendDirection === 'up'
                ? 'inline-flex min-h-6 items-center rounded-full bg-emerald-50 px-2.5 text-[10px] font-bold text-emerald-700'
                : trendDirection === 'down'
                  ? 'inline-flex min-h-6 items-center rounded-full bg-red-50 px-2.5 text-[10px] font-bold text-red-700'
                  : 'inline-flex min-h-6 items-center rounded-full bg-blue-50 px-2.5 text-[10px] font-bold text-blue-800'
            }
          >
            {trendDirection === 'down' ? 'v' : trendDirection === 'up' ? '^' : '-'} {trend}
          </span>
        ) : null}
      </div>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <strong className="mt-2 block text-[1.7rem] font-semibold tracking-tight text-slate-900">
        {value}
      </strong>
    </article>
  );
}

export function DashboardAlertCard({
  label,
  value,
  tone,
  onClick,
}: {
  label: string;
  value: string;
  tone: 'red' | 'orange' | 'amber' | 'blue';
  onClick?: () => void;
}) {
  const toneClass =
    tone === 'red'
      ? 'from-red-500 to-red-700 shadow-[0_16px_28px_rgba(185,28,28,0.18)]'
      : tone === 'orange'
        ? 'from-orange-400 to-orange-600 shadow-[0_16px_28px_rgba(194,65,12,0.18)]'
        : tone === 'blue'
          ? 'from-blue-500 to-blue-700 shadow-[0_16px_28px_rgba(29,78,216,0.18)]'
          : 'from-amber-400 to-amber-600 shadow-[0_16px_28px_rgba(180,83,9,0.18)]';

  return (
    <button
      type="button"
      className={`rounded-[20px] bg-gradient-to-br ${toneClass} p-4 text-left text-white`}
      onClick={onClick}
    >
      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
        {label}
      </span>
      <strong className="mt-2 block text-[1.8rem] font-semibold tracking-tight">{value}</strong>
    </button>
  );
}

export function DashboardSectionCard(props: PropsWithChildren<{ title: string; description?: string; action?: ReactNode }>) {
  return <DashboardCard {...props} />;
}

export function DashboardMetricRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-slate-50 px-3.5 py-3">
      <div>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>
        {note ? <span className="mt-1 block text-[13px] text-slate-500">{note}</span> : null}
      </div>
      <strong className="text-sm font-semibold text-slate-900 md:text-base">{value}</strong>
    </div>
  );
}

export function DashboardProgressRow({
  label,
  value,
  progress,
  tone = 'blue',
}: {
  label: string;
  value: string;
  progress: number;
  tone?: 'blue' | 'teal' | 'amber' | 'red' | 'green';
}) {
  const toneClass =
    tone === 'teal'
      ? 'from-cyan-500 to-teal-500'
      : tone === 'amber'
        ? 'from-amber-400 to-orange-500'
        : tone === 'red'
          ? 'from-red-500 to-red-600'
          : tone === 'green'
            ? 'from-emerald-500 to-green-500'
            : 'from-blue-500 to-blue-700';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-slate-600">{label}</span>
        <strong className="text-[13px] font-semibold text-slate-900">{value}</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${toneClass}`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

export function DashboardPipelineCard({
  title,
  description,
  stages,
}: {
  title: string;
  description?: string;
  stages: Array<{ label: string; value: string; progress: number; tone?: 'blue' | 'teal' | 'amber' | 'red' | 'green' }>;
}) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="flex flex-col gap-3">
        {stages.map((stage) => (
          <DashboardProgressRow
            key={stage.label}
            label={stage.label}
            value={stage.value}
            progress={stage.progress}
            tone={stage.tone}
          />
        ))}
      </div>
    </DashboardCard>
  );
}

export function DashboardTableCard({
  title,
  description,
  headers,
  rows,
}: {
  title: string;
  description?: string;
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <DashboardCard title={title} description={description}>
      <DashboardDataTable headers={headers} rows={rows} />
    </DashboardCard>
  );
}

export function EmptyStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center">
      <strong className="block text-base font-semibold text-slate-900">{title}</strong>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function QuickActionChip({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm"
    >
      {label}
    </button>
  );
}

export function FloatingChatButton({
  unreadCount,
  isOpen,
  onClick,
}: {
  unreadCount: number;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-expanded={isOpen}
      aria-label="Open support chat panel"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_36px_rgba(29,78,216,0.28)] ring-4 ring-white/80"
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true">💬</span>
      <span>Chat</span>
      {unreadCount ? (
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-bold text-blue-700">
          {unreadCount}
        </span>
      ) : null}
    </button>
  );
}
