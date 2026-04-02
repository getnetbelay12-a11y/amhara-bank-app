# Backend Platform Roadmap

## Platform Direction

The backend should act as a shared banking service layer for both mobile and console surfaces.

It should stay:

- modular
- event-aware
- role-safe
- audit-friendly
- migration-friendly for future PostgreSQL adoption

## Current State

Already present:

- NestJS modular architecture
- MongoDB with Mongoose using `amhara_bank_app`
- auth, member, KYC, payments, loans, voting, chat, notifications, dashboard, recommendations, and reports modules
- role-aware manager dashboard services
- support chat APIs for customer and console use
- voting and governance APIs
- autopay service placeholders
- staff performance and recommendation foundations
- audit-oriented logging patterns in sensitive flows

Strengthened recently:

- stricter KYC and onboarding enforcement
- stronger voting eligibility and result restrictions
- school payment and account-lock enforcement
- ATM card request security improvements
- loan timeline and document-upload mobile contract support

## Adopt Now

### 1. Event-Driven Notification Backbone

Move notification behavior toward event publication and fan-out.

Priority events:

- loan status changed
- loan document requested
- support message received
- insurance near expiry
- autopay failed
- account locked or unlocked
- phone number changed
- vote opened or closed

Target result:

- one domain event
- multiple channel handlers
- shared notification preference checks
- reusable audit record

### 2. Unified Customer Timeline

Create a single timeline API that aggregates:

- onboarding and KYC milestones
- loan events
- payment events
- support interactions
- notification history
- account security actions

This should power both mobile transparency and console support review.

### 3. Loan Workflow Service Depth

The loan domain should keep moving toward a real workflow engine:

- document deficiency reasons
- queue ownership
- escalation states
- disbursement readiness
- overdue follow-up triggers

### 4. Shared Document Metadata Layer

Introduce a normalized document service for:

- KYC uploads
- loan documents
- receipts
- statements
- support attachments

The storage implementation can evolve later; the metadata and audit model should be stable first.

### 5. Feature and Role Flags

Keep improving the current feature-flag approach so the platform can safely control:

- shareholder-only areas
- biometric support rollouts
- autopay rollout by product
- governance publishing
- new support tools

## Future Roadmap

- outbox/event bus pattern for reliable delivery
- richer risk scoring service
- fraud or suspicious-activity rule engine
- document preview/signature pipeline
- ledger-oriented abstraction for future account movement hardening
- PostgreSQL-ready reporting projections for analytics-heavy workloads

## Recommended Implementation Order

1. add unified customer timeline service and API
2. formalize notification events and channel handlers
3. deepen loan workflow state transitions and deficiency handling
4. introduce shared document metadata service
5. expand risk scoring and anomaly detection
