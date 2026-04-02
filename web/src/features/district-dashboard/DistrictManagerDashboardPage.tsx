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
import { ConsoleKpiStrip } from '../../shared/components/ConsoleKpiStrip';
import { CriticalActionStrip } from '../../shared/components/CriticalActionStrip';
import {
  DashboardGrid,
  DashboardMetricRow,
  DashboardPage,
  DashboardPipelineCard,
  DashboardProgressRow,
  DashboardSectionCard,
  DashboardTableCard,
  EmptyStateCard,
  QuickActionChip,
} from '../../shared/components/BankingDashboard';
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
  const topRankedBranch = commandCenter?.branchRanking[0] ?? null;
  const topApprovalBranch = commandCenter?.loanApprovalsPerBranch[0] ?? null;
  const kycCompletionRate = commandCenter?.kycCompletion.completionRate ?? 0;

  return (
    <DashboardPage>
      <ConsoleKpiStrip
        items={[
          { icon: 'BR', label: 'Branches', value: commandCenter ? commandCenter.branchList.length.toLocaleString() : 'Not available', trend: 'District coverage', trendDirection: 'neutral' },
          { icon: 'LN', label: 'Loans', value: commandCenter ? commandCenter.loanApprovalsPerBranch.reduce((sum, item) => sum + item.approvedCount, 0).toLocaleString() : 'Not available', trend: 'Approved', trendDirection: 'up' },
          { icon: 'KY', label: 'KYC Completion', value: commandCenter ? `${commandCenter.kycCompletion.completionRate}%` : 'Not available', trend: `${commandCenter?.kycCompletion.pendingReview ?? 0} pending`, trendDirection: 'neutral' },
          { icon: 'SP', label: 'Support Backlog', value: commandCenter ? commandCenter.supportMetrics.openChats.toLocaleString() : 'Not available', trend: `${commandCenter?.supportMetrics.escalatedChats ?? 0} escalated`, trendDirection: 'down' },
          { icon: 'AL', label: 'Alerts', value: watchlist.length.toLocaleString(), trend: 'Branches on watch', trendDirection: watchlist.length > 0 ? 'down' : 'up' },
        ]}
      />

      <CriticalActionStrip
        items={[
          { label: 'Overdue Loans', value: watchlist.reduce((sum, item) => sum + item.loansEscalated, 0).toLocaleString(), tone: 'red' },
          { label: 'Missing Documents', value: commandCenter ? commandCenter.kycCompletion.needsAction.toLocaleString() : '0', tone: 'orange' },
          { label: 'Support Backlog', value: commandCenter ? commandCenter.supportMetrics.openChats.toLocaleString() : '0', tone: 'amber' },
          { label: 'KYC Exceptions', value: commandCenter ? commandCenter.kycCompletion.pendingReview.toLocaleString() : '0', tone: 'amber' },
        ]}
      />

      <DashboardGrid>
        <DashboardSectionCard
          title="District Performance"
          description="Branch ranking and district execution in one compact view."
          action={
            <label className="field-stack">
              <span>Period</span>
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
          }
        >
          <div className="flex flex-col gap-3">
            <DashboardMetricRow
              label="Top Branch"
              value={topRankedBranch ? `${topRankedBranch.score} score` : 'Not available'}
              note={topRankedBranch?.name ?? 'No ranked branch yet'}
            />
            {commandCenter?.branchRanking.slice(0, 4).map((branch) => (
              <DashboardProgressRow
                key={branch.name}
                label={branch.name}
                value={`${branch.score} score`}
                progress={Math.min(branch.score, 100)}
                tone={branch.score >= 85 ? 'green' : branch.score >= 70 ? 'blue' : 'amber'}
              />
            ))}
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          title="Support Overview"
          description="Open chat pressure, assignment load, and response posture."
          action={<QuickActionChip label={`${commandCenter?.supportMetrics.assignedChats ?? 0} assigned`} />}
        >
          <div className="flex flex-col gap-3">
            <DashboardMetricRow
              label="Open Chats"
              value={commandCenter?.supportMetrics.openChats.toLocaleString() ?? '0'}
              note={`${commandCenter?.supportMetrics.assignedChats.toLocaleString() ?? '0'} assigned`}
            />
            <DashboardMetricRow
              label="Escalated"
              value={commandCenter?.supportMetrics.escalatedChats.toLocaleString() ?? '0'}
              note="District queue requiring intervention"
            />
            <DashboardMetricRow
              label="Response"
              value={kpis ? `${kpis.responseTimeMinutes} min` : 'Not available'}
              note="Average handling time"
            />
          </div>
        </DashboardSectionCard>
      </DashboardGrid>

      <DashboardGrid>
        <DashboardPipelineCard
          title="District Loan Queue"
          description="Branch intake moving through district approval."
          stages={[
            { label: 'Submitted', value: `${kpis?.pendingApprovals ?? 0}`, progress: 100, tone: 'blue' },
            { label: 'Branch Review', value: `${Math.max(Math.round((kpis?.pendingApprovals ?? 0) * 0.72), 1)}`, progress: 72, tone: 'teal' },
            { label: 'District Review', value: `${Math.max(Math.round((kpis?.pendingApprovals ?? 0) * 0.46), 1)}`, progress: 46, tone: 'amber' },
            { label: 'Head Office', value: `${Math.max(Math.round((kpis?.pendingApprovals ?? 0) * 0.18), 1)}`, progress: 18, tone: 'red' },
            { label: 'Approved', value: `${topBranches.reduce((sum, item) => sum + item.loansApproved, 0)}`, progress: 34, tone: 'green' },
          ]}
        />

        <DashboardSectionCard
          title="KYC Status"
          description="Completion posture across the district branch network."
        >
          <div className="flex flex-col gap-3">
            <DashboardMetricRow
              label="Completion Rate"
              value={`${kycCompletionRate}%`}
              note={`${commandCenter?.kycCompletion.completed.toLocaleString() ?? '0'} completed`}
            />
            <DashboardMetricRow
              label="Pending Review"
              value={commandCenter?.kycCompletion.pendingReview.toLocaleString() ?? '0'}
              note={`${commandCenter?.kycCompletion.needsAction.toLocaleString() ?? '0'} need action`}
            />
            <DashboardProgressRow
              label="District Completion"
              value={`${kycCompletionRate}%`}
              progress={kycCompletionRate}
              tone={kycCompletionRate >= 85 ? 'green' : kycCompletionRate >= 70 ? 'blue' : 'amber'}
            />
          </div>
        </DashboardSectionCard>
      </DashboardGrid>

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

      <DashboardGrid>
        <DashboardTableCard
          title="Branch Ranking"
          description="Top district branches with a simpler banking score table."
          headers={['Branch', 'Loans', 'KYC', 'Score', 'Action']}
          rows={items.map((item) => [
            item.name,
            item.loansHandled.toLocaleString(),
            item.kycCompleted.toLocaleString(),
            `${item.score}`,
            'Review',
          ])}
        />

        <DashboardSectionCard
          title="Branch Alerts"
          description="District branches needing coaching or intervention."
        >
          {watchlist.length > 0 ? (
            <div className="flex flex-col gap-3">
              {watchlist.slice(0, 4).map((item) => (
                <DashboardProgressRow
                  key={item.entityId}
                  label={item.name}
                  value={`${item.pendingTasks} pending`}
                  progress={Math.min(Math.round((item.pendingTasks / Math.max(item.pendingTasks + item.loansEscalated, 1)) * 100), 100)}
                  tone={item.status === 'needs_support' ? 'red' : 'amber'}
                />
              ))}
            </div>
          ) : (
            <EmptyStateCard
              title="No branch alerts"
              description="District branches are currently within normal thresholds."
            />
          )}
        </DashboardSectionCard>
      </DashboardGrid>

      <DashboardGrid>
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
      </DashboardGrid>

      <DashboardGrid>
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
      </DashboardGrid>

      <DashboardGrid>
        <KycWatchlistPanel
          role={session.role}
          title="KYC Watchlist"
          description="District-scoped onboarding review cases that need review, correction, or approval."
          onOpenMember={onOpenKycMember}
        />
      </DashboardGrid>

      <DashboardGrid>
        <DashboardTableCard
          title="Top Branches"
          description="Highest-performing branches with compact execution metrics."
          headers={['Branch', 'Loans', 'Support', 'Response', 'Score']}
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

        <DashboardSectionCard
          title="Approval Output"
          description="Branch lending throughput and watchlist focus."
        >
          <div className="flex flex-col gap-3">
            <DashboardMetricRow
              label="Top Approval Branch"
              value={topApprovalBranch?.approvedCount.toLocaleString() ?? '0'}
              note={topApprovalBranch?.branchName ?? 'Not available'}
            />
            {commandCenter?.loanApprovalsPerBranch.slice(0, 4).map((item) => (
              <DashboardProgressRow
                key={item.branchName}
                label={item.branchName}
                value={`${item.approvedCount} approved`}
                progress={Math.min(
                  Math.round((item.approvedCount / Math.max(topApprovalBranch?.approvedCount ?? 1, 1)) * 100),
                  100,
                )}
                tone="green"
              />
            ))}
          </div>
        </DashboardSectionCard>
      </DashboardGrid>
    </DashboardPage>
  );
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
