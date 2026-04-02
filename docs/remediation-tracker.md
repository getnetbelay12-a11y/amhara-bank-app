# Remediation Tracker

Derived from [go-live-audit.md](/Users/getnetbelay/Documents/amhara_bank_app/docs/go-live-audit.md).

This tracker is ordered for stabilization and presentation readiness, not for feature expansion.

Status legend:
- `P0`: must fix before serious presentation
- `P1`: should fix immediately after P0
- `P2`: can follow after core trust blockers are closed

## P0

### 1. Real File Upload Pipeline

- Area: `backend`, `mobile`
- Problem:
  KYC, service-request, and evidence flows still rely in part on local file paths or metadata placeholders instead of real persisted uploads.
- Why it matters:
  This is a hard credibility blocker for onboarding, loan documents, and support evidence.
- Main targets:
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/common/storage/storage.service.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/loans/loans.service.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/auth/auth.service.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/features/auth/presentation/kyc_onboarding_screen.dart]
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/features/phone_number_update/presentation/phone_number_update_screen.dart]
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/features/atm_card_order/presentation/atm_card_order_screen.dart]
- Required work:
  - add a generic multipart upload endpoint
  - store uploaded files through backend storage service
  - return persistent storage keys/URLs
  - replace local-path payload usage in mobile request creation
  - add backend validation for mime type and size
- Validation:
  - upload Fayda front/back/selfie from mobile against HTTP backend
  - verify file metadata is stored server-side
  - verify staff can see the uploaded evidence in console or API response

### 2. End-to-End Chat Proof

- Area: `mobile`, `backend`, `web`
- Problem:
  Chat architecture is good, but one full customer-to-console-to-reply flow still needs proof on the real stack.
- Why it matters:
  Live chat is one of the most trust-sensitive features and is presentation-critical.
- Main targets:
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/features/chat/presentation/live_chat_list_screen.dart]
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/features/chat/presentation/live_chat_detail_screen.dart]
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/chat/chat.service.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/support/support-customer.controller.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/web/src/features/support/SupportChatWorkspace.tsx]
- Required work:
  - verify customer message appears in staff queue
  - verify agent reply returns to mobile conversation and notifications
  - verify assignment and scope rules behave correctly
- Validation:
  - scripted demo flow on real HTTP stack
  - add one integration-style test if feasible

### 3. Loan Workflow End-to-End Proof

- Area: `mobile`, `backend`, `web`
- Problem:
  Loan modules exist, but the full “customer apply -> staff update -> mobile reflects update” flow needs explicit proof.
- Why it matters:
  Loan transparency is a primary executive selling point.
- Main targets:
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/features/loans/presentation/loan_application_screen.dart]
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/features/loans/presentation/loan_detail_screen.dart]
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/loan-workflow/loan-workflow.service.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/web/src/features/loan-workflow]
- Required work:
  - verify status changes at branch/district/head-office levels
  - verify notification emission
  - verify timeline update on mobile
- Validation:
  - scripted customer-to-console-to-mobile demo run
  - preserve logs/screenshots for presentation rehearsal

### 4. Native Push Delivery

- Area: `backend`, `mobile`
- Problem:
  Notification model is push-first, but full FCM/APNs transport is still scaffolded rather than live.
- Why it matters:
  Push reliability is essential for reminders, loan updates, and support replies.
- Main targets:
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/notifications/providers/mobile-push-notification.provider.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/notifications/device-tokens.service.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/app/app_controller.dart]
- Required work:
  - replace placeholder token registration with real Firebase/APNs token collection
  - wire backend provider to actual push transport
  - validate fallback to email on push failure
- Validation:
  - send real test push to Android and iPhone
  - verify notification tap routing into mobile screens

## P1

### 5. Biometric Login Completion

- Area: `mobile`
- Problem:
  Biometric settings exist, but native auth is not a fully completed login path.
- Main targets:
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/app/app_controller.dart]
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/features/auth/presentation/enter_pin_screen.dart]
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/features/settings/presentation/settings_screen.dart]
- Required work:
  - integrate native biometric prompt
  - gate biometric login on trusted device state
  - add failure and fallback behavior
- Validation:
  - successful biometric login
  - fallback to PIN after biometric failure

### 6. Back Navigation and Screen Error Audit

- Area: `mobile`
- Problem:
  Most major screens are fixed, but there is no final checklist-driven audit proving navigation and error states everywhere.
- Main targets:
  - [/Users/getnetbelay/Documents/amhara_bank_app/mobile/lib/src/features]
- Required work:
  - inspect all detail screens for `Scaffold + AppBar + BackButton + SafeArea`
  - ensure every async screen has loading, empty, and error state
- Validation:
  - manual walkthrough checklist
  - widget tests for the most fragile screens

### 7. Role-Scope Leakage Audit

- Area: `backend`, `web`
- Problem:
  Scope filtering exists, but it should be explicitly audited for branch/district/head-office isolation.
- Main targets:
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/chat/chat.service.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/payments/payments.service.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/service-requests/service-requests.service.ts]
  - [/Users/getnetbelay/Documents/amhara_bank_app/web/src/core/session.ts]
- Required work:
  - enumerate scoped endpoints and queue pages
  - add missing negative tests for out-of-scope access
- Validation:
  - branch user cannot see district data
  - district user cannot see unrelated district data
  - only head office sees institution-wide governance/admin views

## P2

### 8. Performance Baseline

- Area: `backend`, `mobile`, `web`
- Problem:
  Response-time expectations are not documented or measured.
- Required work:
  - capture timings for login, notifications, chat fetch, loan fetch
  - note demo vs live backend differences
- Validation:
  - simple benchmark sheet for presentation use

### 9. Campaign/Email Real Delivery Validation

- Area: `backend`, `web`
- Problem:
  Campaign and email systems exist, but live delivery proof is still limited.
- Main targets:
  - [/Users/getnetbelay/Documents/amhara_bank_app/backend/src/modules/notifications]
  - [/Users/getnetbelay/Documents/amhara_bank_app/web/src/features/notifications/ManagerNotificationCenterPage.tsx]
- Required work:
  - send real loan and insurance reminders to test inboxes
  - verify delivery logs and fallback behavior
- Validation:
  - record real delivery outcomes for presentation/demo readiness

## Suggested Execution Sequence

1. Real upload pipeline
2. Chat E2E proof
3. Loan E2E proof
4. Real push transport
5. Biometric completion
6. Role-scope audit
7. Screen/back-navigation audit
8. Delivery/performance proof

## Presentation Rule

Do not add more features until all `P0` items are closed.
