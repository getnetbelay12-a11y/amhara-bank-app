import { useEffect, useMemo, useState } from 'react';

import { useAppClient } from '../../app/AppContext';
import type { CreateVotePayload, VoteAdminItem, VoteResultItem, VotingSummaryItem } from '../../core/api/contracts';
import { AdminRole, type AdminSession } from '../../core/session';
import { ConsoleKpiStrip } from '../../shared/components/ConsoleKpiStrip';
import { CriticalActionStrip } from '../../shared/components/CriticalActionStrip';
import { Panel } from '../../shared/components/Panel';
import { SimpleTable } from '../../shared/components/SimpleTable';

type VotingManagementPageProps = {
  session: AdminSession;
  initialVoteId?: string;
  returnContextLabel?: string;
  onReturnToContext?: () => void;
};

const defaultForm = {
  title: '',
  description: '',
  type: 'shareholder_vote',
  startDate: '',
  endDate: '',
  optionA: '',
  optionB: '',
};

export function VotingManagementPage({
  session,
  initialVoteId,
  returnContextLabel,
  onReturnToContext,
}: VotingManagementPageProps) {
  const { votingApi } = useAppClient();
  const [votes, setVotes] = useState<VoteAdminItem[]>([]);
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(initialVoteId ?? null);
  const [participation, setParticipation] = useState<VotingSummaryItem | null>(null);
  const [results, setResults] = useState<VoteResultItem[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState<string | null>(null);

  const canManage = headOfficeRoles.has(session.role);

  useEffect(() => {
    let cancelled = false;

    void votingApi.getVotes(session.role).then((result) => {
      if (!cancelled) {
        setVotes(result);
        setSelectedVoteId((current) => current ?? result[0]?.voteId ?? null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session.role, votingApi]);

  useEffect(() => {
    if (!selectedVoteId) {
      setParticipation(null);
      setResults([]);
      return;
    }

    let cancelled = false;
    void Promise.all([
      votingApi.getParticipation(selectedVoteId),
      votingApi.getResults ? votingApi.getResults(selectedVoteId) : Promise.resolve([]),
    ]).then(([participationResult, resultsResult]) => {
      if (!cancelled) {
        setParticipation(participationResult);
        setResults(resultsResult);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedVoteId, votingApi]);

  const selectedVote = useMemo(
    () => votes.find((vote) => vote.voteId === selectedVoteId) ?? votes[0] ?? null,
    [selectedVoteId, votes],
  );

  const activeVotingCount = votes.filter((vote) => vote.status === 'open').length;
  const totalShareholders = Math.max(...votes.map((vote) => vote.eligibleShareholders), 0);
  const votesCast = votes.reduce((sum, vote) => sum + vote.totalResponses, 0);
  const participationRate =
    totalShareholders === 0 || votes.length === 0
      ? 0
      : Number((votes.reduce((sum, vote) => sum + vote.participationRate, 0) / votes.length).toFixed(2));

  async function refreshVotes(nextSelectedVoteId?: string) {
    const nextVotes = await votingApi.getVotes(session.role);
    setVotes(nextVotes);
    if (nextSelectedVoteId) {
      setSelectedVoteId(nextSelectedVoteId);
      return;
    }

    setSelectedVoteId((current) => current ?? nextVotes[0]?.voteId ?? null);
  }

  async function handleCreateVote() {
    if (!canManage) {
      return;
    }

    const payload: CreateVotePayload = {
      title: form.title,
      description: form.description,
      type: form.type,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      options: [
        { name: form.optionA, displayOrder: 1 },
        { name: form.optionB, displayOrder: 2 },
      ],
    };

    const created = await votingApi.createVote(payload);
    setForm(defaultForm);
    setMessage(`Vote ${created.title} created in draft.`);
    await refreshVotes(created.voteId);
  }

  async function handleStatusChange(action: 'open' | 'close') {
    if (!selectedVote || !canManage) {
      return;
    }

    const updated =
      action === 'open'
        ? await votingApi.openVote?.(selectedVote.voteId)
        : await votingApi.closeVote?.(selectedVote.voteId);
    if (!updated) {
      return;
    }
    setMessage(`${updated.title} is now ${updated.status}.`);
    await refreshVotes(updated.voteId);
  }

  return (
    <div className="page-stack console-card-page">
      {returnContextLabel && onReturnToContext ? (
        <div className="loan-return-banner">
          <div>
            <p className="eyebrow">Dashboard Context</p>
            <strong>Opened from {returnContextLabel}</strong>
          </div>
          <button type="button" className="loan-return-button" onClick={onReturnToContext}>
            Back to {returnContextLabel}
          </button>
        </div>
      ) : null}

      <ConsoleKpiStrip
        items={[
          { icon: 'CU', label: 'Customers', value: totalShareholders.toLocaleString(), trend: 'Eligible shareholders', trendDirection: 'neutral' },
          { icon: 'LN', label: 'Loans', value: votesCast.toLocaleString(), trend: 'Votes cast', trendDirection: 'up' },
          { icon: 'SV', label: 'Savings', value: activeVotingCount.toLocaleString(), trend: 'Active votes', trendDirection: 'neutral' },
          { icon: 'AP', label: 'Approvals', value: votes.filter((vote) => vote.status === 'draft').length.toLocaleString(), trend: 'Draft votes', trendDirection: 'neutral' },
          { icon: 'AL', label: 'Alerts', value: `${participationRate.toFixed(0)}%`, trend: 'Participation', trendDirection: participationRate >= 50 ? 'up' : 'down' },
        ]}
      />
      <CriticalActionStrip
        items={[
          { label: 'Overdue Loans', value: '0', tone: 'red' },
          { label: 'Missing Documents', value: '0', tone: 'orange' },
          { label: 'Support Backlog', value: activeVotingCount.toLocaleString(), tone: 'red' },
          { label: 'Expiring Insurance', value: votes.filter((vote) => vote.status === 'draft').length.toLocaleString(), tone: 'amber' },
        ]}
      />

      <Panel
        title="Voting & Governance"
        description="Head office governance console for shareholder voting, turnout tracking, and result review."
      >
        <div className="dashboard-summary-strip">
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Active voting</span>
            <strong>{activeVotingCount.toLocaleString()}</strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Total shareholders</span>
            <strong>{totalShareholders.toLocaleString()}</strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Votes cast</span>
            <strong>{votesCast.toLocaleString()}</strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Participation rate</span>
            <strong>{participationRate.toFixed(0)}%</strong>
          </div>
        </div>
      </Panel>

      <div className="console-card-grid">
      <Panel title="Create Voting Event" description="Create a vote with schedule and options in one head-office workflow.">
        <div className="support-detail-grid">
          <label>
            <span>Title</span>
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label>
            <span>Type</span>
            <input value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} />
          </label>
          <label>
            <span>Start date</span>
            <input type="datetime-local" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
          </label>
          <label>
            <span>End date</span>
            <input type="datetime-local" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} />
          </label>
          <label>
            <span>Option 1</span>
            <input value={form.optionA} onChange={(event) => setForm((current) => ({ ...current, optionA: event.target.value }))} />
          </label>
          <label>
            <span>Option 2</span>
            <input value={form.optionB} onChange={(event) => setForm((current) => ({ ...current, optionB: event.target.value }))} />
          </label>
        </div>
        <div className="page-actions">
          <button type="button" className="primary-button" disabled={!canManage} onClick={() => void handleCreateVote()}>
            Create voting
          </button>
          {message ? <span className="muted">{message}</span> : null}
        </div>
      </Panel>

      <Panel title="Voting Control" description="Open, close, and review governance events with head-office access controls.">
        <SimpleTable
          headers={['Vote', 'Status', 'Votes Cast', 'Participation', 'Action']}
          rows={votes.map((vote) => [
            <button key={`${vote.voteId}-link`} type="button" className="ghost-button" onClick={() => setSelectedVoteId(vote.voteId)}>
              {vote.title}
            </button>,
            capitalize(vote.status),
            vote.totalResponses.toLocaleString(),
            `${vote.participationRate.toFixed(0)}%`,
            vote.status === 'draft'
              ? 'Ready to open'
              : vote.status === 'open'
                ? 'Monitor or close'
                : 'View final results',
          ])}
          emptyState={{
            title: 'No governance votes in scope',
            description: 'Voting events will appear here for head office governance staff.',
          }}
        />
        {selectedVote ? (
          <div className="page-actions">
            <button
              type="button"
              className="primary-button"
              disabled={!canManage || selectedVote.status !== 'draft'}
              onClick={() => void handleStatusChange('open')}
            >
              Open voting
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={!canManage || selectedVote.status !== 'open'}
              onClick={() => void handleStatusChange('close')}
            >
              Close voting
            </button>
          </div>
        ) : null}
      </Panel>
      </div>

      <div className="page-grid two-column">
        <Panel title="Participation Tracking" description="Branch and district turnout for the selected voting event.">
          <div className="dashboard-summary-strip">
            <div className="dashboard-summary-chip">
              <span className="dashboard-summary-label">Responses</span>
              <strong>{participation?.totalResponses?.toLocaleString() ?? '0'}</strong>
            </div>
            <div className="dashboard-summary-chip">
              <span className="dashboard-summary-label">Branches</span>
              <strong>{participation?.uniqueBranches?.toLocaleString() ?? '0'}</strong>
            </div>
            <div className="dashboard-summary-chip">
              <span className="dashboard-summary-label">Districts</span>
              <strong>{participation?.uniqueDistricts?.toLocaleString() ?? '0'}</strong>
            </div>
          </div>
          <SimpleTable
            headers={['Branch', 'Votes']}
            rows={(participation?.branchParticipation ?? []).map((item) => [item.name, item.totalResponses.toLocaleString()])}
            emptyState={{ title: 'No branch participation yet', description: 'Branch turnout appears here after votes are cast.' }}
          />
          <SimpleTable
            headers={['District', 'Votes']}
            rows={(participation?.districtParticipation ?? []).map((item) => [item.name, item.totalResponses.toLocaleString()])}
            emptyState={{ title: 'No district participation yet', description: 'District turnout appears here after votes are cast.' }}
          />
        </Panel>

        <Panel title="Results View" description="Votes per option and result percentages for the selected event.">
          <SimpleTable
            headers={['Option', 'Votes', 'Percentage']}
            rows={results.map((item) => [item.optionName, item.votes.toLocaleString(), `${item.percentage.toFixed(2)}%`])}
            emptyState={{ title: 'No results available', description: 'Results will appear here when the event has responses or is closed.' }}
          />
        </Panel>
      </div>
    </div>
  );
}

const headOfficeRoles = new Set<AdminRole>([
  AdminRole.HEAD_OFFICE_OFFICER,
  AdminRole.HEAD_OFFICE_MANAGER,
  AdminRole.HEAD_OFFICE_DIRECTOR,
  AdminRole.ADMIN,
]);

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
