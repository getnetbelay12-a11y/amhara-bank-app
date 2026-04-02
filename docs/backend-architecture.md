# Backend Architecture

## Stack
- NestJS
- Mongoose
- MongoDB database: `amhara_bank_app`
- JWT authentication
- DTO validation with `class-validator`

## Operating Model

The platform uses one shared backend for:

- the Flutter mobile app
- the React console
- future partner or internal channels

Request path:

`Mobile App / Console -> API Gateway -> NestJS Services -> MongoDB`

This keeps customer flows, staff operations, workflows, notifications, and governance on one service layer instead of splitting mobile and console into separate backends.

## Architecture Shape

The backend is organized by business module under `backend/src/modules`.

Each module follows the same high-level structure:
- controller for HTTP entrypoints
- service for business logic
- DTOs for request validation
- Mongoose schemas for persistence
- tests for critical behaviors

Shared concerns live in:
- `backend/src/common/enums`
- `backend/src/common/constants`
- `backend/src/common/guards`
- `backend/src/common/decorators`
- `backend/src/config`

## Migration-Friendly Decisions
- normalized collections instead of large embedded documents
- workflow history separated from primary loan records
- audit logs separated from business entities
- vote responses and vote audit trails separated from vote definitions
- append-friendly transaction and activity records

## Main Backend Modules
- `auth`
- `members`
- `savings`
- `shareholders`
- `payments`
- `loans`
- `loan-workflow`
- `notifications`
- `voting`
- `staff`
- `staff-activity`
- `dashboard`
- `reports`
- `audit`

## Core Domain Collections

The backend is centered on these core business records:

- `members`
- `staff`
- `loans`
- `loan_workflow_history`
- `loan_documents`
- `transactions`
- `notifications`
- `notification_delivery_logs`
- `notification_campaigns`
- `chat_conversations`
- `chat_messages`
- `device_tokens`
- `votes`
- `vote_responses`
- `member_profiles`
- `autopay_settings`
- `staff_activity_logs`
- `staff_performance_*`

These collections intentionally separate workflow history, activity logs, and customer-facing records so the platform can move to PostgreSQL later without large document rewrites.

## Service Layer Responsibilities

### Auth Service

- member login
- staff login
- JWT session handling
- device registration

### Customer Service

- member profile
- KYC and onboarding
- linked members
- branch and district association

### Loan Service

- application intake
- workflow progression
- document requests
- repayment visibility
- customer 360 loan profile

### Payment Service

- school payments
- utility and transfer records
- autopay state
- transaction history

### Notification Service

- in-app notifications
- push delivery orchestration
- email delivery orchestration
- delivery logs and campaigns

### Chat Service

- customer support conversations
- staff assignment and SLA handling
- loan-linked routing to branch, district, or head office

### Governance Service

- active votes
- announcements
- shareholder participation

### Performance Service

- employee, branch, district, and institution summaries
- role-scoped command-center KPIs

### Risk Service

- suspicious activity watchlists
- KYC exception summaries
- support and loan exception monitoring

## Event-Driven Behaviors

The backend should treat these as first-class platform events:

- loan updated -> notification
- chat reply -> notification
- payment completed -> notification
- KYC updated -> notification
- autopay failed -> notification
- shareholder vote opened -> notification

The event source should remain business-driven even when the current implementation still dispatches directly inside services.

## Role-Based Filtering

Backend scope enforcement is mandatory:

- `HEAD_OFFICE_*` roles can see institution-wide data
- `DISTRICT_*` roles are filtered by `districtId`
- `BRANCH_*` roles are filtered by `branchId`
- governance actions remain restricted to authorized head office roles

This filtering must apply to:

- dashboard totals
- queues
- loan and KYC worklists
- support conversations
- notifications and campaigns where scope matters
- reports and watchlists

## Config

Centralized config is under `backend/src/config`:
- `app.config.ts`
- `database.config.ts`
- `auth.config.ts`
- `notification.config.ts`
- `notifications.config.ts`
- `storage.config.ts`
- `logging.config.ts`

Environment validation is handled in:
- `backend/src/config/environment.validation.ts`

## Health

`GET /health` returns:

```json
{
  "status": "ok",
  "database": "connected",
  "databaseName": "amhara_bank_app"
}
```
