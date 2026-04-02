type CriticalActionItem = {
  label: string;
  value: string;
  tone: 'red' | 'orange' | 'amber';
  onClick?: () => void;
};

export function CriticalActionStrip({ items }: { items: CriticalActionItem[] }) {
  return (
    <section className="critical-action-strip">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`critical-alert-chip ${item.tone}`}
          onClick={item.onClick}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </button>
      ))}
    </section>
  );
}
