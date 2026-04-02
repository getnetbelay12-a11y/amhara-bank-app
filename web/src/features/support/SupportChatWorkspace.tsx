import { useEffect, useMemo, useState } from 'react';

import { useAppClient } from '../../app/AppContext';
import type {
  SupportChatDetail,
  SupportChatSummaryItem,
} from '../../core/api/contracts';
import { ConsoleKpiStrip } from '../../shared/components/ConsoleKpiStrip';
import { CriticalActionStrip } from '../../shared/components/CriticalActionStrip';
import {
  DashboardGrid,
  DashboardMetricRow,
  DashboardPage,
  DashboardSectionCard,
} from '../../shared/components/BankingDashboard';

type SupportChatWorkspaceProps = {
  variant?: 'page' | 'panel';
  onUnreadChange?: (count: number) => void;
  selectedMemberId?: string;
  selectedConversationId?: string;
  returnContextLabel?: string;
  onReturnToContext?: () => void;
};

type SupportQueueFilter = 'all' | 'unread' | 'sla_risk' | 'escalated';

export function SupportChatWorkspace({
  variant = 'page',
  onUnreadChange,
  selectedMemberId,
  selectedConversationId,
  returnContextLabel,
  onReturnToContext,
}: SupportChatWorkspaceProps) {
  const { supportApi } = useAppClient();
  const [openChats, setOpenChats] = useState<SupportChatSummaryItem[]>([]);
  const [assignedChats, setAssignedChats] = useState<SupportChatSummaryItem[]>([]);
  const [resolvedChats, setResolvedChats] = useState<SupportChatSummaryItem[]>([]);
  const [selected, setSelected] = useState<SupportChatDetail | null>(null);
  const [reply, setReply] = useState('Thank you. I am reviewing your request now.');
  const [error, setError] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [queueFilter, setQueueFilter] = useState<SupportQueueFilter>('all');

  useEffect(() => {
    void loadQueues();

    const intervalId = window.setInterval(() => {
      void loadQueues();
      if (selected?.conversationId) {
        void loadDetail(selected.conversationId);
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [supportApi, selected?.conversationId]);

  const unreadCount = useMemo(
    () =>
      [...openChats, ...assignedChats].filter((item) =>
        ['open', 'assigned', 'waiting_agent'].includes(item.status),
      ).length,
    [assignedChats, openChats],
  );
  const queueItems = useMemo(
    () => [...openChats, ...assignedChats, ...resolvedChats],
    [assignedChats, openChats, resolvedChats],
  );
  const filteredOpenChats = useMemo(
    () => openChats.filter((item) => matchesSupportQueueFilter(item, queueFilter)),
    [openChats, queueFilter],
  );
  const filteredAssignedChats = useMemo(
    () => assignedChats.filter((item) => matchesSupportQueueFilter(item, queueFilter)),
    [assignedChats, queueFilter],
  );
  const filteredResolvedChats = useMemo(
    () => resolvedChats.filter((item) => matchesSupportQueueFilter(item, queueFilter)),
    [queueFilter, resolvedChats],
  );
  const filteredQueueItems = useMemo(
    () => [...filteredOpenChats, ...filteredAssignedChats, ...filteredResolvedChats],
    [filteredAssignedChats, filteredOpenChats, filteredResolvedChats],
  );
  const queueFilterCounts = useMemo(
    () => ({
      all: queueItems.length,
      unread: queueItems.filter((item) => matchesSupportQueueFilter(item, 'unread')).length,
      sla_risk: queueItems.filter((item) => matchesSupportQueueFilter(item, 'sla_risk')).length,
      escalated: queueItems.filter((item) => matchesSupportQueueFilter(item, 'escalated')).length,
    }),
    [queueItems],
  );
  const focusChat = useMemo(
    () => resolveSupportFocusChat(filteredQueueItems, queueFilter),
    [filteredQueueItems, queueFilter],
  );
  const highPriorityCount = useMemo(
    () => filteredQueueItems.filter((item) => item.priority === 'high').length,
    [filteredQueueItems],
  );
  const escalatedCount = useMemo(
    () => filteredQueueItems.filter((item) => item.escalationFlag).length,
    [filteredQueueItems],
  );
  const unreadFilteredCount = useMemo(
    () =>
      filteredQueueItems.filter((item) =>
        ['open', 'assigned', 'waiting_agent'].includes(item.status),
      ).length,
    [filteredQueueItems],
  );
  const oldestWaitingAge = useMemo(
    () => resolveOldestSupportAge(filteredQueueItems),
    [filteredQueueItems],
  );

  useEffect(() => {
    onUnreadChange?.(unreadCount);
  }, [onUnreadChange, unreadCount]);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    if (selected?.conversationId === selectedConversationId) {
      return;
    }

    void loadDetail(selectedConversationId);
  }, [selected?.conversationId, selectedConversationId]);

  useEffect(() => {
    if (!selectedMemberId) {
      return;
    }

    const matchingChat = [...openChats, ...assignedChats, ...resolvedChats].find(
      (item) => item.memberId === selectedMemberId,
    );

    if (!matchingChat) {
      return;
    }

    if (selected?.conversationId === matchingChat.conversationId) {
      return;
    }

    void loadDetail(matchingChat.conversationId);
  }, [assignedChats, openChats, resolvedChats, selected?.conversationId, selectedMemberId]);

  async function loadQueues() {
    try {
      const [open, assigned, resolved] = await Promise.all([
        supportApi.getOpenChats(),
        supportApi.getAssignedChats(),
        supportApi.getResolvedChats(),
      ]);
      setOpenChats(open);
      setAssignedChats(assigned);
      setResolvedChats(resolved);
      setError(null);
    } catch (_error) {
      setError('Unable to load support queues right now.');
    }
  }

  async function loadDetail(chatId: string) {
    try {
      const detail = await supportApi.getChat(chatId);
      setSelected(detail);
      setError(null);
    } catch (_error) {
      setError('Unable to load this support conversation.');
    }
  }

  async function assignCurrent() {
    if (!selected) {
      return;
    }

    try {
      const detail = await supportApi.assignChat(selected.conversationId);
      setSelected(detail);
      setError(null);
      await loadQueues();
    } catch (_error) {
      setError('Unable to assign this support conversation.');
    }
  }

  async function sendReply() {
    if (!selected || !reply.trim()) {
      return;
    }

    try {
      setSendingReply(true);
      const detail = await supportApi.reply(selected.conversationId, reply.trim());
      setSelected(detail);
      setReply('');
      setError(null);
      await loadQueues();
    } catch (_error) {
      setError('Unable to send the support reply.');
    } finally {
      setSendingReply(false);
    }
  }

  async function updateCurrentStatus(status: 'resolved' | 'closed') {
    if (!selected) {
      return;
    }

    try {
      const detail =
        status === 'resolved'
          ? await supportApi.resolve(selected.conversationId)
          : await supportApi.close(selected.conversationId);
      setSelected(detail);
      setError(null);
      await loadQueues();
    } catch (_error) {
      setError(`Unable to mark this support conversation as ${status}.`);
    }
  }

  return (
    <div
      className={
        variant === 'panel'
          ? 'support-workspace support-workspace-panel'
          : 'support-workspace support-workspace-page'
      }
    >
      {variant === 'page' ? (
        <>
          <ConsoleKpiStrip
            items={[
              { icon: 'CU', label: 'Customers', value: queueItems.length.toLocaleString(), trend: 'Support members', trendDirection: 'neutral' },
              { icon: 'LN', label: 'Loans', value: escalatedCount.toLocaleString(), trend: 'Escalated cases', trendDirection: 'down' },
              { icon: 'SV', label: 'Savings', value: filteredResolvedChats.length.toLocaleString(), trend: 'Resolved chats', trendDirection: 'up' },
              { icon: 'AP', label: 'Approvals', value: assignedChats.length.toLocaleString(), trend: 'Assigned chats', trendDirection: 'neutral' },
              { icon: 'AL', label: 'Alerts', value: unreadCount.toLocaleString(), trend: 'Waiting response', trendDirection: 'down' },
            ]}
          />
          <CriticalActionStrip
            items={[
              { label: 'Overdue Loans', value: '0', tone: 'red' },
              { label: 'Missing Documents', value: '0', tone: 'orange' },
              { label: 'Support Backlog', value: unreadCount.toLocaleString(), tone: 'red' },
              { label: 'Expiring Insurance', value: escalatedCount.toLocaleString(), tone: 'amber' },
            ]}
          />
        </>
      ) : null}
      {variant === 'page' ? (
        <DashboardSectionCard
          title="Support Overview"
          description="Queue focus, unread pressure, and SLA posture."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <DashboardMetricRow
              label="Current Focus"
              value={`${formatSupportQueueFilter(queueFilter)} · ${filteredQueueItems.length.toLocaleString()}`}
            />
            <DashboardMetricRow
              label="Unread / Escalated"
              value={`${unreadFilteredCount.toLocaleString()} / ${escalatedCount.toLocaleString()}`}
            />
            <DashboardMetricRow label="High Priority" value={highPriorityCount.toLocaleString()} />
            <DashboardMetricRow label="Oldest Waiting" value={oldestWaitingAge} />
            <DashboardMetricRow
              label="SLA Due"
              value={focusChat ? formatSlaDue(focusChat.responseDueAt) : 'Not available'}
            />
          </div>
        </DashboardSectionCard>
      ) : null}
      <DashboardGrid>
      <section className="panel support-queue-panel">
        <div className="panel-header support-panel-header">
          <div>
            <p className="eyebrow">Support</p>
            <h2>{variant === 'panel' ? 'Support Chat' : 'Support Chat Inbox'}</h2>
          </div>
          <span className="support-status-dot">
            {unreadCount} waiting
          </span>
        </div>
        {returnContextLabel && onReturnToContext ? (
          <div className="loan-return-banner">
            <div>
              <strong>Opened from {returnContextLabel}</strong>
              <span>Return to your dashboard context without losing the support handoff.</span>
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
        {error ? <p className="muted">{error}</p> : null}

        <div className="recommendation-selector-row">
          {([
            ['all', 'All'],
            ['unread', 'Unread'],
            ['sla_risk', 'SLA Risk'],
            ['escalated', 'Escalated'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                queueFilter === value
                  ? 'recommendation-selector active'
                  : 'recommendation-selector'
              }
              onClick={() => setQueueFilter(value)}
            >
              {label} ({queueFilterCounts[value].toLocaleString()})
            </button>
          ))}
        </div>
        <p className="loan-action-guidance">
          Viewing the {formatSupportQueueFilter(queueFilter)} support workload across active queues.
        </p>
        {focusChat ? (
          <div className="recommendation-selector-row">
            <button
              type="button"
              className="recommendation-selector active"
              onClick={() => void loadDetail(focusChat.conversationId)}
            >
              {resolveSupportFocusLabel(queueFilter, focusChat)}
            </button>
          </div>
        ) : null}

        <SupportQueueSection
          items={filteredOpenChats}
          onSelect={loadDetail}
          title="New and waiting chats"
        />
        <SupportQueueSection
          items={filteredAssignedChats}
          onSelect={loadDetail}
          title="Assigned chats"
        />
        <SupportQueueSection
          items={filteredResolvedChats}
          onSelect={loadDetail}
          title="Resolved chats"
        />
      </section>

      <section className="panel support-detail-panel">
        <div className="panel-header support-panel-header">
          <div>
            <p className="eyebrow">Conversation</p>
            <h2>
              {selected ? selected.memberName ?? selected.customerId : 'Select a support conversation'}
            </h2>
          </div>
          {selected ? (
            <span className={`support-status-pill ${statusClassName(selected.status)}`}>
              {formatStatus(selected.status)}
            </span>
          ) : null}
        </div>

        {selected ? (
          <>
            <div className="support-detail-meta">
              <span>{selected.memberType}</span>
              <span>{selected.issueCategory.replace(/_/g, ' ')}</span>
              <span>{selected.branchName ?? 'Amhara Bank'}</span>
              {selected.priority ? <span>{selected.priority}</span> : null}
              {selected.slaState ? <span>SLA {selected.slaState.replace(/_/g, ' ')}</span> : null}
              {selected.responseDueAt ? <span>Due {formatSlaDue(selected.responseDueAt)}</span> : null}
              {selected.assignedToStaffName ? (
                <span>{selected.assignedToStaffName}</span>
              ) : null}
            </div>
            <div className="conversation-timeline support-conversation-list">
              {selected.messages.map((message) => (
                <div className="timeline-item" key={message.id}>
                  <strong>{message.senderName ?? message.senderType}</strong>
                  <p>{message.message}</p>
                  <span className="muted">{formatTimestamp(message.createdAt)}</span>
                </div>
              ))}
            </div>
            <div className="support-composer">
              <div className="support-composer-header">
                <div>
                  <strong>Reply to Customer</strong>
                  <p className="muted">Send a live reply back to the mobile app.</p>
                </div>
                <button
                  className="support-send-button"
                  disabled={!reply.trim() || sendingReply}
                  onClick={() => void sendReply()}
                  type="button"
                >
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
              <textarea
                className="reply-box"
                onChange={(event) => setReply(event.target.value)}
                placeholder="Type your reply to the customer"
                rows={4}
                value={reply}
              />
            </div>
            <div className="action-row">
              <button
                className="support-secondary-button"
                onClick={() => void assignCurrent()}
                type="button"
              >
                Assign To Me
              </button>
              <button
                className="support-secondary-button"
                onClick={() => void updateCurrentStatus('resolved')}
                type="button"
              >
                Resolve
              </button>
              <button
                className="support-secondary-button"
                onClick={() => void updateCurrentStatus('closed')}
                type="button"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <p className="muted">
            Select a conversation to review customer details, shared message history, and
            live support actions.
          </p>
        )}
      </section>
      </DashboardGrid>
    </div>
  );
}

type SupportQueueSectionProps = {
  title: string;
  items: SupportChatSummaryItem[];
  onSelect: (chatId: string) => Promise<void>;
};

function SupportQueueSection({ title, items, onSelect }: SupportQueueSectionProps) {
  return (
    <div className="support-queue-section">
      <div className="support-queue-heading">
        <h3>{title}</h3>
        <span className="muted">{items.length}</span>
      </div>
      {items.length ? (
        items.map((item) => (
          <button
            key={item.conversationId}
            className="table-row-button support-chat-row"
            onClick={() => void onSelect(item.conversationId)}
            type="button"
          >
            <div className="support-chat-row-top">
              <strong>{item.memberName ?? item.customerId}</strong>
              <span className={`support-status-pill ${statusClassName(item.status)}`}>
                {formatStatus(item.status)}
              </span>
            </div>
            <div className="support-chat-row-meta">
              <span>{item.issueCategory.replace(/_/g, ' ')}</span>
              <span>{item.branchName ?? 'Amhara Bank'}</span>
              {item.slaState ? <span>SLA {item.slaState.replace(/_/g, ' ')}</span> : null}
              <span>{formatTimestamp(item.updatedAt)}</span>
            </div>
            {item.responseDueAt ? (
              <span className="muted">Response due {formatSlaDue(item.responseDueAt)}</span>
            ) : null}
            <span className="support-chat-row-message">{item.lastMessage}</span>
          </button>
        ))
      ) : (
        <p className="muted">No conversations in this queue right now.</p>
      )}
    </div>
  );
}

function formatTimestamp(value?: string) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function statusClassName(status: string) {
  switch (status) {
    case 'waiting_agent':
    case 'open':
      return 'support-status-waiting-agent';
    case 'waiting_customer':
      return 'support-status-waiting-customer';
    case 'resolved':
      return 'support-status-resolved';
    case 'assigned':
      return 'support-status-assigned';
    default:
      return 'support-status-default';
  }
}

function matchesSupportQueueFilter(
  item: SupportChatSummaryItem,
  filter: SupportQueueFilter,
) {
  if (filter === 'unread') {
    return ['open', 'assigned', 'waiting_agent'].includes(item.status);
  }

  if (filter === 'sla_risk') {
    return (
      item.priority === 'high' ||
      item.slaState === 'attention' ||
      item.slaState === 'breached' ||
      hoursSince(item.updatedAt) >= 24 ||
      item.status === 'waiting_agent'
    );
  }

  if (filter === 'escalated') {
    return item.escalationFlag === true;
  }

  return true;
}

function formatSupportQueueFilter(filter: SupportQueueFilter) {
  if (filter === 'sla_risk') {
    return 'SLA Risk';
  }

  if (filter === 'unread') {
    return 'Unread';
  }

  if (filter === 'escalated') {
    return 'Escalated';
  }

  return 'All';
}

function hoursSince(value?: string) {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return Math.max(0, Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60)));
}

function resolveSupportFocusChat(
  items: SupportChatSummaryItem[],
  filter: SupportQueueFilter,
) {
  if (items.length === 0) {
    return null;
  }

  if (filter === 'sla_risk') {
    return [...items].sort(compareSupportRisk)[0];
  }

  if (filter === 'escalated') {
    return items.find((item) => item.escalationFlag) ?? items[0];
  }

  if (filter === 'unread') {
    return items.find((item) => ['open', 'assigned', 'waiting_agent'].includes(item.status)) ?? items[0];
  }

  return [...items].sort(compareSupportRisk)[0];
}

function resolveSupportFocusLabel(
  filter: SupportQueueFilter,
  item: SupportChatSummaryItem,
) {
  if (filter === 'sla_risk') {
    return `Review highest-risk chat: ${item.memberName ?? item.customerId}`;
  }

  if (filter === 'escalated') {
    return `Review escalated chat: ${item.memberName ?? item.customerId}`;
  }

  if (filter === 'unread') {
    return `Review next unread chat: ${item.memberName ?? item.customerId}`;
  }

  return `Review top-priority chat: ${item.memberName ?? item.customerId}`;
}

function compareSupportRisk(left: SupportChatSummaryItem, right: SupportChatSummaryItem) {
  const priorityRank = {
    high: 0,
    normal: 1,
    low: 2,
    undefined: 3,
  } as const;

  const leftPriority = priorityRank[left.priority as keyof typeof priorityRank] ?? priorityRank.undefined;
  const rightPriority =
    priorityRank[right.priority as keyof typeof priorityRank] ?? priorityRank.undefined;

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  if (left.escalationFlag !== right.escalationFlag) {
    return left.escalationFlag ? -1 : 1;
  }

  const slaRank = {
    breached: 0,
    attention: 1,
    on_track: 2,
    undefined: 3,
  } as const;
  const leftSla = slaRank[left.slaState as keyof typeof slaRank] ?? slaRank.undefined;
  const rightSla = slaRank[right.slaState as keyof typeof slaRank] ?? slaRank.undefined;
  if (leftSla !== rightSla) {
    return leftSla - rightSla;
  }

  return hoursSince(right.updatedAt) - hoursSince(left.updatedAt);
}

function resolveOldestSupportAge(items: SupportChatSummaryItem[]) {
  if (items.length === 0) {
    return 'Not available';
  }

  const oldestHours = Math.max(...items.map((item) => hoursSince(item.updatedAt)));

  if (oldestHours < 24) {
    return `${oldestHours}h`;
  }

  return `${Math.round(oldestHours / 24)}d`;
}

function formatSlaDue(value?: string) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
