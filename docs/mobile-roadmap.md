# Mobile Roadmap

## Product Direction

Amhara Bank mobile should feel like a focused daily banking app, not a miniature operations dashboard.

The working structure should stay centered on:

- Home
- Payments
- Loans
- Live Chat
- Profile

This already matches the current tab shell in `mobile/lib/src/features/navigation/presentation/member_shell.dart`, so the roadmap should preserve that familiarity and strengthen the product depth inside each area.

## Current State

Already present in the app:

- simplified daily-banking home
- payments and utility service entry points
- loan application and loan list flows
- Fayda/KYC onboarding screens
- notifications center
- live chat entry points
- profile, settings, language, beneficiaries, and phone-number update flows
- shareholder voting access for eligible members
- account lock controls and stronger security messaging

Improved in this pass:

- dynamic loan tracker detail flow
- loan workflow timeline support
- loan document upload workflow connected to loan APIs
- digital document vault surface for statements, receipts, KYC records, and loan letters

## Adopt Now

These are the patterns the mobile app should adopt immediately because the backend or UX foundation already exists.

### 1. Daily Banking Home

Keep Home intentionally narrow:

- available balance
- send money
- pay bills
- buy airtime
- apply for loan
- urgent reminders
- short recent-activity preview

Avoid pushing governance, settings, support, and deep product modules onto Home.

### 2. Onboarding and Identity

Current onboarding already covers the base flow. The next product-ready shape should be:

- phone-first registration
- branch and location capture
- Fayda front/back evidence
- selfie capture for higher-risk or escalated review
- PIN setup
- progress tracker with review states such as `submitted`, `under review`, `approved`, `needs action`

### 3. Loan Transparency

Loan experience should behave like a workflow tracker, not a static detail page.

Adopt now:

- status timeline
- clear next action
- missing-document reminders
- upload into the loan workflow
- repayment reminders
- insurance-linked reminders

### 4. Secure Self-Service

Keep improving:

- biometric login enablement
- account lock/unlock
- sensitive-action confirmation
- suspicious activity alerts
- session/device visibility

### 5. Live Chat and Support

Keep Live Chat as a core tab and not a buried support option. It already fits the product direction.

Add next:

- conversation priority labels
- reply expected-time guidance
- attachment support for support cases

### 6. Document Vault

The new vault should become the customer document hub for:

- statements
- receipts
- loan letters
- KYC submission records
- insurance notices

## Future Roadmap

These items should stay on the roadmap until backend support or deeper UX work is ready.

- camera/gallery/file picker integration for document upload
- downloadable PDFs and previews
- richer savings insights and category analytics
- stronger recurring-payment management UX
- loan calculator with affordability simulation
- shareholder document center for AGM packs and dividend notices
- support escalation visibility inside chat

## Recommended Implementation Order

1. complete onboarding progress tracking with selfie capture and review states
2. deepen loan tracker with repayment schedule and document-deficiency reasons
3. upgrade notifications into actionable reminder flows
4. add recurring-payment management polish for school, rent, utilities, and savings
5. add richer document vault APIs and file handling
6. expand insights, savings nudges, and shareholder document experiences
