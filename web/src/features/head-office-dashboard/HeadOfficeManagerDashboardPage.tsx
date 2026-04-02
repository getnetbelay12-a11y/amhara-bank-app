import { useEffect, useState } from 'react';

import { useAppClient } from '../../app/AppContext';
import type {
  AutopayOperationItem,
  HeadOfficeCommandCenterSummary,
  InsuranceAlertItem,
  NotificationCategory,
  PerformancePeriod,
  PerformanceSummaryItem,
  RolePerformanceItem,
  RolePerformanceOverview,
  SchoolConsoleOverview,
  SupportChatSummaryItem,
} from '../../core/api/contracts';
import type { AdminSession } from '../../core/session';
import { Panel } from '../../shared/components/Panel';
import { SimpleTable } from '../../shared/components/SimpleTable';
import { ConsoleKpiStrip } from '../../shared/components/ConsoleKpiStrip';
import { CriticalActionStrip } from '../../shared/components/CriticalActionStrip';
import { AuditWatchlistPanel } from '../audit/AuditWatchlistPanel';
import { OperationsSummaryPanel } from './OperationsSummaryPanel';
import { LoanWorkflowWatchlistPanel } from '../loan-monitoring/LoanWorkflowWatchlistPanel';
import { KycWatchlistPanel } from '../manager-pages/KycWatchlistPanel';
import { AutopayOperationsPanel } from '../notifications/AutopayOperationsPanel';
import { NotificationWatchlistPanel } from '../notifications/NotificationWatchlistPanel';
import { SupportWatchlistPanel } from '../support/SupportWatchlistPanel';
import { GovernanceWatchlistPanel } from '../voting/GovernanceWatchlistPanel';

type HeadOfficeManagerDashboardPageProps = {
  session: AdminSession;
  onOpenLoan?: (loanId: string) => void;
  onOpenLoansWorkspace?: () => void;
  onOpenAutopayOperation?: (operationId: string) => void;
  onOpenSupportChat?: (conversationId: string) => void;
  onOpenSupportWorkspace?: () => void;
  onOpenNotificationCategory?: (category: NotificationCategory) => void;
  onOpenKycMember?: (memberId: string) => void;
  onOpenVote?: (voteId: string) => void;
  onOpenAuditEntity?: (entity: string) => void;
  onOpenAuditWorkspace?: () => void;
  onOpenRisk?: () => void;
};

const periods: PerformancePeriod[] = ['today', 'week', 'month', 'year'];

export function HeadOfficeManagerDashboardPage({
  session,
  onOpenLoan,
  onOpenLoansWorkspace,
  onOpenAutopayOperation,
  onOpenSupportChat,
  onOpenSupportWorkspace,
  onOpenNotificationCategory,
  onOpenKycMember,
  onOpenVote,
  onOpenAuditEntity,
  onOpenAuditWorkspace,
  onOpenRisk,
}: HeadOfficeManagerDashboardPageProps) {
  const { dashboardApi, notificationApi, schoolConsoleApi, supportApi } = useAppClient();
  const [period, setPeriod] = useState<PerformancePeriod>('week');
  const [activeView, setActiveView] = useState<'operations' | 'queues' | 'governance'>(
    'operations',
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RolePerformanceItem['status']>('all');
  const [sortBy, setSortBy] = useState<
    'score' | 'response' | 'members' | 'loans' | 'kyc' | 'support'
  >('score');
  const [overview, setOverview] = useState<RolePerformanceOverview | null>(null);
  const [topDistricts, setTopDistricts] = useState<RolePerformanceItem[]>([]);
  const [watchlist, setWatchlist] = useState<RolePerformanceItem[]>([]);
  const [commandCenter, setCommandCenter] =
    useState<HeadOfficeCommandCenterSummary | null>(null);
  const [branchPerformance, setBranchPerformance] = useState<PerformanceSummaryItem[]>([]);
  const [schoolOverview, setSchoolOverview] = useState<SchoolConsoleOverview | null>(null);
  const [openChats, setOpenChats] = useState<SupportChatSummaryItem[]>([]);
  const [insuranceAlerts, setInsuranceAlerts] = useState<InsuranceAlertItem[]>([]);
  const [autopayOperations, setAutopayOperations] = useState<AutopayOperationItem[]>([]);
  const [kycQueueCount, setKycQueueCount] = useState(0);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      dashboardApi.getHeadOfficeCommandCenter(session.role, period),
      dashboardApi.getHeadOfficeDistrictSummary(session.role, period),
      dashboardApi.getHeadOfficeTopDistricts(session.role, period),
      dashboardApi.getHeadOfficeDistrictWatchlist(session.role, period),
      dashboardApi.getBranchPerformance(session.role),
      dashboardApi.getOnboardingReviewQueue(session.role),
      dashboardApi.getAutopayOperations(session.role),
      supportApi.getOpenChats(),
      notificationApi.getInsuranceAlerts(),
      schoolConsoleApi?.getOverview() ?? Promise.resolve(null),
    ]).then(([
      commandCenterResult,
      summaryResult,
      topResult,
      watchlistResult,
      branchPerformanceResult,
      onboardingQueue,
      autopayResult,
      openChatResult,
      insuranceResult,
      schoolOverviewResult,
    ]) => {
      if (cancelled) {
        return;
      }

      setCommandCenter(commandCenterResult);
      setOverview(summaryResult);
      setTopDistricts(topResult);
      setWatchlist(watchlistResult);
      setBranchPerformance(branchPerformanceResult);
      setKycQueueCount(onboardingQueue.length);
      setAutopayOperations(autopayResult);
      setOpenChats(openChatResult);
      setInsuranceAlerts(insuranceResult);
      setSchoolOverview(schoolOverviewResult);
    });

    return () => {
      cancelled = true;
    };
  }, [dashboardApi, notificationApi, period, schoolConsoleApi, session.role, supportApi]);

  const items = overview?.items ?? [];
  const kpis = overview?.kpis;
  const normalizedSearch = search.trim().toLowerCase();
  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        (item.districtName ?? '').toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((left, right) => compareDistricts(left, right, sortBy));

  const maxLoans = Math.max(...items.map((item) => item.loansHandled), 1);
  const maxScore = Math.max(...items.map((item) => item.score), 1);
  const criticalDistrictCount = items.filter((item) => item.status === 'needs_support').length;
  const overdueLoansCount = commandCenter?.riskAlerts.loanAlerts ?? 0;
  const missingDocumentsCount = Math.max((kpis?.membersServed ?? 0) - (kpis?.kycCompleted ?? 0), 0);
  const expiringInsuranceCount = insuranceAlerts.filter((item) => item.requiresManagerAction).length;
  const unansweredChatsCount = openChats.filter((item) => item.status !== 'resolved').length;
  const autopayFailuresCount = autopayOperations.filter(
    (item) => item.operationalStatus === 'paused' || item.actionRequired.trim().length > 0,
  ).length;
  const totalAlertsCount =
    overdueLoansCount + missingDocumentsCount + expiringInsuranceCount + unansweredChatsCount;
  const paidSchoolInvoicesCount =
    schoolOverview?.invoices.filter((item) => item.status === 'paid').length ?? 0;
  const unpaidSchoolInvoicesCount =
    schoolOverview?.invoices.filter((item) => item.status !== 'paid').length ?? 0;
  const overdueSchoolInvoicesCount =
    schoolOverview?.invoices.filter((item) => item.balance > 0).length ?? 0;
  const loanPipeline = buildLoanPipeline(commandCenter?.pendingApprovals ?? 0);
  const selectedDistrict =
    filteredItems.find((item) => item.entityId === selectedDistrictId) ??
    items.find((item) => item.entityId === selectedDistrictId) ??
    null;

  return (
    <div className="page-stack head-office-page">
      <ConsoleKpiStrip
        items={[
          {
            icon: 'CU',
            label: 'Customers',
            value: commandCenter ? commandCenter.totalCustomers.toLocaleString() : 'Not available',
            trend: commandCenter
              ? `${commandCenter.totalShareholders.toLocaleString()} shareholders`
              : 'No trend',
            trendDirection: 'up',
          },
          {
            icon: 'LN',
            label: 'Loans',
            value: commandCenter ? commandCenter.totalLoans.toLocaleString() : 'Not available',
            trend: `${overdueLoansCount.toLocaleString()} overdue`,
            trendDirection: 'down',
          },
          {
            icon: 'SV',
            label: 'Savings',
            value: commandCenter ? `ETB ${commandCenter.totalSavings.toLocaleString()}` : 'Not available',
            trend: kpis ? `${kpis.transactionsProcessed.toLocaleString()} txns` : 'No trend',
            trendDirection: 'up',
          },
          {
            icon: 'AP',
            label: 'Approvals',
            value: commandCenter ? commandCenter.pendingApprovals.toLocaleString() : 'Not available',
            trend: commandCenter && commandCenter.pendingApprovals > 40 ? 'Needs action' : 'Stable',
            trendDirection: commandCenter && commandCenter.pendingApprovals > 40 ? 'down' : 'up',
          },
          {
            icon: 'AL',
            label: 'Alerts',
            value: totalAlertsCount.toLocaleString(),
            trend: `${criticalDistrictCount.toLocaleString()} critical districts`,
            trendDirection: 'down',
          },
        ]}
      />

      <CriticalActionStrip
        items={[
          {
            label: 'Overdue Loans',
            value: overdueLoansCount.toLocaleString(),
            tone: 'red',
            onClick: () => onOpenLoansWorkspace?.(),
          },
          {
            label: 'Missing Docs',
            value: missingDocumentsCount.toLocaleString(),
            tone: 'orange',
            onClick: () => onOpenRisk?.(),
          },
          {
            label: 'Support Backlog',
            value: unansweredChatsCount.toLocaleString(),
            tone: 'red',
            onClick: () => onOpenSupportWorkspace?.(),
          },
          {
            label: 'Expiring Insurance',
            value: expiringInsuranceCount.toLocaleString(),
            tone: 'amber',
            onClick: () => onOpenNotificationCategory?.('insurance'),
          },
        ]}
      />

      <section className="bank-dashboard-grid">
        <Panel title="District Performance" description="Top districts with response and approval posture.">
          <div className="mini-table-list">
            {filteredItems.slice(0, 5).map((item) => (
              <button
                key={item.entityId}
                type="button"
                className="mini-table-row"
                onClick={() => setSelectedDistrictId(item.entityId)}
              >
                <strong>{item.name}</strong>
                <span>{item.score} score</span>
                <span>{item.responseTimeMinutes} min</span>
                <div className="table-progress-track">
                  <div className="table-progress-fill" style={{ width: `${item.score}%` }} />
                </div>
                <span className="mini-table-action">Review</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Support Overview" description="Backlog, escalation pressure, and live chat posture.">
          <div className="support-overview-stack">
            <div className="dashboard-summary-strip dashboard-summary-strip-dense">
              <div className="dashboard-summary-chip">
                <span className="dashboard-summary-label">Open chats</span>
                <strong>{commandCenter?.supportOverview.openChats.toLocaleString() ?? '0'}</strong>
              </div>
              <div className="dashboard-summary-chip">
                <span className="dashboard-summary-label">Escalated</span>
                <strong>{commandCenter?.supportOverview.escalatedChats.toLocaleString() ?? '0'}</strong>
              </div>
            </div>
            <div className="mini-table-list">
              {openChats.slice(0, 4).map((chat) => (
                <button
                  key={chat.conversationId}
                  type="button"
                  className="mini-table-row"
                  onClick={() => onOpenSupportChat?.(chat.conversationId)}
                >
                  <strong>{chat.memberName ?? chat.customerId}</strong>
                  <span>{chat.issueCategory}</span>
                  <span>{formatLabel(chat.status)}</span>
                  <div className="table-progress-track">
                    <div
                      className="table-progress-fill"
                      style={{ width: `${chat.escalationFlag ? 92 : chat.priority === 'high' ? 78 : 56}%` }}
                    />
                  </div>
                  <span className="mini-table-action">Open</span>
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Loan Pipeline" description="Clear stage-by-stage loan flow across the bank.">
          <div className="loan-pipeline-dashboard">
            {loanPipeline.map((stage) => (
              <div key={stage.label} className="loan-pipeline-dashboard-stage">
                <div className="loan-pipeline-dashboard-meta">
                  <span>{stage.label}</span>
                  <strong>{stage.value.toLocaleString()}</strong>
                </div>
                <div className="table-progress-track">
                  <div className={`table-progress-fill ${stage.tone}`} style={{ width: `${stage.width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="KYC Status" description="Pending onboarding and document completion posture.">
          <div className="kyc-status-card">
            <div className="dashboard-summary-strip dashboard-summary-strip-dense">
              <div className="dashboard-summary-chip">
                <span className="dashboard-summary-label">Completed</span>
                <strong>{kpis?.kycCompleted.toLocaleString() ?? '0'}</strong>
              </div>
              <div className="dashboard-summary-chip">
                <span className="dashboard-summary-label">Pending</span>
                <strong>{kycQueueCount.toLocaleString()}</strong>
              </div>
            </div>
            <div className="institution-health-row">
              <div>
                <strong>KYC completion rate</strong>
                <p className="muted">
                  {kpis && kpis.membersServed > 0
                    ? `${Math.round((kpis.kycCompleted / kpis.membersServed) * 100)}% of served members`
                    : 'Not available'}
                </p>
              </div>
              <div className="institution-health-meter warning">
                <span
                  style={{
                    width: `${Math.min(((kpis?.kycCompleted ?? 0) / Math.max(kpis?.membersServed ?? 1, 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="School Payments" description="Student billing posture and reminder workflow.">
          <div className="school-payment-card">
            <div className="dashboard-summary-strip dashboard-summary-strip-dense">
              <div className="dashboard-summary-chip">
                <span className="dashboard-summary-label">Students</span>
                <strong>{schoolOverview?.summary.students.toLocaleString() ?? '0'}</strong>
              </div>
              <div className="dashboard-summary-chip">
                <span className="dashboard-summary-label">Paid Today</span>
                <strong>{paidSchoolInvoicesCount.toLocaleString()}</strong>
              </div>
              <div className="dashboard-summary-chip">
                <span className="dashboard-summary-label">Overdue</span>
                <strong>{overdueSchoolInvoicesCount.toLocaleString()}</strong>
              </div>
            </div>
            <div className="school-payment-balance">
              <div className="school-payment-balance-bar paid" style={{ flex: Math.max(paidSchoolInvoicesCount, 1) }} />
              <div className="school-payment-balance-bar unpaid" style={{ flex: Math.max(unpaidSchoolInvoicesCount, 1) }} />
              <div className="school-payment-balance-bar overdue" style={{ flex: Math.max(overdueSchoolInvoicesCount, 1) }} />
            </div>
            <button
              type="button"
              className="head-office-command-button"
              onClick={() => onOpenNotificationCategory?.('payment')}
            >
              Send Reminder
            </button>
          </div>
        </Panel>

        <Panel title="Performance Summary" description="Visual branch execution bars instead of dense text.">
          <div className="performance-summary-list">
            {branchPerformance.slice(0, 4).map((item) => (
              <div key={item.scopeId} className="performance-summary-row">
                <strong>{formatLabel(item.scopeId)}</strong>
                <div className="performance-summary-bars">
                  <div>
                    <span>Loans</span>
                    <div className="table-progress-track">
                      <div
                        className="table-progress-fill"
                        style={{ width: `${Math.min((item.loanApprovedCount / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <span>KYC</span>
                    <div className="table-progress-track">
                      <div
                        className="table-progress-fill teal"
                        style={{ width: `${Math.min((item.customersServed / 600) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <span>Support</span>
                    <div className="table-progress-track">
                      <div
                        className="table-progress-fill warning"
                        style={{ width: `${Math.min((item.schoolPaymentsCount / 250) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <span className="performance-summary-score">
                  {Math.min(
                    Math.round(
                      ((item.loanApprovedCount + item.schoolPaymentsCount + item.customersServed / 10) /
                        120) *
                        100,
                    ),
                    99,
                  )}
                  %
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {activeView === 'operations' ? (
      <section className="dashboard-section-block dashboard-section-operations">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Operations Control</p>
            <h3>Daily command and district execution</h3>
            <p className="muted">
              A cleaner executive layer for operational queues, district health, and intervention posture.
            </p>
          </div>
          <div className="dashboard-section-heading-meta">
            <SectionPill
              label="Risk"
              value={commandCenter ? `${commandCenter.riskAlerts.totalAlerts} alerts` : 'No alerts'}
            />
            <SectionPill
              label="Approvals"
              value={commandCenter ? `${commandCenter.pendingApprovals} pending` : 'No approvals'}
            />
            <SectionPill
              label="Response"
              value={kpis ? `${kpis.responseTimeMinutes} min avg` : 'Not available'}
            />
          </div>
        </div>
        <div className="dashboard-primary-stack">
          <OperationsSummaryPanel
            role={session.role}
            onOpenAudit={onOpenAuditWorkspace}
            onOpenLoans={onOpenLoansWorkspace}
            onOpenRisk={onOpenRisk}
            onOpenSupport={onOpenSupportWorkspace}
          />

          <Panel title="District Ranking" description="Executive comparison across districts with ranking, transaction volume, and intervention priorities.">
            <p className="muted">
              Watchlist districts should be handled first where KYC clearance is weak, response time is high,
              or member-facing secure services are likely to be blocked.
            </p>
            <div className="dashboard-toolbar">
              <label className="field-stack">
                <span>Search District</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by district name"
                />
              </label>
              <label className="field-stack">
                <span>Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as 'all' | RolePerformanceItem['status'])
                  }
                >
                  <option value="all">All statuses</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="watch">Watch</option>
                  <option value="needs_support">Critical</option>
                </select>
              </label>
              <label className="field-stack">
                <span>Sort By</span>
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value as
                        | 'score'
                        | 'response'
                        | 'members'
                        | 'loans'
                        | 'kyc'
                        | 'support',
                    )
                  }
                >
                  <option value="score">Score</option>
                  <option value="response">Response time</option>
                  <option value="members">Members</option>
                  <option value="loans">Loans</option>
                  <option value="kyc">KYC</option>
                  <option value="support">Support</option>
                </select>
              </label>
            </div>

            <div className="district-performance-wrap">
              <div className="district-performance-board">
                <div className="district-performance-header">
                  <span>District</span>
                  <span>Loans</span>
                  <span>Response</span>
                  <span>Score</span>
                  <span>Action</span>
                </div>

                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <article
                      key={item.entityId}
                      className={
                        selectedDistrictId === item.entityId
                          ? 'district-performance-row selected'
                          : 'district-performance-row'
                      }
                      onClick={() => setSelectedDistrictId(item.entityId)}
                    >
                      <div className="district-name-cell">
                        <strong>{item.name}</strong>
                        <span className="muted">
                          {item.pendingTasks.toLocaleString()} pending tasks
                        </span>
                      </div>
                      <MetricBar
                        value={item.loansHandled}
                        max={maxLoans}
                        tone="secondary"
                        label={item.loansHandled.toLocaleString()}
                      />
                      <div className="district-response-cell">{item.responseTimeMinutes} min</div>
                      <MetricBar
                        value={item.score}
                        max={maxScore}
                        tone={scoreTone(item.status)}
                        label={`${item.score}`}
                      />
                      <div className="district-action-cell">
                        <button
                          type="button"
                          className="district-action-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedDistrictId(item.entityId);
                          }}
                        >
                          Review
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="district-empty-state">
                    No districts match the current search and filter selection.
                  </div>
                )}
              </div>
            </div>

            {selectedDistrict ? (
              <div className="panel district-detail-panel">
                <div className="panel-header">
                  <div>
                    <h2>{selectedDistrict.name}</h2>
                    <p className="muted">
                      Review district momentum, pending workload, response posture, and next intervention priority.
                    </p>
                  </div>
                </div>
                <div className="two-column-grid">
                  <div className="trend-bars">
                    <div>
                      <div className="trend-meta">
                        <span>Transactions processed</span>
                        <strong>{selectedDistrict.transactionsProcessed.toLocaleString()}</strong>
                      </div>
                      <div className="trend-track">
                        <div
                          className="trend-fill"
                          style={{
                            width: `${Math.min(
                              (selectedDistrict.transactionsProcessed /
                                Math.max(kpis?.transactionsProcessed ?? 1, 1)) *
                                100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="trend-meta">
                        <span>Escalated loans</span>
                        <strong>{selectedDistrict.loansEscalated.toLocaleString()}</strong>
                      </div>
                      <div className="trend-track">
                        <div
                          className="trend-fill"
                          style={{
                            width: `${Math.min(
                              (selectedDistrict.loansEscalated /
                                Math.max(selectedDistrict.pendingApprovals, 1)) *
                                100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="trend-bars">
                    <div className="trend-meta">
                      <span>Status</span>
                      <StatusBadge status={selectedDistrict.status} />
                    </div>
                    <div className="trend-meta">
                      <span>Pending approvals</span>
                      <strong>{selectedDistrict.pendingApprovals.toLocaleString()}</strong>
                    </div>
                    <div className="trend-meta">
                      <span>District action</span>
                      <span className="muted">
                        {selectedDistrict.status === 'needs_support'
                          ? 'Escalate support playbook'
                          : 'Continue monitored execution'}
                      </span>
                    </div>
                    <div className="trend-meta">
                      <span>Predicted SLA risk</span>
                      <span className="muted">
                        {selectedDistrict.responseTimeMinutes >= 18
                          ? 'Elevated'
                          : selectedDistrict.responseTimeMinutes >= 13
                            ? 'Moderate'
                            : 'Low'}
                      </span>
                    </div>
                    <div className="trend-meta">
                      <span>Approval backlog forecast</span>
                      <strong>
                        {Math.max(
                          selectedDistrict.pendingApprovals + selectedDistrict.loansEscalated * 2,
                          0,
                        ).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </Panel>

        </div>
      </section>
      ) : null}

      {activeView === 'queues' ? (
      <section className="dashboard-section-block dashboard-section-workbench">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Queues and Worklists</p>
            <h3>Institution workbench</h3>
            <p className="muted">
              Focus queues grouped by lending, support, notifications, compliance, and recurring operations.
            </p>
          </div>
          <div className="dashboard-section-heading-meta">
            <SectionPill
              label="Loans"
              value={kpis ? `${kpis.loansHandled} handled` : 'Not available'}
            />
            <SectionPill
              label="Support"
              value={commandCenter ? `${commandCenter.supportOverview.openChats} open` : 'Not available'}
            />
            <SectionPill
              label="KYC"
              value={kpis ? `${kpis.kycCompleted} reviewed` : 'Not available'}
            />
          </div>
        </div>
        <div className="two-column-grid dashboard-asymmetric-grid">
          <LoanWorkflowWatchlistPanel
            title="Loan Workflow Watchlist"
            description="Executive view of queue pressure, approval-ready files, and correction-heavy cases across the institution."
            emptyActionLabel="Complete executive review"
            onOpenLoan={onOpenLoan}
          />

          <SupportWatchlistPanel
            title="Support Watchlist"
            description="Executive view of unread, escalated, and high-priority support conversations."
            onOpenChat={onOpenSupportChat}
          />
        </div>

        <div className="two-column-grid dashboard-asymmetric-grid dashboard-asymmetric-grid-reverse">
          <NotificationWatchlistPanel
            title="Notification Watchlist"
            description="Executive view of reminder workload, delivery failures, and insurance alert pressure."
            onOpenCategory={onOpenNotificationCategory}
          />

          <AutopayOperationsPanel
            role={session.role}
            title="AutoPay Operations"
            description="Executive view of standing instructions that need monitoring, pause recovery, or reminder support."
            onOpenCategory={onOpenNotificationCategory}
            onOpenOperation={onOpenAutopayOperation}
          />
        </div>

        <div className="two-column-grid dashboard-balanced-grid">
          <KycWatchlistPanel
            role={session.role}
            title="KYC Watchlist"
            description="Executive view of onboarding review pressure, customer correction work, and approval readiness."
            onOpenMember={onOpenKycMember}
          />

          <Panel title="District Watchlist" description="Districts needing intervention or support.">
            <SimpleTable
              headers={['District', 'Pending Tasks', 'Escalated Loans', 'Response', 'Action']}
              rows={
                watchlist.length > 0
                  ? watchlist.map((item) => [
                      item.name,
                      item.pendingTasks.toLocaleString(),
                      item.loansEscalated.toLocaleString(),
                      `${item.responseTimeMinutes} min`,
                      item.status === 'needs_support'
                        ? 'Dispatch audit and compliance support'
                        : 'Coach district operations lead',
                    ])
                  : [['Loading', '...', '...', '...', '...']]
              }
            />
          </Panel>
        </div>
      </section>
      ) : null}

      {activeView === 'governance' ? (
      <section className="dashboard-section-block dashboard-section-governance">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Governance and Control</p>
            <h3>Oversight, audit, and leadership assurance</h3>
            <p className="muted">
              Governance reviews, audit watchlists, and top district benchmarks in one oversight layer.
            </p>
          </div>
          <div className="dashboard-section-heading-meta">
            <SectionPill
              label="Votes"
              value={commandCenter ? `${commandCenter.governanceStatus.activeVotes} active` : 'Not available'}
            />
            <SectionPill
              label="Announcements"
              value={
                commandCenter
                  ? `${commandCenter.governanceStatus.shareholderAnnouncements} published`
                  : 'Not available'
              }
            />
            <SectionPill
              label="Shareholders"
              value={commandCenter ? commandCenter.totalShareholders.toLocaleString() : 'Not available'}
            />
          </div>
        </div>
        <div className="two-column-grid dashboard-asymmetric-grid">
          <GovernanceWatchlistPanel role={session.role} onOpenVote={onOpenVote} />

          <AuditWatchlistPanel role={session.role} onOpenEntity={onOpenAuditEntity} />
        </div>

        <div className="two-column-grid dashboard-balanced-grid">
          <Panel title="Top Districts" description="Best-performing districts in the selected period.">
            <SimpleTable
              headers={['District', 'Loans', 'Transactions', 'Pending', 'Score']}
              rows={
                topDistricts.length > 0
                  ? topDistricts.map((item) => [
                      item.name,
                      item.loansHandled.toLocaleString(),
                      item.transactionsProcessed.toLocaleString(),
                      item.pendingApprovals.toLocaleString(),
                      item.score.toLocaleString(),
                    ])
                  : [['Loading', '...', '...', '...', '...']]
              }
            />
          </Panel>

          <Panel title="Governance Snapshot" description="Small oversight block for voting and regional stability.">
            <SimpleTable
              headers={['District', 'Status', 'Support', 'Intervention']}
              rows={
                [...topDistricts.slice(0, 2), ...watchlist.slice(0, 2)].length > 0
                  ? [...topDistricts.slice(0, 2), ...watchlist.slice(0, 2)].map((item) => [
                      item.name,
                      formatStatusLabel(item.status),
                      `${item.supportResolved.toLocaleString()} resolved`,
                      item.status === 'needs_support'
                        ? 'Immediate district support'
                        : item.status === 'watch'
                          ? 'Monitor and coach'
                          : 'Sustain and replicate',
                    ])
                  : [['Loading', '...', '...', '...']]
              }
            />
          </Panel>
        </div>
      </section>
      ) : null}
      <aside className="live-chat-side-panel">
        <div className="live-chat-side-panel-header">
          <div>
            <p className="eyebrow">Live Chat</p>
            <h3>Support attention</h3>
          </div>
          <button type="button" className="live-chat-link" onClick={() => onOpenSupportWorkspace?.()}>
            Open desk
          </button>
        </div>
        <div className="live-chat-list">
          {openChats.slice(0, 4).map((chat) => (
            <button
              key={chat.conversationId}
              type="button"
              className="live-chat-item"
              onClick={() => onOpenSupportChat?.(chat.conversationId)}
            >
              <strong>{chat.memberName ?? chat.customerId}</strong>
              <span>{chat.issueCategory}</span>
              <small>{chat.lastMessage}</small>
            </button>
          ))}
          {openChats.length === 0 ? <div className="live-chat-empty">No live chats waiting.</div> : null}
        </div>
      </aside>
    </div>
  );
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function compareDistricts(
  left: RolePerformanceItem,
  right: RolePerformanceItem,
  sortBy: 'score' | 'response' | 'members' | 'loans' | 'kyc' | 'support',
) {
  switch (sortBy) {
    case 'response':
      return left.responseTimeMinutes - right.responseTimeMinutes;
    case 'members':
      return right.membersServed - left.membersServed;
    case 'loans':
      return right.loansHandled - left.loansHandled;
    case 'kyc':
      return right.kycCompleted - left.kycCompleted;
    case 'support':
      return right.supportResolved - left.supportResolved;
    case 'score':
    default:
      return right.score - left.score;
  }
}

function MetricBar({
  value,
  max,
  label,
  tone,
}: {
  value: number;
  max: number;
  label: string;
  tone: 'primary' | 'secondary' | 'success' | 'accent' | 'warning';
}) {
  const width = Math.max((value / Math.max(max, 1)) * 100, 10);

  return (
    <div className="metric-bar-cell">
      <div className="metric-bar-header">
        <span className="metric-bar-label">{label}</span>
      </div>
      <div className="metric-bar-track">
        <div
          className={`metric-bar-fill ${tone}`}
          style={{ width: `${Math.min(width, 100)}%` }}
        />
      </div>
    </div>
  );
}

function ExecutiveSignalCard({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  tone: 'primary' | 'teal' | 'warning';
}) {
  return (
    <article className={`executive-signal-card executive-signal-card-${tone}`}>
      <div className="executive-signal-card-top">
        <span className="eyebrow">{title}</span>
      </div>
      <strong>{value}</strong>
      <p className="muted">{detail}</p>
    </article>
  );
}

function CriticalActionCard({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  tone: 'red' | 'orange';
}) {
  return (
    <article className={`critical-action-card ${tone}`}>
      <span className="eyebrow">{title}</span>
      <strong>{value}</strong>
      <p className="muted">{detail}</p>
    </article>
  );
}

function SectionPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-section-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }: { status: RolePerformanceItem['status'] }) {
  return <span className={`status-badge ${status}`}>{formatStatusLabel(status)}</span>;
}

function formatStatusLabel(status: RolePerformanceItem['status']) {
  if (status === 'needs_support') {
    return 'Critical';
  }

  return formatLabel(status);
}

function buildLoanPipeline(pendingApprovals: number) {
  const submitted = Math.max(pendingApprovals + 80, 120);
  const branch = Math.max(Math.round(submitted * 0.66), 80);
  const district = Math.max(Math.round(submitted * 0.33), 40);
  const headOffice = Math.max(Math.round(submitted * 0.08), 10);
  const approved = Math.max(Math.round(submitted * 0.25), 30);

  return [
    { label: 'Submitted', value: submitted, width: 100, tone: 'primary' },
    { label: 'Branch', value: branch, width: Math.round((branch / submitted) * 100), tone: 'teal' },
    { label: 'District', value: district, width: Math.round((district / submitted) * 100), tone: 'warning' },
    { label: 'Head Office', value: headOffice, width: Math.round((headOffice / submitted) * 100), tone: 'accent' },
    { label: 'Approved', value: approved, width: Math.round((approved / submitted) * 100), tone: 'success' },
  ] as const;
}

function scoreTone(status: RolePerformanceItem['status']) {
  if (status === 'excellent') {
    return 'warning';
  }

  if (status === 'needs_support') {
    return 'accent';
  }

  return 'primary';
}
