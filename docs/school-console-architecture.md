# School Console Architecture

This scaffold introduces a dedicated school console while keeping the existing app as one shared platform.

## Design choice
- separate school-facing workspace
- shared auth, payments, notifications, uploads, reports, and audit layers
- strict `schoolId` scoping on school-domain records

## Backend modules added
- `institutions`
- `students`
- `fee-plans`
- `invoices`
- `school-payments`
- `school-reports`

## Web surface added
- `web/src/features/school-console/SchoolConsolePage.tsx`

## MVP scope
- school onboarding overview
- student registry starter model
- fee-plan starter model
- invoice overview
- collections and reconciliation overview

## Next implementation slice
1. replace fixture-backed services with Mongoose persistence
2. add enrollment and guardian modules
3. connect the web console to HTTP clients
4. extend mobile school-payment flow to real student/invoice lookup
