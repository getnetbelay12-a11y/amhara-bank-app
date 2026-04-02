# Loan Workflow

## Goal

Upgrade loans from calculator-only visibility into a full digital workflow.

## Customer View

The customer should see:

- draft
- submitted
- branch_review
- district_review
- head_office_review
- need_more_documents
- approved
- rejected
- disbursed
- closed

The mobile experience should show:

- current status
- clear timeline
- document requests
- upload path for missing documents
- reminders
- repayment visibility

## Placement

- `Loans` section
- loan detail screen
- notification center deep links

## Customer APIs

- `GET /loans/my-loans`
- `GET /loans/:id`
- `GET /loans/:id/activity`
- `POST /loans/:id/documents`

## Console APIs

- `PATCH /staff/loans/:id/status`
- `POST /staff/loans/:id/request-documents`
- `POST /staff/loans/:id/escalate`

## Console Responsibilities

- review queue
- document request queue
- escalation to district or head office
- disbursement updates
- overdue follow-up visibility

## Notification Behavior

Customers should receive notifications for:

- status change
- document request
- approval
- rejection
- due and overdue reminders

## Current Direction

The current platform already has a loan workflow foundation across mobile, backend, and console. The improvement direction is to make the workflow easier to understand, better connected to notifications, and fully proven through one real end-to-end customer-to-console-to-customer flow.
