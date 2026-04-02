import { useEffect, useState } from 'react';

import { useAppClient } from '../../app/AppContext';
import type {
  AuditLogItem,
  InsuranceAlertItem,
  LoanQueueItem,
  NotificationCategory,
  NotificationCampaignItem,
  NotificationCenterItem,
  OnboardingReviewItem,
  PerformanceSummaryItem,
  StaffRankingItem,
  SupportChatSummaryItem,
} from '../../core/api/contracts';
import type { AdminSession } from '../../core/session';
import { Panel } from '../../shared/components/Panel';
import { SimpleTable } from '../../shared/components/SimpleTable';

type SessionProps = {
  session: AdminSession;
};

export function MembersPage({ session }: SessionProps) {
  const { dashboardApi } = useAppClient();
  const [branches, setBranches] = useState<PerformanceSummaryItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void dashboardApi.getBranchPerformance(session.role).then((result) => {
      if (!cancelled) {
        setBranches(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dashboardApi, session.role]);

  return (
    <div className="page-stack">
      <Panel
        title="Members"
        description="Membership growth, branch coverage, and service readiness within the current role scope."
      >
        <SimpleTable
          headers={['Scope', 'Members', 'Transactions', 'School Payments']}
          rows={
            branches.length > 0
              ? branches.map((item) => [
                  titleCase(item.scopeId),
                  item.customersServed.toLocaleString(),
                  item.transactionsCount.toLocaleString(),
                  item.schoolPaymentsCount.toLocaleString(),
                ])
              : [['Loading', '...', '...', '...']]
          }
        />
      </Panel>
    </div>
  );
}

export function KycVerificationPage({
  session,
  initialMemberId,
  returnContextLabel,
  onReturnToContext,
}: SessionProps & {
  initialMemberId?: string;
  returnContextLabel?: string;
  onReturnToContext?: () => void;
}) {
  const { dashboardApi } = useAppClient();
  const [items, setItems] = useState<OnboardingReviewItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void dashboardApi.getOnboardingReviewQueue(session.role).then((result) => {
      if (!cancelled) {
        setItems(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dashboardApi, session.role]);

  const counts = {
    submitted: items.filter((item) => item.onboardingReviewStatus === 'submitted').length,
    reviewInProgress: items.filter((item) => item.onboardingReviewStatus === 'review_in_progress').length,
    needsAction: items.filter((item) => item.onboardingReviewStatus === 'needs_action').length,
  };
  const prioritizedItems =
    initialMemberId && items.some((item) => item.memberId === initialMemberId)
      ? [
          ...items.filter((item) => item.memberId === initialMemberId),
          ...items.filter((item) => item.memberId !== initialMemberId),
        ]
      : items;

  const handleReviewAction = async (
    memberId: string,
    status: 'review_in_progress' | 'needs_action' | 'approved',
  ) => {
    const note =
      status === 'needs_action'
        ? 'Staff marked this onboarding package for customer correction.'
        : status === 'approved'
          ? 'Staff approved onboarding after Fayda and selfie review.'
          : 'Staff moved this onboarding package into active review.';

    const updated = await dashboardApi.updateOnboardingReview(memberId, {
      status,
      note,
    });

    setItems((current) =>
      current.map((item) => (item.memberId === memberId ? updated : item)),
    );
  };

  return (
    <div className="page-stack">
      {returnContextLabel && onReturnToContext ? (
        <div className="loan-return-banner">
          <div>
            <p className="eyebrow">Dashboard Context</p>
            <strong>Opened from {returnContextLabel}</strong>
          </div>
          <button
            type="button"
            className="loan-return-button"
            onClick={onReturnToContext}
          >
            Back to {returnContextLabel}
          </button>
        </div>
      ) : null}
      <Panel
        title="KYC Verification"
        description="Live onboarding review queue with secure status handling, exception follow-up, and approval readiness."
      >
        <p className="muted">
          Review priority should follow secure onboarding rules: verify Fayda evidence first,
          resolve missing information next, and only clear members for voting or payments after approval.
        </p>
        <SimpleTable
          headers={['Submitted cases', 'In active review', 'Needs customer action']}
          rows={[[counts.submitted.toString(), counts.reviewInProgress.toString(), counts.needsAction.toString()]]}
        />
      </Panel>
      <Panel
        title="Onboarding Review Queue"
        description="Branch and district teams can move cases into review, request correction, or approve verified onboarding packages."
      >
        <SimpleTable
          headers={[
            'Customer',
            'Branch',
            'Review stage',
            'Identity state',
            'Customer next step',
            'Review action',
          ]}
          rows={prioritizedItems.map((item) => [
            `${item.memberName} (${item.customerId})`,
            item.branchName ?? 'Unassigned',
            item.onboardingReviewStatus.replace(/_/g, ' '),
            `${item.identityVerificationStatus} / ${item.kycStatus}`,
            item.requiredAction,
            <div key={item.memberId} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void handleReviewAction(item.memberId, 'review_in_progress')}
              >
                Start review
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void handleReviewAction(item.memberId, 'needs_action')}
              >
                Request update
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void handleReviewAction(item.memberId, 'approved')}
              >
                Approve
              </button>
            </div>,
          ])}
          emptyState={{
            title: 'No onboarding reviews in this scope',
            description: 'There are no onboarding cases waiting for review in the current staff scope.',
          }}
        />
      </Panel>
    </div>
  );
}

export function ReportsHubPage({ session }: SessionProps) {
  return (
    <div className="page-stack">
      <Panel
        title="Reports"
        description={`Scheduled and export-ready reporting for ${session.branchName}.`}
      >
        <SimpleTable
          headers={['Report', 'Scope', 'Refresh']}
          rows={[
            ['Executive summary', session.branchName, 'Hourly'],
            ['Loan approvals and escalations', session.branchName, 'Every 15 min'],
            ['Member growth and service load', session.branchName, 'Daily'],
          ]}
        />
      </Panel>
    </div>
  );
}

export function BranchOverviewPage({ session }: SessionProps) {
  const { dashboardApi } = useAppClient();
  const [branches, setBranches] = useState<PerformanceSummaryItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void dashboardApi.getBranchPerformance(session.role).then((result) => {
      if (!cancelled) {
        setBranches(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dashboardApi, session.role]);

  return (
    <div className="page-stack">
      <Panel
        title="Branch Performance"
        description="Branch comparison for district leadership."
      >
        <SimpleTable
          headers={['Branch', 'Members', 'Transactions', 'Volume']}
          rows={
            branches.length > 0
              ? branches.map((item) => [
                  titleCase(item.scopeId),
                  item.customersServed.toLocaleString(),
                  item.transactionsCount.toLocaleString(),
                  `ETB ${item.totalTransactionAmount.toLocaleString()}`,
                ])
              : [['Loading', '...', '...', '...']]
          }
        />
      </Panel>
    </div>
  );
}

export function KycAuditPage({ session }: SessionProps) {
  const { dashboardApi } = useAppClient();
  const [districts, setDistricts] = useState<PerformanceSummaryItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void dashboardApi.getDistrictPerformance(session.role).then((result) => {
      if (!cancelled) {
        setDistricts(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dashboardApi, session.role]);

  return (
    <div className="page-stack">
      <Panel
        title="KYC Audits"
        description="District verification exceptions and audit follow-up."
      >
        <p className="muted">
          Manual review and audit queues should be closed before districts push customers
          into sensitive services such as governance participation or account security changes.
        </p>
        <SimpleTable
          headers={['District', 'Pending Audits', 'Manual Reviews', 'Escalations', 'Action']}
          rows={
            districts.length > 0
              ? districts.map((item) => [
                  titleCase(item.scopeId),
                  Math.max(2, Math.round(item.customersServed * 0.02)).toLocaleString(),
                  Math.max(1, Math.round(item.loanRejectedCount * 0.4)).toLocaleString(),
                  Math.max(1, Math.round(item.loanRejectedCount * 0.25)).toLocaleString(),
                  item.loanRejectedCount > 0 ? 'Audit branch evidence' : 'Monitor only',
                ])
              : [['Loading', '...', '...', '...', '...']]
          }
        />
      </Panel>
    </div>
  );
}

export function AlertsPage({ session }: SessionProps) {
  return (
    <div className="page-stack">
      <Panel
        title="Loan Escalations"
        description={`Escalated loan reviews and follow-up items for ${session.branchName}.`}
      >
        <SimpleTable
          headers={['Priority', 'Loan Stage', 'Owner']}
          rows={[
            ['Critical', 'District review queue exceeded target', 'District credit desk'],
            ['High', 'Head office approval pending documents', 'Loan operations lead'],
            ['Medium', 'Customer document follow-up needed', 'Branch loan officer'],
          ]}
        />
      </Panel>
    </div>
  );
}

export function RiskMonitoringPage({
  session,
  onOpenLoan,
  onOpenKycMember,
  onOpenSupportChat,
  onOpenAuditEntity,
  onOpenNotificationCategory,
}: SessionProps & {
  onOpenLoan?: (loanId: string) => void;
  onOpenKycMember?: (memberId: string) => void;
  onOpenSupportChat?: (conversationId: string) => void;
  onOpenAuditEntity?: (entity: string) => void;
  onOpenNotificationCategory?: (category: NotificationCategory) => void;
}) {
  const { auditApi, dashboardApi, loanMonitoringApi, notificationApi, supportApi } = useAppClient();
  const scope = session.branchName === 'Head Office' ? 'institution' : session.branchName;
  const [kycItems, setKycItems] = useState<OnboardingReviewItem[]>([]);
  const [loanItems, setLoanItems] = useState<LoanQueueItem[]>([]);
  const [supportItems, setSupportItems] = useState<SupportChatSummaryItem[]>([]);
  const [auditItems, setAuditItems] = useState<AuditLogItem[]>([]);
  const [campaignItems, setCampaignItems] = useState<NotificationCampaignItem[]>([]);
  const [insuranceAlerts, setInsuranceAlerts] = useState<InsuranceAlertItem[]>([]);
  const [activeRiskFilter, setActiveRiskFilter] = useState<
    'all' | 'Critical' | 'Watch' | 'Healthy' | 'actionable'
  >('all');

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      dashboardApi.getOnboardingReviewQueue(session.role),
      loanMonitoringApi?.getPendingLoans() ?? Promise.resolve([]),
      Promise.all([
        supportApi.getOpenChats(),
        supportApi.getAssignedChats(),
        supportApi.getResolvedChats(),
      ]),
      auditApi.getByEntity(session.role),
      notificationApi.getCampaigns(),
      notificationApi.getInsuranceAlerts(),
    ]).then(([
      onboardingResult,
      loanResult,
      supportResult,
      auditResult,
      campaignResult,
      insuranceAlertResult,
    ]) => {
      if (cancelled) {
        return;
      }

      setKycItems(onboardingResult);
      setLoanItems(loanResult);
      setSupportItems([...supportResult[0], ...supportResult[1], ...supportResult[2]]);
      setAuditItems(auditResult);
      setCampaignItems(campaignResult);
      setInsuranceAlerts(insuranceAlertResult);
    });

    return () => {
      cancelled = true;
    };
  }, [auditApi, dashboardApi, loanMonitoringApi, notificationApi, session.role, supportApi]);

  const riskSignals = buildRiskSignals({
    auditItems,
    campaignItems,
    insuranceAlerts,
    kycItems,
    loanItems,
    supportItems,
  });
  const actionableSignals = riskSignals.filter(isActionableRiskSignal);
  const filteredRiskSignals =
    activeRiskFilter === 'all'
      ? riskSignals
      : activeRiskFilter === 'actionable'
        ? actionableSignals
        : riskSignals.filter((item) => item.status === activeRiskFilter);
  const topActionableRiskSignal = filteredRiskSignals.find(
    (item) => item.status !== 'Healthy' && isActionableRiskSignal(item),
  );
  const criticalSignals = riskSignals.filter((item) => item.status === 'Critical').length;
  const watchSignals = riskSignals.filter((item) => item.status === 'Watch').length;
  const healthySignals = riskSignals.filter((item) => item.status === 'Healthy').length;
  const filteredCriticalSignals = filteredRiskSignals.filter(
    (item) => item.status === 'Critical',
  ).length;
  const filteredWatchSignals = filteredRiskSignals.filter((item) => item.status === 'Watch').length;
  const filteredLoanSignals = filteredRiskSignals.filter((item) => item.area.includes('Loan')).length;
  const filteredCustomerSignals = filteredRiskSignals.filter(
    (item) => item.area.includes('KYC') || item.area.includes('Support'),
  ).length;
  const filteredActionableSignals = filteredRiskSignals.filter(isActionableRiskSignal).length;

  return (
    <div className="page-stack">
      <Panel
        title="Risk Monitoring"
        description={`Risk visibility for ${scope}, focused on loan processing, document gaps, and service escalations.`}
      >
        <p className="muted">
          This queue uses live operational signals from loan workflow, onboarding review,
          support operations, and audit activity instead of static placeholder counts.
        </p>
        <div className="dashboard-summary-strip">
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Active risk view</span>
            <strong>
              {activeRiskFilter === 'all'
                ? `All (${filteredRiskSignals.length})`
                : activeRiskFilter === 'actionable'
                  ? `Actionable Only (${filteredRiskSignals.length})`
                : `${activeRiskFilter} (${filteredRiskSignals.length})`}
            </strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Critical signals</span>
            <strong>{filteredCriticalSignals.toLocaleString()}</strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Watch signals</span>
            <strong>{filteredWatchSignals.toLocaleString()}</strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Loan risk items</span>
            <strong>{filteredLoanSignals.toLocaleString()}</strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Customer service items</span>
            <strong>{filteredCustomerSignals.toLocaleString()}</strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Actionable items</span>
            <strong>{filteredActionableSignals.toLocaleString()}</strong>
          </div>
        </div>
        <div className="loan-filter-row">
          {[
            { id: 'all', label: `All (${riskSignals.length})` },
            { id: 'Critical', label: `Critical (${criticalSignals})` },
            { id: 'Watch', label: `Watch (${watchSignals})` },
            { id: 'actionable', label: `Actionable Only (${actionableSignals.length})` },
            {
              id: 'Healthy',
              label: `Healthy (${healthySignals})`,
            },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={
                activeRiskFilter === filter.id ? 'loan-filter-chip active' : 'loan-filter-chip'
              }
              onClick={() =>
                setActiveRiskFilter(
                  filter.id as 'all' | 'Critical' | 'Watch' | 'Healthy' | 'actionable',
                )
              }
            >
              {filter.label}
            </button>
          ))}
        </div>
        {topActionableRiskSignal ? (
          <div className="loan-summary-strip">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                openRiskSignal(topActionableRiskSignal, {
                  onOpenAuditEntity,
                  onOpenKycMember,
                  onOpenLoan,
                  onOpenNotificationCategory,
                  onOpenSupportChat,
                })
              }
            >
              Open top urgent risk
            </button>
          </div>
        ) : null}
        <SimpleTable
          headers={['Priority', 'Risk area', 'Current signal', 'Status', 'Actionable', 'Recommended next step', 'Open workspace']}
          rows={filteredRiskSignals.map((item) => [
            formatRiskPriority(item.priority, item.status),
            item.area,
            item.signal,
            item.status,
            isActionableRiskSignal(item) ? 'Yes' : 'No',
            item.action,
            renderRiskActionCell(item, {
              onOpenAuditEntity,
              onOpenKycMember,
              onOpenLoan,
              onOpenNotificationCategory,
              onOpenSupportChat,
            }),
          ])}
          emptyState={{
            title: 'No risk items in this view',
            description:
              activeRiskFilter === 'all'
                ? 'There are no current operational risk signals for this scope.'
                : `There are no ${activeRiskFilter.toLowerCase()} risk signals for this scope.`,
          }}
        />
      </Panel>
    </div>
  );
}

export function SupportAnalyticsPage() {
  return (
    <div className="page-stack">
      <Panel
        title="Support Analytics"
        description="Institution-wide support volume, backlog, and escalation patterns."
      >
        <SimpleTable
          headers={['Metric', 'Current Value', 'Status']}
          rows={[
            ['Open support issues', '38', 'Watch'],
            ['Assigned chats', '24', 'Healthy'],
            ['Escalated support cases', '7', 'Needs review'],
            ['Average first response time', '4m 12s', 'On target'],
          ]}
        />
      </Panel>
    </div>
  );
}

export function NotificationsPage({ session }: SessionProps) {
  const { notificationApi } = useAppClient();
  const [items, setItems] = useState<NotificationCenterItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void notificationApi.getNotifications(session.role).then((result) => {
      if (!cancelled) {
        setItems(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [notificationApi, session.role]);

  return (
    <div className="page-stack">
      <Panel
        title="Notifications"
        description="Operational broadcasts and event notifications in the current scope."
      >
        <SimpleTable
          headers={['Type', 'User', 'Status', 'Sent At']}
          rows={
            items.length > 0
              ? items.map((item) => [
                  titleCase(item.type),
                  item.userLabel,
                  titleCase(item.status),
                  item.sentAt,
                ])
              : [['Loading', '...', '...', '...']]
          }
        />
      </Panel>
    </div>
  );
}

export function StaffSnapshotPage({ session }: SessionProps) {
  const { dashboardApi } = useAppClient();
  const [staff, setStaff] = useState<StaffRankingItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void dashboardApi.getStaffRanking(session.role).then((result) => {
      if (!cancelled) {
        setStaff(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dashboardApi, session.role]);

  return (
    <div className="page-stack">
      <Panel
        title="Staff Performance"
        description="Performance ranking for the currently visible management scope."
      >
        <SimpleTable
          headers={['Staff', 'Customers', 'Transactions', 'Score']}
          rows={
            staff.length > 0
              ? staff.map((item) => [
                  titleCase(item.staffId),
                  item.customersServed.toLocaleString(),
                  item.transactionsCount.toLocaleString(),
                  item.score.toLocaleString(),
                ])
              : [['Loading', '...', '...', '...']]
          }
        />
      </Panel>
    </div>
  );
}

function titleCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildRiskSignals({
  auditItems,
  campaignItems,
  insuranceAlerts,
  kycItems,
  loanItems,
  supportItems,
}: {
  auditItems: AuditLogItem[];
  campaignItems: NotificationCampaignItem[];
  insuranceAlerts: InsuranceAlertItem[];
  kycItems: OnboardingReviewItem[];
  loanItems: LoanQueueItem[];
  supportItems: SupportChatSummaryItem[];
}) {
  const highValueLoans = loanItems.filter((item) => item.amount >= 20000000);
  const correctionLoans = loanItems.filter((item) => item.deficiencyReasons.length > 0);
  const kycNeedsAction = kycItems.filter(
    (item) => item.onboardingReviewStatus === 'needs_action',
  );
  const kycInReview = kycItems.filter(
    (item) => item.onboardingReviewStatus === 'review_in_progress',
  );
  const escalatedSupport = supportItems.filter(
    (item) => item.escalationFlag || item.priority === 'high',
  );
  const unreadSupport = supportItems.filter((item) => item.status === 'open');
  const governanceAudit = auditItems.filter((item) => item.action.includes('vote'));
  const profileAudit = auditItems.filter((item) => item.action.includes('profile'));
  const failedLoanCampaigns = campaignItems.filter(
    (item) => item.category === 'loan' && item.status === 'failed',
  );
  const failedKycCampaigns = campaignItems.filter(
    (item) => item.category === 'kyc' && item.status === 'failed',
  );
  const failedAutopayCampaigns = campaignItems.filter(
    (item) => item.category === 'autopay' && item.status === 'failed',
  );
  const activeInsuranceAlerts = insuranceAlerts.filter((item) => item.requiresManagerAction);

  return [
    {
      area: 'Loan Approval Risk',
      signal: `${highValueLoans.length} high-value loans pending decision`,
      status: highValueLoans.length > 0 ? 'Critical' : 'Healthy',
      action:
        highValueLoans.length > 0
          ? 'Escalate senior credit review and clear oldest approval-ready cases first.'
          : 'No elevated approval pressure detected.',
      priority: highValueLoans.length > 0 ? 0 : 7,
      targetLoanId: highValueLoans[0]?.loanId,
      targetLabel: highValueLoans.length > 0 ? 'Open approval queue' : 'No active case',
    },
    {
      area: 'Loan Document Risk',
      signal: `${correctionLoans.length} loans need document correction`,
      status:
        correctionLoans.length >= 3
          ? 'Critical'
          : correctionLoans.length > 0
            ? 'Watch'
            : 'Healthy',
      action:
        correctionLoans.length > 0
          ? 'Drive correction follow-up and verify missing document reasons are explicit.'
          : 'No correction-heavy loan queue detected.',
      priority: correctionLoans.length >= 3 ? 1 : correctionLoans.length > 0 ? 3 : 8,
      targetLoanId: correctionLoans[0]?.loanId,
      targetLabel: correctionLoans.length > 0 ? 'Open correction case' : 'No active case',
    },
    {
      area: 'KYC Exception Risk',
      signal: `${kycNeedsAction.length} onboarding packages need customer action`,
      status: kycNeedsAction.length > 0 ? 'Critical' : 'Healthy',
      action:
        kycNeedsAction.length > 0
          ? 'Push customer correction reminders and keep sensitive services blocked until approval.'
          : 'No outstanding KYC correction queue detected.',
      priority: kycNeedsAction.length > 0 ? 2 : 9,
      targetMemberId: kycNeedsAction[0]?.memberId,
      targetLabel: kycNeedsAction.length > 0 ? 'Open KYC queue' : 'No active case',
    },
    {
      area: 'KYC Review Backlog',
      signal: `${kycInReview.length} onboarding packages are still in active review`,
      status: kycInReview.length >= 3 ? 'Watch' : 'Healthy',
      action:
        kycInReview.length > 0
          ? 'Clear aging review items before they affect service enablement.'
          : 'Active review queue is within normal bounds.',
      priority: kycInReview.length >= 3 ? 4 : 10,
      targetMemberId: kycInReview[0]?.memberId,
      targetLabel: kycInReview.length > 0 ? 'Open review queue' : 'No active case',
    },
    {
      area: 'Support Escalation Risk',
      signal: `${escalatedSupport.length} chats are escalated or high priority`,
      status: escalatedSupport.length > 0 ? 'Critical' : 'Healthy',
      action:
        escalatedSupport.length > 0
          ? 'Route manager attention to escalated conversations and SLA-risk chats.'
          : 'No escalated support pressure detected.',
      priority: escalatedSupport.length > 0 ? 2 : 11,
      targetConversationId: escalatedSupport[0]?.conversationId,
      targetLabel: escalatedSupport.length > 0 ? 'Open escalated chat' : 'No active case',
    },
    {
      area: 'Loan Reminder Delivery Risk',
      signal: `${failedLoanCampaigns.length} loan reminder campaigns failed delivery`,
      status: failedLoanCampaigns.length > 0 ? 'Watch' : 'Healthy',
      action:
        failedLoanCampaigns.length > 0
          ? 'Review loan reminder delivery failures before repayment alerts are missed.'
          : 'No loan reminder delivery failures detected.',
      priority: failedLoanCampaigns.length > 0 ? 5 : 12,
      targetNotificationCategory: failedLoanCampaigns.length > 0 ? 'loan' : undefined,
      targetLabel:
        failedLoanCampaigns.length > 0 ? 'Open loan reminders' : 'No active case',
    },
    {
      area: 'Insurance Renewal Risk',
      signal: `${activeInsuranceAlerts.length} insurance alerts need manager action`,
      status: activeInsuranceAlerts.length > 0 ? 'Watch' : 'Healthy',
      action:
        activeInsuranceAlerts.length > 0
          ? 'Review insurance renewal pressure before linked loan protection lapses.'
          : 'No insurance renewal exceptions detected.',
      priority: activeInsuranceAlerts.length > 0 ? 5 : 12,
      targetNotificationCategory: activeInsuranceAlerts.length > 0 ? 'insurance' : undefined,
      targetLabel:
        activeInsuranceAlerts.length > 0 ? 'Open insurance alerts' : 'No active case',
    },
    {
      area: 'KYC Reminder Delivery Risk',
      signal: `${failedKycCampaigns.length} KYC reminder campaigns failed delivery`,
      status: failedKycCampaigns.length > 0 ? 'Watch' : 'Healthy',
      action:
        failedKycCampaigns.length > 0
          ? 'Review KYC reminder delivery failures before onboarding cases go stale.'
          : 'No KYC reminder delivery failures detected.',
      priority: failedKycCampaigns.length > 0 ? 5 : 12,
      targetNotificationCategory: failedKycCampaigns.length > 0 ? 'kyc' : undefined,
      targetLabel: failedKycCampaigns.length > 0 ? 'Open KYC reminders' : 'No active case',
    },
    {
      area: 'AutoPay Reminder Delivery Risk',
      signal: `${failedAutopayCampaigns.length} AutoPay reminder campaigns failed delivery`,
      status: failedAutopayCampaigns.length > 0 ? 'Watch' : 'Healthy',
      action:
        failedAutopayCampaigns.length > 0
          ? 'Review AutoPay failure reminders before recurring-payment exceptions increase.'
          : 'No AutoPay reminder delivery failures detected.',
      priority: failedAutopayCampaigns.length > 0 ? 5 : 12,
      targetNotificationCategory: failedAutopayCampaigns.length > 0 ? 'autopay' : undefined,
      targetLabel:
        failedAutopayCampaigns.length > 0 ? 'Open AutoPay reminders' : 'No active case',
    },
    {
      area: 'Support Backlog Risk',
      signal: `${unreadSupport.length} support chats remain open`,
      status: unreadSupport.length >= 5 ? 'Watch' : 'Healthy',
      action:
        unreadSupport.length > 0
          ? 'Triage unread conversations before they become escalations.'
          : 'Unread support queue is under control.',
      priority: unreadSupport.length >= 5 ? 5 : 12,
      targetConversationId: unreadSupport[0]?.conversationId,
      targetLabel: unreadSupport.length > 0 ? 'Open unread chat' : 'No active case',
    },
    {
      area: 'Governance Audit Risk',
      signal: `${governanceAudit.length} governance audit events need review`,
      status: governanceAudit.length > 0 ? 'Watch' : 'Healthy',
      action:
        governanceAudit.length > 0
          ? 'Review voting activity and verify governance lifecycle controls remain intact.'
          : 'No governance audit exceptions detected.',
      priority: governanceAudit.length > 0 ? 6 : 13,
      targetAuditEntity: governanceAudit[0]?.entity,
      targetLabel: governanceAudit.length > 0 ? 'Open audit trail' : 'No active case',
    },
    {
      area: 'Profile Change Audit Risk',
      signal: `${profileAudit.length} profile-change audit events were recorded`,
      status: profileAudit.length > 0 ? 'Watch' : 'Healthy',
      action:
        profileAudit.length > 0
          ? 'Inspect recent profile-change evidence for sensitive customer updates.'
          : 'No elevated profile-change audit activity detected.',
      priority: profileAudit.length > 0 ? 6 : 14,
      targetAuditEntity: profileAudit[0]?.entity,
      targetLabel: profileAudit.length > 0 ? 'Open audit trail' : 'No active case',
    },
  ].sort((left, right) => left.priority - right.priority);
}

function renderRiskActionCell(
  item: ReturnType<typeof buildRiskSignals>[number],
  handlers: {
    onOpenLoan?: (loanId: string) => void;
    onOpenKycMember?: (memberId: string) => void;
    onOpenSupportChat?: (conversationId: string) => void;
    onOpenAuditEntity?: (entity: string) => void;
    onOpenNotificationCategory?: (category: NotificationCategory) => void;
  },
) {
  if (item.targetLoanId && handlers.onOpenLoan) {
    return (
      <button
        type="button"
        className="loan-watchlist-link"
        onClick={() => handlers.onOpenLoan?.(item.targetLoanId!)}
      >
        {item.targetLabel}
      </button>
    );
  }

  if (item.targetMemberId && handlers.onOpenKycMember) {
    return (
      <button
        type="button"
        className="loan-watchlist-link"
        onClick={() => handlers.onOpenKycMember?.(item.targetMemberId!)}
      >
        {item.targetLabel}
      </button>
    );
  }

  if (item.targetConversationId && handlers.onOpenSupportChat) {
    return (
      <button
        type="button"
        className="loan-watchlist-link"
        onClick={() => handlers.onOpenSupportChat?.(item.targetConversationId!)}
      >
        {item.targetLabel}
      </button>
    );
  }

  if (item.targetAuditEntity && handlers.onOpenAuditEntity) {
    return (
      <button
        type="button"
        className="loan-watchlist-link"
        onClick={() => handlers.onOpenAuditEntity?.(item.targetAuditEntity!)}
      >
        {item.targetLabel}
      </button>
    );
  }

  if (item.targetNotificationCategory && handlers.onOpenNotificationCategory) {
    return (
      <button
        type="button"
        className="loan-watchlist-link"
        onClick={() =>
          handlers.onOpenNotificationCategory?.(
            item.targetNotificationCategory as NotificationCategory,
          )
        }
      >
        {item.targetLabel}
      </button>
    );
  }

  return <span className="muted">{item.targetLabel}</span>;
}

function isActionableRiskSignal(item: ReturnType<typeof buildRiskSignals>[number]) {
  return Boolean(
    item.targetLoanId ||
      item.targetMemberId ||
      item.targetConversationId ||
      item.targetAuditEntity ||
      item.targetNotificationCategory,
  );
}

function openRiskSignal(
  item: ReturnType<typeof buildRiskSignals>[number],
  handlers: {
    onOpenLoan?: (loanId: string) => void;
    onOpenKycMember?: (memberId: string) => void;
    onOpenSupportChat?: (conversationId: string) => void;
    onOpenAuditEntity?: (entity: string) => void;
    onOpenNotificationCategory?: (category: NotificationCategory) => void;
  },
) {
  if (item.targetLoanId) {
    handlers.onOpenLoan?.(item.targetLoanId);
    return;
  }

  if (item.targetMemberId) {
    handlers.onOpenKycMember?.(item.targetMemberId);
    return;
  }

  if (item.targetConversationId) {
    handlers.onOpenSupportChat?.(item.targetConversationId);
    return;
  }

  if (item.targetAuditEntity) {
    handlers.onOpenAuditEntity?.(item.targetAuditEntity);
    return;
  }

  if (item.targetNotificationCategory) {
    handlers.onOpenNotificationCategory?.(
      item.targetNotificationCategory as NotificationCategory,
    );
  }
}

function formatRiskPriority(priority: number, status: string) {
  if (status === 'Critical') {
    return `P${priority + 1} Critical`;
  }

  if (status === 'Watch') {
    return `P${priority + 1} Watch`;
  }

  return `P${priority + 1} Healthy`;
}
