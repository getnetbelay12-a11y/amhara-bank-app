import { useEffect, useState } from 'react';

import { useAppClient } from '../../app/AppContext';
import type {
  FeePlanRecord,
  GuardianStudentLinkItem,
  InvoiceBatchPreviewResult,
  SchoolCollectionItem,
  SchoolConsoleOverview,
  SchoolInvoiceItem,
  SchoolPortfolioItem,
  SchoolSettlementSummaryItem,
  StudentImportRowInput,
  StudentDetail,
  StudentRegistryItem,
} from '../../core/api/contracts';
import type { AppSession } from '../../core/session';
import { Panel } from '../../shared/components/Panel';
import { SimpleTable } from '../../shared/components/SimpleTable';

type SchoolConsolePageProps = {
  session: AppSession;
};

type SchoolConsoleSection =
  | 'overview'
  | 'registry'
  | 'billing'
  | 'collections'
  | 'onboarding';

export function SchoolConsolePage({ session }: SchoolConsolePageProps) {
  const { schoolConsoleApi } = useAppClient();
  const [overview, setOverview] = useState<SchoolConsoleOverview | null>(null);
  const [activeSection, setActiveSection] = useState<SchoolConsoleSection>('overview');
  const [registry, setRegistry] = useState<StudentRegistryItem[]>([]);
  const [feePlans, setFeePlans] = useState<FeePlanRecord[]>([]);
  const [schoolFilter, setSchoolFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [billingGradeFilter, setBillingGradeFilter] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');
  const [collectionReconciliationFilter, setCollectionReconciliationFilter] = useState('');
  const [collectionDateFrom, setCollectionDateFrom] = useState('');
  const [collectionDateTo, setCollectionDateTo] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentDetail | null>(null);
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState('');
  const [invoicePreview, setInvoicePreview] = useState<InvoiceBatchPreviewResult | null>(null);
  const [invoiceActionMessage, setInvoiceActionMessage] = useState('');
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    code: '',
    branchName: session.branchName ?? '',
    city: '',
    region: 'Amhara',
  });
  const [importSchoolId, setImportSchoolId] = useState('');
  const [importText, setImportText] = useState(
    'ST-3001,Selam Tesfaye,Grade 6,A,Tesfaye Bekele,0911223344',
  );
  const [setupMessage, setSetupMessage] = useState('');
  const [feePlanMessage, setFeePlanMessage] = useState('');
  const [feePlanForm, setFeePlanForm] = useState({
    schoolId: '',
    academicYear: '2026',
    term: 'Term 1',
    grade: '',
    name: '',
    status: 'active',
  });
  const [feePlanItems, setFeePlanItems] = useState([
    { label: 'Tuition', amount: '0' },
    { label: 'Transport', amount: '0' },
  ]);
  const [linkMessage, setLinkMessage] = useState('');
  const [guardianMessage, setGuardianMessage] = useState('');
  const [guardianForm, setGuardianForm] = useState({
    fullName: '',
    phone: '',
    relationship: 'parent',
    status: 'linked',
  });
  const [linkForm, setLinkForm] = useState({
    guardianId: '',
    memberCustomerId: '',
    relationship: 'parent',
    status: 'active',
  });

  useEffect(() => {
    if (!schoolConsoleApi) {
      setOverview(null);
      return;
    }

    let cancelled = false;

    void schoolConsoleApi.getOverview().then((result) => {
      if (!cancelled) {
        setOverview(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [schoolConsoleApi]);

  useEffect(() => {
    if (!schoolConsoleApi) {
      setRegistry([]);
      return;
    }

    let cancelled = false;

    void schoolConsoleApi
      .getRegistry({
        schoolId: schoolFilter || undefined,
        grade: gradeFilter || undefined,
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      })
      .then((result) => {
        if (!cancelled) {
          setRegistry(result);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [gradeFilter, schoolConsoleApi, schoolFilter, search, statusFilter]);

  useEffect(() => {
    if (!schoolConsoleApi) {
      setFeePlans([]);
      return;
    }

    let cancelled = false;
    void schoolConsoleApi.getFeePlans(schoolFilter || undefined).then((result) => {
      if (!cancelled) {
        setFeePlans(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [schoolConsoleApi, schoolFilter]);

  useEffect(() => {
    if (!selectedStudentId) {
      setSelectedStudentDetail(null);
      return;
    }

    if (!schoolConsoleApi) {
      return;
    }

    let cancelled = false;

    void schoolConsoleApi.getStudentDetail(selectedStudentId).then((result) => {
      if (!cancelled) {
        setSelectedStudentDetail(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [schoolConsoleApi, selectedStudentId]);

  useEffect(() => {
    if (registry.length === 0) {
      setSelectedStudentId('');
      return;
    }

    if (!registry.some((item) => item.studentId === selectedStudentId)) {
      setSelectedStudentId(registry[0]?.studentId ?? '');
    }
  }, [registry, selectedStudentId]);

  const summary = overview?.summary;
  const schools = overview?.schools ?? [];
  const invoices = overview?.invoices ?? [];
  const collections = overview?.collections ?? [];
  const collectionSummary = overview?.collectionSummary ?? null;
  const schoolSettlements = overview?.schoolSettlements ?? [];
  const gradeOptions = Array.from(new Set(registry.map((item) => item.grade))).sort();
  const statusOptions = Array.from(new Set(registry.map((item) => item.status))).sort();
  const reconciliationOptions = Array.from(
    new Set(collections.map((item) => item.reconciliationStatus)),
  ).sort();

  async function handleReminder(invoiceNo: string) {
    if (!schoolConsoleApi) {
      return;
    }

    const result = await schoolConsoleApi.sendInvoiceReminder(invoiceNo);
    setInvoiceActionMessage(result.message);
  }

  async function handleBulkReminder() {
    if (!schoolConsoleApi) {
      return;
    }

    const targetInvoices = filteredInvoices
      .filter((item) => item.status === 'open' || item.status === 'partially_paid')
      .map((item) => item.invoiceNo);

    if (targetInvoices.length === 0) {
      setInvoiceActionMessage('No open invoices match the current billing filter.');
      return;
    }

    const result = await schoolConsoleApi.sendInvoiceReminders(targetInvoices);
    setInvoiceActionMessage(result.message);
  }

  async function handleGenerateBatch() {
    if (!schoolConsoleApi) {
      return;
    }

    const targetSchoolId = schoolFilter || schools[0]?.id;
    if (!targetSchoolId) {
      setInvoiceActionMessage('Select or onboard a school before generating invoices.');
      return;
    }

    const result = await schoolConsoleApi.generateInvoiceBatch({
      schoolId: targetSchoolId,
      academicYear: '2026',
      term: 'Term 1',
      grade: billingGradeFilter || undefined,
    });
    setInvoiceActionMessage(result.message);
    setInvoicePreview(null);
  }

  async function handlePreviewBatch() {
    if (!schoolConsoleApi) {
      return;
    }

    const targetSchoolId = schoolFilter || schools[0]?.id;
    if (!targetSchoolId) {
      setInvoiceActionMessage('Select or onboard a school before previewing invoices.');
      return;
    }

    const result = await schoolConsoleApi.previewInvoiceBatch({
      schoolId: targetSchoolId,
      academicYear: '2026',
      term: 'Term 1',
      grade: billingGradeFilter || undefined,
    });
    setInvoicePreview(result);
    setInvoiceActionMessage(
      `Preview covers ${result.previewCount} students. Missing grades: ${result.missingGrades.join(', ') || 'none'}.`,
    );
  }

  const filteredInvoices = invoices.filter((item) => {
    if (schoolFilter && item.schoolId !== schoolFilter) {
      return false;
    }
    if (invoiceStatusFilter && item.status !== invoiceStatusFilter) {
      return false;
    }
    if (billingGradeFilter) {
      const student = registry.find((entry) => entry.studentId === item.studentId);
      if (student?.grade !== billingGradeFilter) {
        return false;
      }
    }
    return true;
  });
  const filteredCollections = collections.filter((item) => {
    if (schoolFilter && item.schoolId !== schoolFilter) {
      return false;
    }
    if (
      collectionReconciliationFilter &&
      item.reconciliationStatus !== collectionReconciliationFilter
    ) {
      return false;
    }
    const recordedDay = item.recordedAt.slice(0, 10);
    if (collectionDateFrom && recordedDay < collectionDateFrom) {
      return false;
    }
    if (collectionDateTo && recordedDay > collectionDateTo) {
      return false;
    }
    return true;
  });
  const hasCollectionSubFilters =
    Boolean(collectionReconciliationFilter) || Boolean(collectionDateFrom) || Boolean(collectionDateTo);
  const visibleSchoolSettlements = hasCollectionSubFilters
    ? summarizeSchoolSettlements(filteredCollections)
    : schoolSettlements.filter((item) => !schoolFilter || item.schoolId === schoolFilter);
  const selectedInvoice = filteredInvoices.find((item) => item.invoiceNo === selectedInvoiceNo) ?? null;

  useEffect(() => {
    if (filteredInvoices.length === 0) {
      setSelectedInvoiceNo('');
      return;
    }

    if (!filteredInvoices.some((item) => item.invoiceNo === selectedInvoiceNo)) {
      setSelectedInvoiceNo(filteredInvoices[0]?.invoiceNo ?? '');
    }
  }, [selectedInvoiceNo, filteredInvoices]);

  async function handleCreateSchool(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolConsoleApi) {
      return;
    }

    const created = await schoolConsoleApi.createSchool(schoolForm);
    setSetupMessage(`School ${created.name} created in onboarding status.`);
    setSchoolForm({
      name: '',
      code: '',
      branchName: session.branchName ?? '',
      city: '',
      region: 'Amhara',
    });
  }

  async function handleImportStudents(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolConsoleApi) {
      return;
    }

    const schoolId = importSchoolId || schools[0]?.id;
    if (!schoolId) {
      setSetupMessage('Select or create a school before importing students.');
      return;
    }

    const students = parseImportRows(importText);
    if (students.length === 0) {
      setSetupMessage('Enter at least one valid student import row.');
      return;
    }

    const result = await schoolConsoleApi.importStudents({
      schoolId,
      students,
    });
    setSetupMessage(result.message);
    setImportSchoolId(schoolId);
  }

  async function handleCreateFeePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolConsoleApi) {
      return;
    }

    const schoolId = feePlanForm.schoolId || schoolFilter || schools[0]?.id;
    const school = schools.find((item) => item.id === schoolId);
    if (!schoolId || !school) {
      setFeePlanMessage('Select a school before creating a fee plan.');
      return;
    }

    const created = await schoolConsoleApi.createFeePlan({
      schoolId,
      schoolName: school.name,
      academicYear: feePlanForm.academicYear,
      term: feePlanForm.term,
      grade: feePlanForm.grade,
      name: feePlanForm.name,
      status: feePlanForm.status,
      items: feePlanItems
        .map((item) => ({ label: item.label, amount: Number(item.amount) || 0 }))
        .filter((item) => item.label.trim().length > 0 && item.amount > 0),
    });

    setFeePlanMessage(`Created fee plan ${created.name} with total ${formatMoney(created.total)}.`);
    setFeePlanForm((current) => ({
      ...current,
      schoolId,
      grade: '',
      name: '',
    }));
    setFeePlanItems([
      { label: 'Tuition', amount: '0' },
      { label: 'Transport', amount: '0' },
    ]);
    setFeePlans(await schoolConsoleApi.getFeePlans(schoolFilter || undefined));
  }

  async function refreshStudentDetail(studentId: string) {
    if (!schoolConsoleApi) {
      return;
    }

    const [detail, nextRegistry] = await Promise.all([
      schoolConsoleApi.getStudentDetail(studentId),
      schoolConsoleApi.getRegistry({
        schoolId: schoolFilter || undefined,
        grade: gradeFilter || undefined,
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      }),
    ]);

    setSelectedStudentDetail(detail);
    setRegistry(nextRegistry);
  }

  async function handleCreateGuardianLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolConsoleApi || !selectedStudentDetail) {
      return;
    }

    const created = await schoolConsoleApi.createGuardianStudentLink({
      studentId: selectedStudentDetail.student.studentId,
      guardianId: linkForm.guardianId,
      memberCustomerId: linkForm.memberCustomerId,
      relationship: linkForm.relationship,
      status: linkForm.status,
    });
    setLinkMessage(`Created link ${created.linkId} for ${selectedStudentDetail.student.studentId}.`);
    setLinkForm((current) => ({ ...current, memberCustomerId: '' }));
    await refreshStudentDetail(selectedStudentDetail.student.studentId);
  }

  async function handleCreateGuardian(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolConsoleApi || !selectedStudentDetail) {
      return;
    }

    const created = await schoolConsoleApi.createGuardian({
      studentId: selectedStudentDetail.student.studentId,
      fullName: guardianForm.fullName,
      phone: guardianForm.phone,
      relationship: guardianForm.relationship,
      status: guardianForm.status,
    });
    setGuardianMessage(`Created guardian ${created.guardianId}.`);
    setGuardianForm({
      fullName: '',
      phone: '',
      relationship: 'parent',
      status: 'linked',
    });
    await refreshStudentDetail(selectedStudentDetail.student.studentId);
  }

  async function handleToggleGuardianStatus(guardianId: string, status: string) {
    if (!schoolConsoleApi || !selectedStudentDetail) {
      return;
    }

    const updated = await schoolConsoleApi.updateGuardian(guardianId, { status });
    setGuardianMessage(`Updated ${updated.guardianId} to ${titleCase(updated.status)}.`);
    await refreshStudentDetail(selectedStudentDetail.student.studentId);
  }

  async function handleUpdateGuardianLink(
    linkId: string,
    status: GuardianStudentLinkItem['status'],
  ) {
    if (!schoolConsoleApi || !selectedStudentDetail) {
      return;
    }

    const updated = await schoolConsoleApi.updateGuardianStudentLink(linkId, { status });
    setLinkMessage(`Updated ${updated.linkId} to ${titleCase(updated.status)}.`);
    await refreshStudentDetail(selectedStudentDetail.student.studentId);
  }

  function handleExportInvoices() {
    if (filteredInvoices.length === 0) {
      setInvoiceActionMessage('No invoices match the current billing filter.');
      return;
    }

    const gradeByStudentId = new Map(registry.map((item) => [item.studentId, item.grade]));
    downloadCsv(
      'school-console-invoices.csv',
      ['Invoice', 'Student ID', 'Student Name', 'School', 'Grade', 'Total', 'Paid', 'Balance', 'Status', 'Due Date'],
      filteredInvoices.map((item) => [
        item.invoiceNo,
        item.studentId,
        item.studentName,
        item.schoolName,
        gradeByStudentId.get(item.studentId) ?? '',
        item.total,
        item.paid,
        item.balance,
        item.status,
        item.dueDate,
      ]),
    );
    setInvoiceActionMessage(`Exported ${filteredInvoices.length} filtered invoices to CSV.`);
  }

  function handleExportCollections() {
    if (filteredCollections.length === 0) {
      setInvoiceActionMessage('No collections match the current school filter.');
      return;
    }

    downloadCsv(
      'school-console-collections.csv',
      ['Receipt', 'School', 'Student ID', 'Channel', 'Amount', 'Status', 'Reconciliation', 'Recorded At'],
      filteredCollections.map((item) => [
        item.receiptNo,
        item.schoolName,
        item.studentId,
        item.channel,
        item.amount,
        item.status,
        item.reconciliationStatus,
        item.recordedAt,
      ]),
    );
    setInvoiceActionMessage(`Exported ${filteredCollections.length} collection records to CSV.`);
  }

  return (
    <div className="page-stack">
      <Panel
        title="School Console"
        description={`Dedicated workspace for school billing, student registry, and reconciliation under ${session.branchName}.`}
      >
        <div className="dashboard-summary-strip">
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Schools</span>
            <strong>{summary?.schools.toLocaleString() ?? '...'}</strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Students</span>
            <strong>{summary?.students.toLocaleString() ?? '...'}</strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Open invoices</span>
            <strong>{summary?.openInvoices.toLocaleString() ?? '...'}</strong>
          </div>
          <div className="dashboard-summary-chip">
            <span className="dashboard-summary-label">Today’s collections</span>
            <strong>{formatMoney(summary?.todayCollections)}</strong>
          </div>
        </div>

        <div className="loan-filter-row" style={{ marginTop: 16 }}>
          {([
            ['overview', 'Overview'],
            ['registry', 'Registry'],
            ['billing', 'Billing'],
            ['collections', 'Collections'],
            ['onboarding', 'Onboarding'],
          ] as Array<[SchoolConsoleSection, string]>).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={activeSection === key ? 'channel-chip active' : 'channel-chip'}
              onClick={() => setActiveSection(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </Panel>

      {activeSection === 'overview' ? (
        <Panel
          title="School Portfolio"
          description="Head-office and branch teams can onboard schools, monitor collections, and spot reconciliation pressure."
        >
          <SimpleTable
            headers={['School', 'Linked branch', 'Students', 'Open invoices', 'Today', 'Status']}
            rows={buildSchoolRows(schools)}
            emptyState={{
              title: 'No schools onboarded yet',
              description: 'School portfolio items will appear here once onboarding starts.',
            }}
          />
        </Panel>
      ) : null}

      {activeSection === 'registry' ? (
        <Panel
          title="Student Registry"
          description="Use school, grade, status, and free-text search to find students before billing, support, or reconciliation work."
        >
          <div className="dashboard-toolbar">
            <label className="field-stack">
              <span>School</span>
              <select value={schoolFilter} onChange={(event) => setSchoolFilter(event.target.value)}>
                <option value="">All schools</option>
                {schools.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-stack">
              <span>Grade</span>
              <select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)}>
                <option value="">All grades</option>
                {gradeOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-stack">
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All statuses</option>
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-stack" style={{ minWidth: 240 }}>
              <span>Search</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Student, guardian, phone, ID"
              />
            </label>
          </div>
          <SimpleTable
            headers={[
              'Student',
              'School',
              'Grade',
              'Guardian',
              'Guardian status',
              'Enrollment',
              'Academic year',
              'Open',
            ]}
            rows={buildRegistryRows(registry, selectedStudentId, setSelectedStudentId)}
            emptyState={{
              title: 'No students match this filter',
              description: 'Try clearing one of the filters or broaden the search term.',
            }}
          />
        </Panel>
      ) : null}

      {activeSection === 'registry' && selectedStudentDetail ? (
        <Panel
          title={`${selectedStudentDetail.student.fullName} · Student Detail`}
          description="Use this detail panel to review guardian readiness, billing status, and school-payment history before taking action."
        >
          <div className="dashboard-summary-strip">
            <div className="dashboard-summary-chip">
              <span className="dashboard-summary-label">Student ID</span>
              <strong>{selectedStudentDetail.student.studentId}</strong>
            </div>
            <div className="dashboard-summary-chip">
              <span className="dashboard-summary-label">Guardian</span>
              <strong>{selectedStudentDetail.student.guardianName}</strong>
            </div>
            <div className="dashboard-summary-chip">
              <span className="dashboard-summary-label">Current status</span>
              <strong>{titleCase(selectedStudentDetail.student.status)}</strong>
            </div>
            <div className="dashboard-summary-chip">
              <span className="dashboard-summary-label">Enrollment</span>
              <strong>{titleCase(selectedStudentDetail.student.enrollmentStatus)}</strong>
            </div>
          </div>

          <SimpleTable
            headers={['Profile field', 'Value']}
            rows={[
              ['School', selectedStudentDetail.student.schoolName],
              [
                'Placement',
                `${selectedStudentDetail.student.grade} · ${selectedStudentDetail.student.section}`,
              ],
              ['Academic year', selectedStudentDetail.student.academicYear],
              ['Roll number', selectedStudentDetail.student.rollNumber ?? 'n/a'],
              [
                'Guardian contact',
                `${selectedStudentDetail.student.guardianName} (${selectedStudentDetail.student.guardianPhone || 'n/a'})`,
              ],
              ['Guardian status', titleCase(selectedStudentDetail.student.guardianStatus)],
            ]}
          />

          <div className="loan-detail-grid" style={{ marginTop: 16 }}>
            <div>
              <p className="eyebrow">Guardian records</p>
              <SimpleTable
                headers={['Guardian ID', 'Name', 'Phone', 'Relationship', 'Status', 'Action']}
                rows={selectedStudentDetail.guardians.map((item) => [
                  item.guardianId,
                  item.fullName,
                  item.phone,
                  titleCase(item.relationship),
                  titleCase(item.status),
                  <button
                    key={item.guardianId}
                    type="button"
                    className="loan-watchlist-link"
                    onClick={() =>
                      void handleToggleGuardianStatus(
                        item.guardianId,
                        item.status === 'inactive' ? 'linked' : 'inactive',
                      )
                    }
                  >
                    {item.status === 'inactive' ? 'Activate' : 'Deactivate'}
                  </button>,
                ])}
                emptyState={{
                  title: 'No guardian records',
                  description: 'Create a guardian record before linking portal access.',
                }}
              />
              <form
                className="form-stack"
                style={{ marginTop: 16 }}
                onSubmit={(event) => void handleCreateGuardian(event)}
              >
                <p className="eyebrow">Create guardian</p>
                <label className="field-stack">
                  <span>Full name</span>
                  <input
                    value={guardianForm.fullName}
                    onChange={(event) =>
                      setGuardianForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                    placeholder="Alemu Bekele"
                  />
                </label>
                <label className="field-stack">
                  <span>Phone</span>
                  <input
                    value={guardianForm.phone}
                    onChange={(event) =>
                      setGuardianForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="0911000001"
                  />
                </label>
                <label className="field-stack">
                  <span>Relationship</span>
                  <input
                    value={guardianForm.relationship}
                    onChange={(event) =>
                      setGuardianForm((current) => ({
                        ...current,
                        relationship: event.target.value,
                      }))
                    }
                    placeholder="father"
                  />
                </label>
                <label className="field-stack">
                  <span>Status</span>
                  <select
                    value={guardianForm.status}
                    onChange={(event) =>
                      setGuardianForm((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    <option value="linked">Linked</option>
                    <option value="pending_verification">Pending verification</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <button type="submit" className="btn btn-primary">
                  Create Guardian
                </button>
                {guardianMessage ? <p className="muted">{guardianMessage}</p> : null}
              </form>
            </div>
            <div>
              <p className="eyebrow">Portal links</p>
              <SimpleTable
                headers={['Link', 'Guardian', 'Member', 'Relationship', 'Status', 'Action']}
                rows={selectedStudentDetail.guardianLinks.map((item) => [
                  item.linkId,
                  item.guardianId,
                  item.memberCustomerId,
                  titleCase(item.relationship),
                  titleCase(item.status),
                  <button
                    key={item.linkId}
                    type="button"
                    className="loan-watchlist-link"
                    onClick={() =>
                      void handleUpdateGuardianLink(
                        item.linkId,
                        item.status === 'active' ? 'inactive' : 'active',
                      )
                    }
                  >
                    {item.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>,
                ])}
                emptyState={{
                  title: 'No portal links',
                  description: 'Create a guardian-student link to enable parent portal access.',
                }}
              />
            </div>
          </div>

          <form
            className="loan-detail-grid"
            style={{ marginTop: 16 }}
            onSubmit={(event) => void handleCreateGuardianLink(event)}
          >
            <div className="form-stack">
              <p className="eyebrow">Create guardian-student link</p>
              <label className="field-stack">
                <span>Guardian</span>
                <select
                  value={linkForm.guardianId}
                  onChange={(event) =>
                    setLinkForm((current) => ({ ...current, guardianId: event.target.value }))
                  }
                >
                  <option value="">Select guardian</option>
                  {selectedStudentDetail.guardians.map((item) => (
                    <option key={item.guardianId} value={item.guardianId}>
                      {item.fullName} ({item.guardianId})
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Member customer ID</span>
                <input
                  value={linkForm.memberCustomerId}
                  onChange={(event) =>
                    setLinkForm((current) => ({
                      ...current,
                      memberCustomerId: event.target.value,
                    }))
                  }
                  placeholder="AMH-100001"
                />
              </label>
            </div>
            <div className="form-stack">
              <label className="field-stack">
                <span>Relationship</span>
                <input
                  value={linkForm.relationship}
                  onChange={(event) =>
                    setLinkForm((current) => ({ ...current, relationship: event.target.value }))
                  }
                  placeholder="father"
                />
              </label>
              <label className="field-stack">
                <span>Status</span>
                <select
                  value={linkForm.status}
                  onChange={(event) =>
                    setLinkForm((current) => ({ ...current, status: event.target.value }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending_verification">Pending verification</option>
                </select>
              </label>
              <button type="submit" className="btn btn-primary">
                Create Link
              </button>
              {linkMessage ? <p className="muted">{linkMessage}</p> : null}
            </div>
          </form>
        </Panel>
      ) : null}

      {activeSection === 'billing' ? (
        <Panel
          title="Registry And Billing"
          description="The first MVP keeps billing close to the registry so fee assignment and payment follow-up stay consistent."
        >
          <div className="loan-detail-grid">
            <form className="form-stack" onSubmit={(event) => void handleCreateFeePlan(event)}>
              <p className="eyebrow">Fee plan setup</p>
              <label className="field-stack">
                <span>School</span>
                <select
                  value={feePlanForm.schoolId}
                  onChange={(event) =>
                    setFeePlanForm((current) => ({ ...current, schoolId: event.target.value }))
                  }
                >
                  <option value="">Use selected school</option>
                  {schools.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label className="field-stack">
                  <span>Academic year</span>
                  <input
                    value={feePlanForm.academicYear}
                    onChange={(event) =>
                      setFeePlanForm((current) => ({
                        ...current,
                        academicYear: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="field-stack">
                  <span>Term</span>
                  <input
                    value={feePlanForm.term}
                    onChange={(event) =>
                      setFeePlanForm((current) => ({ ...current, term: event.target.value }))
                    }
                  />
                </label>
              </div>
              <label className="field-stack">
                <span>Grade</span>
                <select
                  value={feePlanForm.grade}
                  onChange={(event) =>
                    setFeePlanForm((current) => ({ ...current, grade: event.target.value }))
                  }
                >
                  <option value="">Select grade</option>
                  {gradeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Plan name</span>
                <input
                  value={feePlanForm.name}
                  onChange={(event) =>
                    setFeePlanForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Grade 7 Standard Plan"
                />
              </label>
              {feePlanItems.map((item, index) => (
                <div key={index} className="form-grid">
                  <label className="field-stack">
                    <span>{`Item ${index + 1}`}</span>
                    <input
                      value={item.label}
                      onChange={(event) =>
                        setFeePlanItems((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index
                              ? { ...entry, label: event.target.value }
                              : entry,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field-stack">
                    <span>Amount</span>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(event) =>
                        setFeePlanItems((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index
                              ? { ...entry, amount: event.target.value }
                              : entry,
                          ),
                        )
                      }
                    />
                  </label>
                </div>
              ))}
              <div className="loan-filter-row">
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    setFeePlanItems((current) => [
                      ...current,
                      { label: '', amount: '0' },
                    ])
                  }
                >
                  Add Fee Item
                </button>
                {feePlanItems.length > 1 ? (
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      setFeePlanItems((current) => current.slice(0, current.length - 1))
                    }
                  >
                    Remove Last Item
                  </button>
                ) : null}
              </div>
              <button type="submit" className="btn btn-primary">
                Create Fee Plan
              </button>
              {feePlanMessage ? <p className="muted">{feePlanMessage}</p> : null}
            </form>

            <div>
              <p className="eyebrow">Configured fee plans</p>
              <SimpleTable
                headers={['Plan', 'School', 'Grade', 'Term', 'Status', 'Total']}
                rows={feePlans.map((item) => [
                  item.name,
                  item.schoolName,
                  item.grade,
                  `${item.academicYear} · ${item.term}`,
                  titleCase(item.status),
                  formatMoney(item.total),
                ])}
                emptyState={{
                  title: 'No fee plans yet',
                  description: 'Create a fee plan before generating invoice batches.',
                }}
              />
            </div>
          </div>

          <div className="loan-detail-grid">
            <div>
              <p className="eyebrow">Invoice actions</p>
              <p className="muted">
                Queue reminders, jump into student payment history, or generate a school batch.
              </p>
            </div>
            <div>
              <p className="eyebrow">Batch controls</p>
              <div className="form-grid" style={{ marginBottom: 12 }}>
                <label className="field-stack">
                  <span>Grade scope</span>
                  <select
                    value={billingGradeFilter}
                    onChange={(event) => setBillingGradeFilter(event.target.value)}
                  >
                    <option value="">All grades</option>
                    {gradeOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-stack">
                  <span>Invoice status</span>
                  <select
                    value={invoiceStatusFilter}
                    onChange={(event) => setInvoiceStatusFilter(event.target.value)}
                  >
                    <option value="">All statuses</option>
                    <option value="open">Open</option>
                    <option value="partially_paid">Partially paid</option>
                    <option value="paid">Paid</option>
                  </select>
                </label>
              </div>
              <div className="loan-filter-row">
                <button type="button" className="btn" onClick={() => void handlePreviewBatch()}>
                  Preview Invoice Batch
                </button>
                <button type="button" className="btn" onClick={() => void handleBulkReminder()}>
                  Send Bulk Reminders
                </button>
                <button type="button" className="btn" onClick={handleExportInvoices}>
                  Export Invoices CSV
                </button>
                <button type="button" className="btn btn-primary" onClick={() => void handleGenerateBatch()}>
                  Generate Invoice Batch
                </button>
              </div>
              {invoiceActionMessage ? <p className="muted">{invoiceActionMessage}</p> : null}
            </div>
          </div>
          {invoicePreview ? (
            <SimpleTable
              headers={['Grade', 'Students', 'Plan', 'Plan status', 'Invoice total']}
              rows={invoicePreview.grades.map((item) => [
                item.grade,
                item.totalStudents.toLocaleString(),
                item.feePlanName ?? 'No plan',
                item.activePlan ? 'Ready' : 'Missing plan',
                item.invoiceTotal > 0 ? formatMoney(item.invoiceTotal) : 'n/a',
              ])}
              emptyState={{
                title: 'No preview rows',
                description: 'No students were found for the selected school and term.',
              }}
            />
          ) : null}
          <SimpleTable
            headers={['Invoice', 'Student', 'School', 'Total', 'Balance', 'Status', 'Actions']}
            rows={buildInvoiceRows(
              filteredInvoices,
              selectedStudentId,
              selectedInvoiceNo,
              setSelectedStudentId,
              setSelectedInvoiceNo,
              (invoiceNo) => void handleReminder(invoiceNo),
            )}
            emptyState={{
              title: 'No invoices yet',
              description: 'Generated school invoices will appear here once fee plans are published.',
            }}
          />
          {selectedInvoice ? (
            <Panel
              title={`${selectedInvoice.invoiceNo} · Invoice Detail`}
              description="Inspect one invoice in detail before sending reminders or opening payment history."
            >
              <SimpleTable
                headers={['Field', 'Value']}
                rows={[
                  ['Invoice', selectedInvoice.invoiceNo],
                  ['Student', `${selectedInvoice.studentName} (${selectedInvoice.studentId})`],
                  ['School', selectedInvoice.schoolName],
                  ['Total', formatMoney(selectedInvoice.total)],
                  ['Paid', formatMoney(selectedInvoice.paid)],
                  ['Balance', formatMoney(selectedInvoice.balance)],
                  ['Status', titleCase(selectedInvoice.status)],
                  ['Due date', selectedInvoice.dueDate],
                ]}
              />
            </Panel>
          ) : null}
        </Panel>
      ) : null}

      {activeSection === 'collections' ? (
        <Panel
          title="Collections And Reconciliation"
          description="Every school payment should move through receipt normalization, matching, and settlement tracking."
        >
          {collectionSummary ? (
            <>
              <div className="dashboard-summary-strip">
                <div className="dashboard-summary-chip">
                  <span className="dashboard-summary-label">Receipts</span>
                  <strong>{collectionSummary.receipts.toLocaleString()}</strong>
                </div>
                <div className="dashboard-summary-chip">
                  <span className="dashboard-summary-label">Successful</span>
                  <strong>{collectionSummary.successful.toLocaleString()}</strong>
                </div>
                <div className="dashboard-summary-chip">
                  <span className="dashboard-summary-label">Matched amount</span>
                  <strong>{formatMoney(collectionSummary.matchedAmount)}</strong>
                </div>
                <div className="dashboard-summary-chip">
                  <span className="dashboard-summary-label">Awaiting settlement</span>
                  <strong>{formatMoney(collectionSummary.awaitingSettlementAmount)}</strong>
                </div>
              </div>
              <div className="loan-detail-grid" style={{ marginTop: 16 }}>
                <div>
                  <p className="eyebrow">Reconciliation summary</p>
                  <SimpleTable
                    headers={['Metric', 'Value']}
                    rows={[
                      ['Generated at', formatDateTime(collectionSummary.generatedAt)],
                      ['Total amount', formatMoney(collectionSummary.totalAmount)],
                      ['Pending settlement receipts', collectionSummary.pendingSettlement.toLocaleString()],
                      ['Awaiting settlement amount', formatMoney(collectionSummary.awaitingSettlementAmount)],
                    ]}
                  />
                </div>
                <div>
                  <p className="eyebrow">Settlement aging</p>
                  <SimpleTable
                    headers={['Bucket', 'Receipts', 'Amount']}
                    rows={collectionSummary.aging.map((item) => [
                      item.label,
                      item.count.toLocaleString(),
                      formatMoney(item.amount),
                    ])}
                    emptyState={{
                      title: 'No settlement aging',
                      description: 'Awaiting-settlement receipts will appear here once they are recorded.',
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <p className="eyebrow">Settlement by school</p>
                <SimpleTable
                  headers={[
                    'School',
                    'Receipts',
                    'Total amount',
                    'Matched amount',
                    'Awaiting settlement',
                    'Pending receipts',
                    'Last recorded',
                  ]}
                  rows={visibleSchoolSettlements.map((item) => [
                    item.schoolName,
                    item.receipts.toLocaleString(),
                    formatMoney(item.totalAmount),
                    formatMoney(item.matchedAmount),
                    formatMoney(item.awaitingSettlementAmount),
                    item.pendingSettlement.toLocaleString(),
                    item.lastRecordedAt ? formatDateTime(item.lastRecordedAt) : 'n/a',
                  ])}
                  emptyState={{
                    title: 'No school settlement rows',
                    description:
                      'Settlement summaries will appear here once school-payment receipts are recorded.',
                  }}
                />
              </div>
            </>
          ) : null}
          <div className="dashboard-toolbar">
            <label className="field-stack">
              <span>Reconciliation</span>
              <select
                value={collectionReconciliationFilter}
                onChange={(event) => setCollectionReconciliationFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                {reconciliationOptions.map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-stack">
              <span>Recorded from</span>
              <input
                type="date"
                value={collectionDateFrom}
                onChange={(event) => setCollectionDateFrom(event.target.value)}
              />
            </label>
            <label className="field-stack">
              <span>Recorded to</span>
              <input
                type="date"
                value={collectionDateTo}
                onChange={(event) => setCollectionDateTo(event.target.value)}
              />
            </label>
          </div>
          <div className="loan-filter-row" style={{ marginBottom: 16 }}>
            <button type="button" className="btn" onClick={handleExportCollections}>
              Export Collections CSV
            </button>
            {schoolFilter ? (
              <p className="muted">Export scope is limited to the currently selected school.</p>
            ) : null}
            {collectionReconciliationFilter || collectionDateFrom || collectionDateTo ? (
              <p className="muted">Export uses the current reconciliation and date filters.</p>
            ) : null}
          </div>
          <SimpleTable
            headers={['Receipt', 'Student', 'Channel', 'Amount', 'Reconciliation', 'Recorded']}
            rows={buildCollectionRows(filteredCollections)}
            emptyState={{
              title: 'No collections yet',
              description: 'School payment receipts will appear here after the first successful transactions.',
            }}
          />
        </Panel>
      ) : null}

      {activeSection === 'onboarding' ? (
        <Panel
          title="School Onboarding"
          description="Create a new school profile and import starter student rows to kick off billing and collection setup."
        >
          <div className="loan-detail-grid">
            <form className="form-stack" onSubmit={(event) => void handleCreateSchool(event)}>
              <p className="eyebrow">School onboarding</p>
              <label className="field-stack">
                <span>School name</span>
                <input
                  value={schoolForm.name}
                  onChange={(event) =>
                    setSchoolForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Blue Nile Academy"
                />
              </label>
              <label className="field-stack">
                <span>School code</span>
                <input
                  value={schoolForm.code}
                  onChange={(event) =>
                    setSchoolForm((current) => ({ ...current, code: event.target.value }))
                  }
                  placeholder="SCH-3001"
                />
              </label>
              <div className="form-grid">
                <label className="field-stack">
                  <span>Linked branch</span>
                  <input
                    value={schoolForm.branchName}
                    onChange={(event) =>
                      setSchoolForm((current) => ({ ...current, branchName: event.target.value }))
                    }
                    placeholder="Bahir Dar Branch"
                  />
                </label>
                <label className="field-stack">
                  <span>City</span>
                  <input
                    value={schoolForm.city}
                    onChange={(event) =>
                      setSchoolForm((current) => ({ ...current, city: event.target.value }))
                    }
                    placeholder="Bahir Dar"
                  />
                </label>
              </div>
              <button type="submit" className="btn btn-primary">
                Create School
              </button>
            </form>

            <form className="form-stack" onSubmit={(event) => void handleImportStudents(event)}>
              <p className="eyebrow">Student import</p>
              <label className="field-stack">
                <span>School</span>
                <select
                  value={importSchoolId}
                  onChange={(event) => setImportSchoolId(event.target.value)}
                >
                  <option value="">Use first available school</option>
                  {schools.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>CSV rows</span>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder="studentId,fullName,grade,section,guardianName,guardianPhone"
                />
              </label>
              <button type="submit" className="btn btn-primary">
                Import Students
              </button>
              <p className="muted">
                Format: `studentId, fullName, grade, section, guardianName, guardianPhone`
              </p>
            </form>
          </div>
          {setupMessage ? <p className="muted">{setupMessage}</p> : null}
        </Panel>
      ) : null}
    </div>
  );
}

function buildSchoolRows(items: SchoolPortfolioItem[]) {
  return items.map((item) => [
    item.name,
    item.branchName,
    item.students.toLocaleString(),
    item.openInvoices.toLocaleString(),
    formatMoney(item.todayCollections),
    titleCase(item.status),
  ]);
}

function buildInvoiceRows(
  items: SchoolInvoiceItem[],
  selectedStudentId: string,
  selectedInvoiceNo: string,
  onOpenStudent: (studentId: string) => void,
  onOpenInvoice: (invoiceNo: string) => void,
  onSendReminder: (invoiceNo: string) => void,
) {
  return items.map((item) => [
    item.invoiceNo,
    item.studentId,
    item.schoolName,
    formatMoney(item.total),
    formatMoney(item.balance),
    titleCase(item.status),
    <div key={item.invoiceNo} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <button
        type="button"
        className="loan-watchlist-link"
        onClick={() => onOpenInvoice(item.invoiceNo)}
      >
        {selectedInvoiceNo === item.invoiceNo ? 'Opened' : 'Open detail'}
      </button>
      <button
        type="button"
        className="loan-watchlist-link"
        onClick={() => onSendReminder(item.invoiceNo)}
      >
        Send reminder
      </button>
      <button
        type="button"
        className="loan-watchlist-link"
        onClick={() => onOpenStudent(item.studentId)}
      >
        {selectedStudentId === item.studentId ? 'Payment history opened' : 'Open payment history'}
      </button>
    </div>,
  ]);
}

function buildCollectionRows(items: SchoolCollectionItem[]) {
  return items.map((item) => [
    item.receiptNo,
    item.studentId,
    titleCase(item.channel),
    formatMoney(item.amount),
    titleCase(item.reconciliationStatus),
    formatDateTime(item.recordedAt),
  ]);
}

function summarizeSchoolSettlements(items: SchoolCollectionItem[]): SchoolSettlementSummaryItem[] {
  return Array.from(
    items.reduce<Map<string, SchoolSettlementSummaryItem>>((accumulator, item) => {
      const current = accumulator.get(item.schoolId) ?? {
        schoolId: item.schoolId,
        schoolName: item.schoolName,
        receipts: 0,
        totalAmount: 0,
        matchedAmount: 0,
        awaitingSettlementAmount: 0,
        pendingSettlement: 0,
        lastRecordedAt: item.recordedAt,
      };

      current.receipts += 1;
      current.totalAmount += item.amount;
      current.lastRecordedAt =
        !current.lastRecordedAt || current.lastRecordedAt < item.recordedAt
          ? item.recordedAt
          : current.lastRecordedAt;

      if (item.reconciliationStatus === 'matched') {
        current.matchedAmount += item.amount;
      } else if (item.reconciliationStatus === 'awaiting_settlement') {
        current.awaitingSettlementAmount += item.amount;
        current.pendingSettlement += 1;
      }

      accumulator.set(item.schoolId, current);
      return accumulator;
    }, new Map())
      .values(),
  ).sort((left, right) => right.awaitingSettlementAmount - left.awaitingSettlementAmount);
}

function buildRegistryRows(
  items: StudentRegistryItem[],
  selectedStudentId: string,
  onSelect: (studentId: string) => void,
) {
  return items.map((item) => [
    `${item.fullName} (${item.studentId})`,
    item.schoolName,
    `${item.grade} · ${item.section}${item.rollNumber ? ` · ${item.rollNumber}` : ''}`,
    `${item.guardianName} (${item.guardianPhone || 'n/a'})`,
    titleCase(item.guardianStatus),
    titleCase(item.enrollmentStatus),
    item.academicYear,
    <button
      key={item.studentId}
      type="button"
      className="loan-watchlist-link"
      onClick={() => onSelect(item.studentId)}
    >
      {selectedStudentId === item.studentId ? 'Opened' : 'Open detail'}
    </button>,
  ]);
}

function formatMoney(amount?: number) {
  if (typeof amount !== 'number') {
    return '...';
  }

  return `ETB ${amount.toLocaleString()}`;
}

function titleCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (item) => item.toUpperCase());
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-ET', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function parseImportRows(input: string): StudentImportRowInput[] {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(',').map((part) => part.trim()))
    .filter((parts) => parts.length >= 2)
    .map(([studentId, fullName, grade, section, guardianName, guardianPhone]) => ({
      studentId,
      fullName,
      grade,
      section,
      guardianName,
      guardianPhone,
    }));
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  if (typeof document === 'undefined') {
    return;
  }

  const csvContent = [headers, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string | number) {
  const normalized = String(value ?? '');
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}
