import { DashboardAlertCard } from './BankingDashboard';

type CriticalActionItem = {
  label: string;
  value: string;
  tone: 'red' | 'orange' | 'amber';
  onClick?: () => void;
};

export function CriticalActionStrip({ items }: { items: CriticalActionItem[] }) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <DashboardAlertCard
          key={item.label}
          label={item.label}
          value={item.value}
          tone={item.tone}
          onClick={item.onClick}
        />
      ))}
    </section>
  );
}
