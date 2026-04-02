import { DashboardKpiCard } from './BankingDashboard';

type ConsoleKpiItem = {
  icon: string;
  label: string;
  value: string;
  trend: string;
  trendDirection?: 'up' | 'down' | 'neutral';
};

export function ConsoleKpiStrip({ items }: { items: ConsoleKpiItem[] }) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <DashboardKpiCard
          key={item.label}
          icon={item.icon}
          label={item.label}
          value={item.value}
          trend={item.trend}
          trendDirection={item.trendDirection}
        />
      ))}
    </section>
  );
}
