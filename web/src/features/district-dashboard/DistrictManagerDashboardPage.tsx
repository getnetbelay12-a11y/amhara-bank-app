import { useEffect, useState } from 'react';

import { useAppClient } from '../../app/AppContext';
import type {
  DistrictCommandCenterSummary,
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

type DistrictManagerDashboardPageProps = {
  session: AdminSession;
  onOpenLoan?: (loanId: string) => void;
  onOpenAutopayOperation?: (operationId: string) => void;
  onOpenSupportChat?: (conversationId: string) => void;
  onOpenNotificationCategory?: (category: NotificationCategory) => void;
  onOpenKycMember?: (memberId: string) => void;
};

const periods: PerformancePeriod[] = ['today', 'week', 'month', 'year'];

export function DistrictManagerDashboardPage({
  session,
  onOpenLoan,
  onOpenAutopayOperation,
  onOpenSupportChat,
  onOpenNotificationCategory,
  onOpenKycMember,
}: DistrictManagerDashboardPageProps) {
  const { dashboardApi } = useAppClient();
  const [period, setPeriod] = useState<PerformancePeriod>('week');
  const [overview, setOverview] = useState<RolePerformanceOverview | null>(null);
  const [topBranches, setTopBranches] = useState<RolePerformanceItem[]>([]);
  const [watchlist, setWatchlist] = useState<RolePerformanceItem[]>([]);
  const [commandCenter, setCommandCenter] =
    useState<DistrictCommandCenterSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      dashboardApi.getDistrictCommandCenter(session.role, period),
      dashboardApi.getDistrictBranchSummary(session.role, period),
      dashboardApi.getDistrictTopBranches(session.role, period),
      dashboardApi.getDistrictBranchWatchlist(session.role, period),
    ]).then(([commandCenterResult, summaryResult, topResult, watchlistResult]) => {
      if (cancelled) {
        return;
      }

      setCommandCenter(commandCenterResult);
      setOverview(summaryResult);
      setTopBranches(topResult);
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
      <section className="hero hero-district">
        <div>
          <p className="eyebrow">District</p>
          <h2>District Command Center</h2>
          <p className="muted">
            District visibility across branches, loan approvals, KYC completion,
            branch ranking, and support workload.
          </p>
        </div>
        <div className="hero-badges">
          <span className="badge badge-info">District oversight</span>
          <span className="badge">District-only visibility</span>
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
          title="Branch List"
          value={commandCenter ? commandCenter.branchList.length.toLocaleString() : 'Not available'}
          caption="District branch coverage"
        />
        <KpiCard
          title="Loan Approvals"
          value={
            commandCenter
              ? commandCenter.loanApprovalsPerBranch
                  .reduce((sum, item) => sum + item.approvedCount, 0)
                  .toLocaleString()
              : 'Not available'
          }
          caption="Approved across branches"
        />
        <KpiCard
          title="KYC Completion"
          value={commandCenter ? `${commandCenter.kycCompletion.completionRate}%` : 'Not available'}
          caption="District onboarding throughput"
        />
        <KpiCard
          title="Support Metrics"
          value={
            commandCenter
              ? `${commandCenter.supportMetrics.openChats} open / ${commandCenter.supportMetrics.resolvedChats} resolved`
              : 'Not available'
          }
          caption="District support overview"
        />
      </div>

      <Panel
        title="District Command Center"
        description="Branch ranking, KYC completion, support workload, and district alerts."
      >
        <SimpleTable
          headers={['Signal', 'Current value', 'Notes']}
          rows={[
            [
              'Top branch',
              commandCenter?.branchRanking[0]?.name ?? 'Not available',
              commandCenter?.branchRanking[0]
                ? `${commandCenter.branchRanking[0].score} score`
                : 'No ranked branch',
            ],
            [
              'KYC completion',
              commandCenter ? `${commandCenter.kycCompletion.completed} completed` : 'Not available',
              commandCenter
                ? `${commandCenter.kycCompletion.pendingReview} in review • ${commandCenter.kycCompletion.needsAction} need action`
                : 'Not available',
            ],
            [
              'Escalated support',
              commandCenter
                ? commandCenter.supportMetrics.escalatedChats.toLocaleString()
                : 'Not available',
              commandCenter
                ? `${commandCenter.supportMetrics.assignedChats} assigned chats`
                : 'Not available',
            ],
          ]}
        />
      </Panel>

      <ScopedOperationsSummaryPanel
        role={session.role}
        title="Operations Summary"
        description="District triage snapshot across loans, support, KYC, AutoPay, and reminder exceptions."
        onOpenAutopayOperation={onOpenAutopayOperation}
        onOpenKycMember={onOpenKycMember}
        onOpenLoan={onOpenLoan}
        onOpenNotificationCategory={onOpenNotificationCategory}
        onOpenSupportChat={onOpenSupportChat}
      />

      <div className="two-column-grid">
        <Panel
          title="Branch Ranking"
          description="District branch totals for loans, service, KYC, and pending queue pressure."
        >
          <SimpleTable
            headers={['Branch', 'Customers', 'Loans', 'KYC', 'Pending', 'Score']}
            rows={items.map((item) => [
              item.name,
              item.customersHelped.toLocaleString(),
              item.loansHandled.toLocaleString(),
              item.kycCompleted.toLocaleString(),
              item.pendingTasks.toLocaleString(),
              `${item.score} (${formatLabel(item.status)})`,
            ])}
            emptyState={{
              title: 'No branch performance rows',
              description: 'Branch performance totals will appear here when district data is available.',
            }}
          />
        </Panel>

        <Panel
          title="District Summary KPIs"
          description="Operational indicators that need district manager attention."
        >
          <SimpleTable
            headers={['Signal', 'Current Value', 'Status']}
            rows={[
              [
                'Top branch',
                topBranches[0] ? `${topBranches[0].name} (${topBranches[0].score})` : 'No top branch yet',
                topBranches[0] ? formatLabel(topBranches[0].status) : 'Not available',
              ],
              [
                'Weak branch',
                watchlist[0] ? `${watchlist[0].name} (${watchlist[0].score})` : 'No watchlist branch',
                watchlist[0] ? formatLabel(watchlist[0].status) : 'Not available',
              ],
              [
                'Pending approvals',
                kpis ? kpis.pendingApprovals.toLocaleString() : 'Not available',
                'Queued',
              ],
              [
                'Transactions processed',
                kpis ? kpis.transactionsProcessed.toLocaleString() : 'Not available',
                'Tracked',
              ],
            ]}
          />
        </Panel>
      </div>

      <div className="two-column-grid">
        <LoanWorkflowWatchlistPanel
          title="Loan Workflow Watchlist"
          description="District-scoped loan cases that need escalation handling, correction follow-up, or approval review."
          emptyActionLabel="Complete district review"
          onOpenLoan={onOpenLoan}
        />

        <SupportWatchlistPanel
          title="Support Watchlist"
          description="District-scoped support chats that are unread, escalated, or at SLA risk."
          onOpenChat={onOpenSupportChat}
        />
      </div>

      <div className="two-column-grid">
        <NotificationWatchlistPanel
          title="Notification Watchlist"
          description="District-scoped reminder work, delivery failures, and insurance alert signals."
          onOpenCategory={onOpenNotificationCategory}
        />

        <AutopayOperationsPanel
          role={session.role}
          title="AutoPay Operations"
          description="District-scoped standing instructions that need monitoring, pause recovery, or reminder support."
          onOpenCategory={onOpenNotificationCategory}
          onOpenOperation={onOpenAutopayOperation}
        />
      </div>

      <div className="two-column-grid">
        <KycWatchlistPanel
          role={session.role}
          title="KYC Watchlist"
          description="District-scoped onboarding review cases that need review, correction, or approval."
          onOpenMember={onOpenKycMember}
        />
      </div>

      <div className="two-column-grid">
        <Panel title="Top Branches" description="Highest-performing branches in this district.">
          <SimpleTable
            headers={['Branch', 'Loans Approved', 'Support', 'Response', 'Score']}
            rows={
              topBranches.length > 0
                ? topBranches.map((item) => [
                    item.name,
                    item.loansApproved.toLocaleString(),
                    item.supportResolved.toLocaleString(),
                    `${item.responseTimeMinutes} min`,
                    item.score.toLocaleString(),
                  ])
                : [['Loading', '...', '...', '...', '...']]
            }
          />
        </Panel>

        <Panel title="Loan Approvals Per Branch" description="Approved branch lending output in this district.">
          <SimpleTable
            headers={['Branch', 'Approved loans']}
            rows={
              commandCenter && commandCenter.loanApprovalsPerBranch.length > 0
                ? commandCenter.loanApprovalsPerBranch.map((item) => [
                    item.branchName,
                    item.approvedCount.toLocaleString(),
                  ])
                : [['Not available', '0']]
            }
          />
        </Panel>

        <Panel title="Branch Watchlist" description="Branches needing support or carrying excess backlog.">
          <p className="muted">
            Focus intervention on branches with weak KYC throughput, growing backlogs, or slow turnaround that could delay secure customer services.
          </p>
          <SimpleTable
            headers={['Branch', 'Escalated', 'Pending', 'Handling Time', 'Action']}
            rows={
              watchlist.length > 0
                ? watchlist.map((item) => [
                    item.name,
                    item.loansEscalated.toLocaleString(),
                    item.pendingTasks.toLocaleString(),
                    `${item.avgHandlingTime} min`,
                    item.status === 'needs_support'
                      ? 'Send district support team'
                      : 'Monitor weekly',
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
