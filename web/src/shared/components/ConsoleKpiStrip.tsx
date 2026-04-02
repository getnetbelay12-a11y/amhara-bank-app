type ConsoleKpiItem = {
  icon: string;
  label: string;
  value: string;
  trend: string;
  trendDirection?: 'up' | 'down' | 'neutral';
};

export function ConsoleKpiStrip({ items }: { items: ConsoleKpiItem[] }) {
  return (
    <section className="console-kpi-strip">
      {items.map((item) => (
        <article key={item.label} className="console-kpi-card">
          <div className="console-kpi-card-top">
            <span className="console-kpi-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span
              className={`console-kpi-trend ${item.trendDirection ?? 'neutral'}`}
            >
              {item.trendDirection === 'down'
                ? 'v'
                : item.trendDirection === 'up'
                  ? '^'
                  : '-'}{' '}
              {item.trend}
            </span>
          </div>
          <strong>{item.value}</strong>
          <span className="dashboard-summary-label">{item.label}</span>
        </article>
      ))}
    </section>
  );
}

