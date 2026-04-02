import { useEffect, useState } from 'react';

import { useAppClient } from '../../app/AppContext';
import type {
  BranchCommandCenterSummary,
  NotificationCategory,
  PerformancePeriod,
  RolePerformanceItem,
  RolePerformanceOverview,
} from '../../core/api/contracts';
import type { AdminSession } from '../../core/session';
import { KpiCard } from '../../shared/components/KpiCard';
import { Panel } from '../../shared/components/Panel';
import { SimpleTable } from '../../shared/components/SimpleTable';
import { ScopedOperationsSummaryPanel } from '../shared-layout/ScopedOperationsSummaryPanel';
import { LoanWorkflowWatchlistPanel } from '../loan-monitoring/LoanWorkflowWatchlistPanel';
import { KycWatchlistPanel } from '../manager-pages/KycWatchlistPanel';
import { AutopayOperationsPanel } from '../notifications/AutopayOperationsPanel';
import { NotificationWatchlistPanel } from '../notifications/NotificationWatchlistPanel';
import { SupportWatchlistPanel } from '../support/SupportWatchlistPanel';

type BranchManagerDashboardPageProps = {
  session: AdminSession;
  onOpenLoan?: (loanId: string) => void;
  onOpenAutopayOperation?: (operationId: string) => void;
  onOpenSupportChat?: (conversationId: string) => void;
  onOpenNotificationCategory?: (category: NotificationCategory) => void;
  onOpenKycMember?: (memberId: string) => void;
};

const periods: PerformancePeriod[] = ['today', 'week', 'month', 'year'];

export function BranchManagerDashboardPage({
  session,
  onOpenLoan,
  onOpenAutopayOperation,
  onOpenSupportChat,
  onOpenNotificationCategory,
  onOpenKycMember,
}: BranchManagerDashboardPageProps) {
  const { dashboardApi } = useAppClient();
  const [period, setPeriod] = useState<PerformancePeriod>('week');
  const [overview, setOverview] = useState<RolePerformanceOverview | null>(null);
  const [topEmployees, setTopEmployees] = useState<RolePerformanceItem[]>([]);
  const [watchlist, setWatchlist] = useState<RolePerformanceItem[]>([]);
  const [commandCenter, setCommandCenter] =
    useState<BranchCommandCenterSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      dashboardApi.getBranchCommandCenter(session.role, period),
      dashboardApi.getBranchEmployeeSummary(session.role, period),
      dashboardApi.getBranchTopEmployees(session.role, period),
      dashboardApi.getBranchEmployeeWatchlist(session.role, period),
    ]).then(([commandCenterResult, summaryResult, topResult, watchlistResult]) => {
      if (cancelled) {
        return;
      }

      setCommandCenter(commandCenterResult);
      setOverview(summaryResult);
      setTopEmployees(topResult);
      setWatchlist(watchlistResult);
    });

    return () => {
      cancelled = true;
    };
  }, [dashboardApi, period, session.role]);

  const items = overview?.items ?? [];
  const kpis = overview?.kpis;

  return (
    <div className="page-stack">
      <section className="hero hero-branch">
        <div>
          <p className="eyebrow">Branch</p>
          <h2>Branch Command Center</h2>
          <p className="muted">
            Branch visibility across employee performance, work queues,
            KYC completion, loans handled, and daily alerts.
          </p>
        </div>
        <div className="hero-badges">
          <span className="badge badge-info">Branch operations</span>
          <span className="badge">Branch-only visibility</span>
        </div>
      </section>

      <div className="form-grid">
        <label className="field-stack">
          <span>Time Filter</span>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as PerformancePeriod)}
          >
            {periods.map((item) => (
              <option key={item} value={item}>
                {formatLabel(item)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="kpi-grid">
        <KpiCard
          title="Employee Performance"
          value={commandCenter ? commandCenter.employeePerformance.items.length.toLocaleString() : 'Not available'}
          caption="Tracked branch staff"
        />
        <KpiCard
          title="Loans Handled"
          value={commandCenter ? commandCenter.loansHandled.toLocaleString() : 'Not available'}
          caption="Branch lending workload"
        />
        <KpiCard
          title="KYC Completed"
          value={commandCenter ? commandCenter.kycCompleted.toLocaleString() : 'Not available'}
          caption="Completed onboarding reviews"
        />
        <KpiCard
          title="Support Handled"
          value={commandCenter ? commandCenter.supportHandled.toLocaleString() : 'Not available'}
          caption="Resolved support load"
        />
        <KpiCard
          title="Pending Tasks"
          value={commandCenter ? commandCenter.pendingTasks.toLocaleString() : 'Not available'}
          caption="Current branch backlog"
        />
      </div>

      <Panel
        title="Branch Command Center"
        description="Branch-level workforce, support, KYC, and lending visibility."
      >
        <SimpleTable
          headers={['Signal', 'Current value', 'Notes']}
          rows={[
            [
              'Top performer',
              topEmployees[0]?.name ?? 'Not available',
              topEmployees[0] ? `${topEmployees[0].score} score` : 'No employee data',
            ],
            [
              'Loans handled',
              commandCenter ? commandCenter.loansHandled.toLocaleString() : 'Not available',
              commandCenter ? `${commandCenter.pendingTasks} pending tasks` : 'Not available',
            ],
            [
              'Support handled',
              commandCenter ? commandCenter.supportHandled.toLocaleString() : 'Not available',
              commandCenter ? `${commandCenter.kycCompleted} KYC completed` : 'Not available',
            ],
          ]}
        />
      </Panel>

      <ScopedOperationsSummaryPanel
        role={session.role}
        title="Operations Summary"
        description="Branch triage snapshot across loans, support, KYC, AutoPay, and reminder exceptions."
        onOpenAutopayOperation={onOpenAutopayOperation}
        onOpenKycMember={onOpenKycMember}
        onOpenLoan={onOpenLoan}
        onOpenNotificationCategory={onOpenNotificationCategory}
        onOpenSupportChat={onOpenSupportChat}
      />

      <div className="two-column-grid">
        <Panel
          title="Employee Performance"
          description="Branch employee leaderboard with workload, handled cases, and turnaround context."
        >
          <SimpleTable
            headers={['Employee', 'Role', 'Customers', 'Loans', 'Tasks', 'Score']}
            rows={items.map((item) => [
              item.name,
              formatLabel(item.role ?? 'staff'),
              item.customersHelped.toLocaleString(),
              item.loansHandled.toLocaleString(),
              item.pendingTasks.toLocaleString(),
              `${item.score} (${formatLabel(item.status)})`,
            ])}
            emptyState={{
              title: 'No employee performance rows',
              description: 'Employee workload and score data will appear here when branch performance records are available.',
            }}
          />
        </Panel>

        <Panel
          title="Work Queue"
          description="Manager view of turnaround time, approvals, and branch task pressure."
        >
          <SimpleTable
            headers={['Signal', 'Current Value', 'Status']}
            rows={[
              [
                'Top employee',
                topEmployees[0]
                  ? `${topEmployees[0].name} (${topEmployees[0].score})`
                  : 'No top employee yet',
                topEmployees[0] ? formatLabel(topEmployees[0].status) : 'Not available',
              ],
              [
                'Needs support',
                watchlist[0]
                  ? `${watchlist[0].name} (${watchlist[0].score})`
                  : 'No watchlist employee',
                watchlist[0] ? formatLabel(watchlist[0].status) : 'Not available',
              ],
              [
                'Avg handling time',
                kpis ? `${kpis.avgHandlingTime} min` : 'Not available',
                kpis && kpis.avgHandlingTime <= 20 ? 'Healthy' : 'Watch',
              ],
              [
                'Pending approvals',
                kpis ? kpis.pendingApprovals.toLocaleString() : 'Not available',
                'Queued',
              ],
            ]}
          />
        </Panel>
      </div>

      <div className="two-column-grid">
        <LoanWorkflowWatchlistPanel
          title="Loan Workflow Watchlist"
          description="Branch-scoped loan cases that need correction follow-up, escalation, or approval attention."
          emptyActionLabel="Continue branch review"
          onOpenLoan={onOpenLoan}
        />

        <SupportWatchlistPanel
          title="Support Watchlist"
          description="Branch-scoped support chats with unread, escalated, or high-priority signals."
          onOpenChat={onOpenSupportChat}
        />
      </div>

      <div className="two-column-grid">
        <NotificationWatchlistPanel
          title="Notification Watchlist"
          description="Branch-scoped reminder work, delivery failures, and insurance alert signals."
          onOpenCategory={onOpenNotificationCategory}
        />

        <AutopayOperationsPanel
          role={session.role}
          title="AutoPay Operations"
          description="Branch-scoped standing instructions that need monitoring, re-enable follow-up, or reminder support."
          onOpenCategory={onOpenNotificationCategory}
          onOpenOperation={onOpenAutopayOperation}
        />
      </div>

      <div className="two-column-grid">
        <KycWatchlistPanel
          role={session.role}
          title="KYC Watchlist"
          description="Branch-scoped onboarding review cases that need review, correction, or approval."
          onOpenMember={onOpenKycMember}
        />
      </div>

      <div className="two-column-grid">
        <Panel title="Top Employees" description="Best-performing staff members in the branch.">
          <SimpleTable
            headers={['Employee', 'KYC', 'Support', 'Transactions', 'Score']}
            rows={
              topEmployees.length > 0
                ? topEmployees.map((item) => [
                    item.name,
                    item.kycCompleted.toLocaleString(),
                    item.supportResolved.toLocaleString(),
                    item.transactionsProcessed.toLocaleString(),
                    item.score.toLocaleString(),
                  ])
                : [['Loading', '...', '...', '...', '...']]
            }
          />
        </Panel>

        <Panel title="Employees Needing Support" description="Staff below target or carrying excess backlog.">
          <p className="muted">
            Prioritize employees whose delays are affecting KYC closure, queue handling, or secure payment readiness for customers.
          </p>
          <SimpleTable
            headers={['Employee', 'Pending', 'Escalated', 'Response', 'Action']}
            rows={
              watchlist.length > 0
                ? watchlist.map((item) => [
                    item.name,
                    item.pendingTasks.toLocaleString(),
                    item.loansEscalated.toLocaleString(),
                    `${item.responseTimeMinutes} min`,
                    item.status === 'needs_support'
                      ? 'Assign supervisor review'
                      : 'Coach on SLA recovery',
                  ])
                : [['Loading', '...', '...', '...', '...']]
            }
          />
        </Panel>
      </div>
    </div>
  );
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
