import type { ReactNode } from 'react';

import { Panel } from '../../shared/components/Panel';
import { SimpleTable } from '../../shared/components/SimpleTable';

type WatchlistPanelFrameProps = {
  title: string;
  description: string;
  filterRow?: ReactNode;
  summaryChips: Array<{ label: string; value: ReactNode }>;
  tableHeaders: string[];
  tableRows: ReactNode[][];
  emptyState?: {
    title: string;
    description: string;
  };
};

export function WatchlistPanelFrame({
  title,
  description,
  filterRow,
  summaryChips,
  tableHeaders,
  tableRows,
  emptyState,
}: WatchlistPanelFrameProps) {
  return (
    <Panel title={title} description={description}>
      {filterRow}
      <div
        className="dashboard-summary-strip dashboard-summary-strip-dense"
        style={{ ['--summary-chip-count' as string]: String(summaryChips.length) }}
      >
        {summaryChips.map((chip) => (
          <div key={chip.label} className="dashboard-summary-chip">
            <span className="dashboard-summary-label">{chip.label}</span>
            <strong>{chip.value}</strong>
          </div>
        ))}
      </div>
      <SimpleTable headers={tableHeaders} rows={tableRows} emptyState={emptyState} />
    </Panel>
  );
}
