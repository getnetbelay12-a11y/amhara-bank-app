import { useEffect, useState } from 'react';

import {
  AdminRole,
  canManageVoting,
  canViewAudit,
  getDefaultSessionSection,
  getManagerConsoleKind,
  getSessionConsoleBasePath,
  getSessionRoleLabel,
  getSessionScopeLabel,
  isSchoolSession,
  type AppSession,
} from '../../core/session';
import { AuditLogViewerPage } from '../audit/AuditLogViewerPage';
import { BranchAnalyticsPage } from '../branch-analytics/BranchAnalyticsPage';
import { DistrictAnalyticsPage } from '../district-analytics/DistrictAnalyticsPage';
import { BranchManagerDashboardPage } from '../branch-dashboard/BranchManagerDashboardPage';
import { CardOperationsPage } from '../cards/CardOperationsPage';
import { DistrictManagerDashboardPage } from '../district-dashboard/DistrictManagerDashboardPage';
import { HeadOfficeManagerDashboardPage } from '../head-office-dashboard/HeadOfficeManagerDashboardPage';
import { LoanMonitoringPage } from '../loan-monitoring/LoanMonitoringPage';
import { AutopayOperationsPage } from '../notifications/AutopayOperationsPage';
import { ManagerNotificationCenterPage } from '../notifications/ManagerNotificationCenterPage';
import { PaymentDisputesPage } from '../payments/PaymentDisputesPage';
import { PaymentOperationsPage } from '../payments/PaymentOperationsPage';
import { SchoolConsolePage } from '../school-console/SchoolConsolePage';
import { FloatingSupportChatLauncher } from '../support/FloatingSupportChatLauncher';
import { ServiceRequestsPage } from '../service-requests/ServiceRequestsPage';
import { SupportInboxPage } from '../support/SupportInboxPage';
import {
  AlertsPage,
  BranchOverviewPage,
  KycAuditPage,
  KycVerificationPage,
  MembersPage,
  RiskMonitoringPage,
  ReportsHubPage,
  StaffSnapshotPage,
  SupportAnalyticsPage,
} from '../manager-pages/ManagerPageSections';
import type { NotificationCategory } from '../../core/api/contracts';
import {
  getConsoleDefinition,
  type ConsoleNavKey,
  type ConsoleNavItem,
} from '../shared-layout/consoleConfig';
import { VotingManagementPage } from '../voting/VotingManagementPage';

type DashboardShellProps = {
  session: AppSession;
  initialActive?: ConsoleNavKey;
  onLogout?: () => void;
};

export function DashboardShell({
  session,
  initialActive,
  onLogout,
}: DashboardShellProps) {
  const schoolSession = isSchoolSession(session);
  type EntryContext =
    | 'dashboard'
    | 'risk'
    | 'autopayOps'
    | 'audit'
    | 'notifications'
    | null;
  const consoleDefinition = getConsoleDefinition(session);
  const [active, setActive] = useState<ConsoleNavKey>(() => {
    if (
      initialActive &&
      consoleDefinition.navItems.some((item) => item.key === initialActive)
    ) {
      return initialActive;
    }

    return (
      consoleDefinition.navItems.find(
        (item) => item.key === (getDefaultSessionSection(session) as ConsoleNavKey),
      )?.key ?? consoleDefinition.navItems[0]?.key ?? 'dashboard'
    );
  });
  const activeItem =
    consoleDefinition.navItems.find((item) => item.key === active) ??
    consoleDefinition.navItems[0];
  const consoleKind = isSchoolSession(session)
    ? 'school'
    : getManagerConsoleKind(session.role);
  const navSections = buildNavSections(consoleDefinition.navItems);
  const [selectedLoanId, setSelectedLoanId] = useState<string | undefined>(undefined);
  const [selectedSupportConversationId, setSelectedSupportConversationId] = useState<
    string | undefined
  >(undefined);
  const [selectedNotificationCategory, setSelectedNotificationCategory] = useState<
    NotificationCategory | undefined
  >(undefined);
  const [selectedKycMemberId, setSelectedKycMemberId] = useState<string | undefined>(undefined);
  const [selectedVoteId, setSelectedVoteId] = useState<string | undefined>(undefined);
  const [selectedAuditEntity, setSelectedAuditEntity] = useState<string | undefined>(undefined);
  const [selectedAuditEntityType, setSelectedAuditEntityType] = useState<string | undefined>(
    undefined,
  );
  const [selectedAuditEntityId, setSelectedAuditEntityId] = useState<string | undefined>(
    undefined,
  );
  const [selectedAutopayOperationId, setSelectedAutopayOperationId] = useState<string | undefined>(undefined);
  const [selectedPaymentMemberId, setSelectedPaymentMemberId] = useState<string | undefined>(
    undefined,
  );
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<
    'all' | 'qr_payment' | 'school_payment' | 'payment_dispute' | 'failed_transfer'
  >('all');
  const [loanEntryContext, setLoanEntryContext] = useState<EntryContext>(null);
  const [supportEntryContext, setSupportEntryContext] = useState<EntryContext>(null);
  const [notificationEntryContext, setNotificationEntryContext] = useState<EntryContext>(null);
  const [autopayEntryContext, setAutopayEntryContext] = useState<EntryContext>(null);
  const [kycEntryContext, setKycEntryContext] = useState<EntryContext>(null);
  const [votingEntryContext, setVotingEntryContext] = useState<EntryContext>(null);
  const [auditEntryContext, setAuditEntryContext] = useState<EntryContext>(null);
  const brandEyebrow = schoolSession ? 'School Console' : 'Amhara Bank';
  const brandSignature = schoolSession ? 'SCHOOL OPERATIONS' : 'AMHARA BANK';
  const sidebarFooterCopy = schoolSession
    ? 'School-side registry, billing, collections, and onboarding.'
    : 'Live bank operations by role and scope.';
  const searchPlaceholder = schoolSession
    ? 'Search students, invoices, receipts'
    : 'Search customers, loans, chats';
  const searchLabel = schoolSession
    ? 'Search students, invoices, receipts'
    : 'Search customers, loans, chats';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const sectionPath = resolveConsolePath(session, active);
    if (window.location.pathname !== sectionPath) {
      window.history.replaceState({}, '', sectionPath);
    }
  }, [active, session]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-header">
            <div className="brand-mark" aria-hidden="true">
              <img src="/amhara-bank-logo.png?v=20260316" alt="Amhara Bank logo" className="brand-logo" />
            </div>
            <div className="brand-copy">
              <p className="eyebrow">{brandEyebrow}</p>
              <h1>{consoleDefinition.title}</h1>
              <div className="brand-signature">{brandSignature}</div>
            </div>
          </div>
          <p className="brand-subtitle muted">{consoleDefinition.subtitle}</p>
        </div>

        <nav className="sidebar-nav" aria-label="Manager navigation">
          {navSections.map((section) => (
            <div key={section.label} className="nav-group">
              <p className="sidebar-label">{section.label}</p>
              <div className="nav-list">
                {section.items.map((item) => {
                  const isActive = item.key === active;

                  return (
                    <button
                      key={item.key}
                      className={isActive ? 'nav-item active' : 'nav-item'}
                      onClick={() => {
                        setActive(item.key);
                        if (item.key === 'audit') {
                          setSelectedAuditEntity(undefined);
                          setSelectedAuditEntityType(undefined);
                          setSelectedAuditEntityId(undefined);
                        }
                        setLoanEntryContext(null);
                        setSupportEntryContext(null);
                        setNotificationEntryContext(null);
                        setAutopayEntryContext(null);
                        setKycEntryContext(null);
                        setVotingEntryContext(null);
                        setAuditEntryContext(null);
                      }}
                      type="button"
                    >
                      <span className="nav-item-icon" aria-hidden="true">
                        {getNavIcon(item.key)}
                      </span>
                      <span className="nav-item-copy">
                        <span className="nav-item-label">{item.label}</span>
                        <span className="nav-item-description">{item.description}</span>
                      </span>
                      <span className="nav-item-chevron" aria-hidden="true">
                        {'>'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="muted">{sidebarFooterCopy}</p>
          {onLogout ? (
            <button className="nav-item nav-item-logout" onClick={onLogout} type="button">
              <span className="nav-item-icon" aria-hidden="true">
                <span className="nav-item-icon-dot danger" />
              </span>
              <span className="nav-item-copy">
                <span className="nav-item-label">Sign Out</span>
              </span>
              <span className="nav-item-chevron" aria-hidden="true">
                {'>'}
              </span>
            </button>
          ) : null}
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="topbar-heading">
            <p className="eyebrow">{consoleDefinition.summaryLabel}</p>
            <h2>{activeItem.label}</h2>
            <p className="muted">{activeItem.description}</p>
          </div>
          <div className="topbar-actions">
            <label className="topbar-search">
              <span className="topbar-search-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                placeholder={searchPlaceholder}
                aria-label={searchLabel}
              />
            </label>
            <button
              type="button"
              className="topbar-alert-button"
              onClick={() => setActive('notifications')}
              aria-label="Open notifications"
            >
              <span aria-hidden="true">🔔</span>
              <span className="topbar-alert-label">Notifications</span>
              <span className="topbar-alert-badge">New</span>
            </button>
            <div className="topbar-user-block">
              <strong>{session.fullName}</strong>
              <div className="topbar-meta-row">
                <span className="topbar-pill">{getSessionRoleLabel(session)}</span>
                <span className="topbar-pill subtle">{getSessionScopeLabel(session)}</span>
              </div>
            </div>
          </div>
        </header>

        {!schoolSession && active === 'dashboard' && consoleKind === 'branch' ? (
          <BranchManagerDashboardPage
            session={session}
            onOpenLoan={(loanId) => {
              setSelectedLoanId(loanId);
              setLoanEntryContext('dashboard');
              setActive('loans');
            }}
            onOpenSupportChat={(conversationId) => {
              setSelectedSupportConversationId(conversationId);
              setSupportEntryContext('dashboard');
              setActive('support');
            }}
            onOpenAutopayOperation={(operationId) => {
              setSelectedAutopayOperationId(operationId);
              setAutopayEntryContext('dashboard');
              setActive('autopayOps');
            }}
            onOpenNotificationCategory={(category) => {
              setSelectedNotificationCategory(category);
              setNotificationEntryContext('dashboard');
              setActive('notifications');
            }}
            onOpenKycMember={(memberId) => {
              setSelectedKycMemberId(memberId);
              setKycEntryContext('dashboard');
              setActive('kyc');
            }}
          />
        ) : null}
        {!schoolSession && active === 'dashboard' && consoleKind === 'district' ? (
          <DistrictManagerDashboardPage
            session={session}
            onOpenLoan={(loanId) => {
              setSelectedLoanId(loanId);
              setLoanEntryContext('dashboard');
              setActive('loans');
            }}
            onOpenSupportChat={(conversationId) => {
              setSelectedSupportConversationId(conversationId);
              setSupportEntryContext('dashboard');
              setActive('support');
            }}
            onOpenAutopayOperation={(operationId) => {
              setSelectedAutopayOperationId(operationId);
              setAutopayEntryContext('dashboard');
              setActive('autopayOps');
            }}
            onOpenNotificationCategory={(category) => {
              setSelectedNotificationCategory(category);
              setNotificationEntryContext('dashboard');
              setActive('notifications');
            }}
            onOpenKycMember={(memberId) => {
              setSelectedKycMemberId(memberId);
              setKycEntryContext('dashboard');
              setActive('kyc');
            }}
          />
        ) : null}
        {!schoolSession && active === 'dashboard' && consoleKind === 'head_office' ? (
          <HeadOfficeManagerDashboardPage
            session={session}
            onOpenLoan={(loanId) => {
              setSelectedLoanId(loanId);
              setLoanEntryContext('dashboard');
              setActive('loans');
            }}
            onOpenLoansWorkspace={() => {
              setLoanEntryContext('dashboard');
              setActive('loans');
            }}
            onOpenSupportChat={(conversationId) => {
              setSelectedSupportConversationId(conversationId);
              setSupportEntryContext('dashboard');
              setActive('support');
            }}
            onOpenSupportWorkspace={() => {
              setSupportEntryContext('dashboard');
              setActive('support');
            }}
            onOpenAutopayOperation={(operationId) => {
              setSelectedAutopayOperationId(operationId);
              setAutopayEntryContext('dashboard');
              setActive('autopayOps');
            }}
            onOpenNotificationCategory={(category) => {
              setSelectedNotificationCategory(category);
              setNotificationEntryContext('dashboard');
              setActive('notifications');
            }}
            onOpenKycMember={(memberId) => {
              setSelectedKycMemberId(memberId);
              setKycEntryContext('dashboard');
              setActive('kyc');
            }}
            onOpenVote={(voteId) => {
              setSelectedVoteId(voteId);
              setVotingEntryContext('dashboard');
              setActive('voting');
            }}
            onOpenAuditEntity={(entity) => {
              setSelectedAuditEntityType(undefined);
              setSelectedAuditEntityId(undefined);
              setSelectedAuditEntity(entity);
              setAuditEntryContext('dashboard');
              setActive('audit');
            }}
            onOpenAuditWorkspace={() => {
              setSelectedAuditEntity(undefined);
              setSelectedAuditEntityType(undefined);
              setSelectedAuditEntityId(undefined);
              setAuditEntryContext('dashboard');
              setActive('audit');
            }}
            onOpenRisk={() => {
              setActive('risk');
            }}
          />
        ) : null}
        {active === 'schoolConsole' ? <SchoolConsolePage session={session} /> : null}
        {!schoolSession && active === 'members' ? <MembersPage session={session} /> : null}
        {!schoolSession && active === 'loans' ? (
          <LoanMonitoringPage
            initialLoanId={selectedLoanId}
            returnContextLabel={resolveReturnContextLabel(loanEntryContext, session)}
            onReturnToContext={
              loanEntryContext
                ? () => {
                    setActive(
                      loanEntryContext === 'dashboard'
                        ? 'dashboard'
                        : loanEntryContext === 'audit'
                          ? 'audit'
                          : 'risk',
                    );
                  }
                : undefined
            }
          />
        ) : null}
        {!schoolSession && active === 'autopayOps' ? (
          <AutopayOperationsPage
            initialOperationId={selectedAutopayOperationId}
            onOpenAuditEntity={(entityType, entityId) => {
              setSelectedAuditEntityType(entityType);
              setSelectedAuditEntityId(entityId);
              setSelectedAuditEntity(`${entityType}:${entityId}`);
              setAuditEntryContext('autopayOps');
              setActive('audit');
            }}
            onOpenNotificationCategory={(category) => {
              setSelectedNotificationCategory(category);
              setNotificationEntryContext('autopayOps');
              setActive('notifications');
            }}
            onReturnToContext={
              autopayEntryContext
                ? () => {
                    setActive(
                      autopayEntryContext === 'dashboard'
                        ? 'dashboard'
                        : autopayEntryContext === 'audit'
                          ? 'audit'
                          : 'risk',
                    );
                  }
                : undefined
            }
            returnContextLabel={resolveReturnContextLabel(autopayEntryContext, session)}
            session={session}
          />
        ) : null}
        {!schoolSession && active === 'kyc' ? (
          <KycVerificationPage
            initialMemberId={selectedKycMemberId}
            onReturnToContext={
              kycEntryContext
                ? () => {
                    setActive(
                      kycEntryContext === 'dashboard'
                        ? 'dashboard'
                        : kycEntryContext === 'audit'
                          ? 'audit'
                          : 'risk',
                    );
                  }
                : undefined
            }
            returnContextLabel={resolveReturnContextLabel(kycEntryContext, session)}
            session={session}
          />
        ) : null}
        {!schoolSession && active === 'staff' ? <StaffSnapshotPage session={session} /> : null}
        {!schoolSession && active === 'branches' ? <BranchOverviewPage session={session} /> : null}
        {!schoolSession && active === 'loanEscalations' ? <AlertsPage session={session} /> : null}
        {!schoolSession && active === 'kycAudits' ? <KycAuditPage session={session} /> : null}
        {!schoolSession && active === 'districtAnalytics' ? <DistrictAnalyticsPage session={session} /> : null}
        {!schoolSession && active === 'risk' ? (
          <RiskMonitoringPage
            onOpenAuditEntity={(entity) => {
              setSelectedAuditEntityType(undefined);
              setSelectedAuditEntityId(undefined);
              setSelectedAuditEntity(entity);
              setAuditEntryContext('risk');
              setActive('audit');
            }}
            onOpenKycMember={(memberId) => {
              setSelectedKycMemberId(memberId);
              setKycEntryContext('risk');
              setActive('kyc');
            }}
            onOpenLoan={(loanId) => {
              setSelectedLoanId(loanId);
              setLoanEntryContext('risk');
              setActive('loans');
            }}
            onOpenNotificationCategory={(category) => {
              setSelectedNotificationCategory(category);
              setNotificationEntryContext('risk');
              setActive('notifications');
            }}
            onOpenSupportChat={(conversationId) => {
              setSelectedSupportConversationId(conversationId);
              setSupportEntryContext('risk');
              setActive('support');
            }}
            session={session}
          />
        ) : null}
        {!schoolSession && active === 'notifications' ? (
          <ManagerNotificationCenterPage
            initialCategory={selectedNotificationCategory}
            onOpenPaymentReceipts={({ memberId, filter }) => {
              setSelectedPaymentMemberId(memberId);
              setSelectedPaymentFilter(filter);
              setNotificationEntryContext('notifications');
              setActive('paymentOps');
            }}
            onReturnToContext={
              notificationEntryContext
                ? () => {
                    setActive(
                      notificationEntryContext === 'dashboard'
                        ? 'dashboard'
                        : notificationEntryContext === 'autopayOps'
                          ? 'autopayOps'
                          : notificationEntryContext === 'audit'
                            ? 'audit'
                          : 'risk',
                    );
                  }
                : undefined
            }
            returnContextLabel={resolveReturnContextLabel(notificationEntryContext, session)}
            session={session}
          />
        ) : null}
        {!schoolSession && active === 'serviceRequests' ? <ServiceRequestsPage session={session} /> : null}
        {!schoolSession && active === 'paymentOps' ? (
          <PaymentOperationsPage
            session={session}
            initialMemberId={selectedPaymentMemberId}
            initialFilter={selectedPaymentFilter}
            returnContextLabel={
              notificationEntryContext === 'notifications' ? 'Notification Center' : undefined
            }
            onReturnToContext={
              notificationEntryContext === 'notifications'
                ? () => {
                    setActive('notifications');
                    setNotificationEntryContext(null);
                  }
                : undefined
            }
          />
        ) : null}
        {!schoolSession && active === 'paymentDisputes' ? <PaymentDisputesPage session={session} /> : null}
        {!schoolSession && active === 'cardOps' ? <CardOperationsPage session={session} /> : null}
        {!schoolSession && active === 'support' ? (
          <SupportInboxPage
            initialConversationId={selectedSupportConversationId}
            returnContextLabel={resolveReturnContextLabel(supportEntryContext, session)}
            onReturnToContext={
              supportEntryContext
                ? () => {
                    setActive(
                      supportEntryContext === 'dashboard'
                        ? 'dashboard'
                        : supportEntryContext === 'audit'
                          ? 'audit'
                          : 'risk',
                    );
                  }
                : undefined
            }
          />
        ) : null}
        {!schoolSession && active === 'reports' ? <ReportsHubPage session={session} /> : null}
        {!schoolSession && active === 'supportAnalytics' ? <SupportAnalyticsPage /> : null}
        {!schoolSession && active === 'voting' && canManageVoting(session.role) ? (
          <VotingManagementPage
            initialVoteId={selectedVoteId}
            onReturnToContext={
              votingEntryContext
                ? () => {
                    setActive(votingEntryContext === 'dashboard' ? 'dashboard' : 'risk');
                  }
                : undefined
            }
            returnContextLabel={resolveReturnContextLabel(votingEntryContext, session)}
            session={session}
          />
        ) : null}
        {!schoolSession && active === 'audit' && canViewAudit(session.role) ? (
          <AuditLogViewerPage
            initialEntity={selectedAuditEntity}
            initialEntityId={selectedAuditEntityId}
            initialEntityType={selectedAuditEntityType}
            onOpenAutopayOperation={(operationId) => {
              setSelectedAutopayOperationId(operationId);
              setAutopayEntryContext('audit');
              setActive('autopayOps');
            }}
            onOpenKycMember={(memberId) => {
              setSelectedKycMemberId(memberId);
              setKycEntryContext('audit');
              setActive('kyc');
            }}
            onOpenLoan={(loanId) => {
              setSelectedLoanId(loanId);
              setLoanEntryContext('audit');
              setActive('loans');
            }}
            onOpenNotificationCategory={(category) => {
              setSelectedNotificationCategory(category);
              setNotificationEntryContext('audit');
              setActive('notifications');
            }}
            onOpenSupportChat={(conversationId) => {
              setSelectedSupportConversationId(conversationId);
              setSupportEntryContext('audit');
              setActive('support');
            }}
            onReturnToContext={
              auditEntryContext
                ? () => {
                    setActive(
                      auditEntryContext === 'dashboard'
                        ? 'dashboard'
                        : auditEntryContext === 'autopayOps'
                          ? 'autopayOps'
                          : 'risk',
                    );
                  }
                : undefined
            }
            returnContextLabel={resolveReturnContextLabel(auditEntryContext, session)}
            session={session}
          />
        ) : null}
        {!schoolSession && active === 'supportAnalytics' ? <SupportAnalyticsPage /> : null}
        <FloatingSupportChatLauncher />
      </main>
    </div>
  );
}

export function ShellPreview() {
  return (
    <DashboardShell
      session={{
        sessionType: 'admin',
        userId: 'demo',
        fullName: 'Lulit Mekonnen',
        role: AdminRole.HEAD_OFFICE_DIRECTOR,
        branchName: 'Head Office',
        permissions: ['dashboard.institution', 'analytics.district'],
      }}
    />
  );
}

export function LoginPreview() {
  return null;
}

function buildNavSections(items: ConsoleNavItem[]) {
  return [
    {
      label: 'Command center',
      items,
    },
  ] as Array<{ label: string; items: ConsoleNavItem[] }>;
}

function resolveReturnContextLabel(
  context: 'dashboard' | 'risk' | 'autopayOps' | 'audit' | 'notifications' | null,
  session: AppSession,
) {
  if (context === 'dashboard') {
    return `${getSessionScopeLabel(session)} dashboard`;
  }

  if (context === 'autopayOps') {
    return `${getSessionScopeLabel(session)} AutoPay operations`;
  }

  if (context === 'risk') {
    return `${getSessionScopeLabel(session)} risk queue`;
  }

  if (context === 'audit') {
    return `${getSessionScopeLabel(session)} audit queue`;
  }

  if (context === 'notifications') {
    return 'Notification Center';
  }

  return undefined;
}

function getNavIcon(key: ConsoleNavKey) {
  const icons: Record<ConsoleNavKey, string> = {
    dashboard: 'DB',
    schoolConsole: 'SC',
    members: 'MB',
    loans: 'LN',
    autopayOps: 'AP',
    kyc: 'KY',
    notifications: 'NT',
    serviceRequests: 'SR',
    paymentOps: 'PO',
    paymentDisputes: 'PD',
    cardOps: 'CO',
    support: 'SP',
    reports: 'RP',
    branches: 'BR',
    loanEscalations: 'LE',
    kycAudits: 'KA',
    districtAnalytics: 'DA',
    risk: 'RM',
    voting: 'VG',
    audit: 'AL',
    supportAnalytics: 'SA',
    staff: 'ST',
  };

  return icons[key];
}

function resolveConsolePath(session: AppSession, active: ConsoleNavKey) {
  const basePath = getSessionConsoleBasePath(session);
  const routeSegment = routeSegments[active] ?? active;
  return `${basePath}/${routeSegment}`;
}

const routeSegments: Partial<Record<ConsoleNavKey, string>> = {
  dashboard: 'dashboard',
  schoolConsole: 'school-console',
  support: 'support',
  notifications: 'notifications',
  paymentOps: 'payment-operations',
  loans: 'loans',
  districtAnalytics: 'district-analytics',
  risk: 'risk',
  voting: 'voting',
  audit: 'audit',
  reports: 'reports',
  branches: 'branches',
  kyc: 'kyc',
  staff: 'staff',
};
