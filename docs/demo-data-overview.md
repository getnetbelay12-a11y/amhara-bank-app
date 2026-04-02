# Demo Data Overview

The current seeded dataset is designed to make branch, district, and head-office review screens visibly useful.

## Coverage

- 3 districts
- 4 branches
- 11 staff accounts
- 2 shareholder members
- 6 regular members
- multiple branch, district, and head-office loan workflow states
- multiple support conversations
- onboarding review states including `review_in_progress` and `needs_action`
- autopay states including active and paused instructions
- notification pressure including `sent`, `read`, `failed`, `pending`, and `delivered`
- governance states including `draft`, `open`, and `published`
- audit events across loan, onboarding, chat, campaign, and autopay workflows

## Districts And Branches

- Bahir Dar District
  - Bahir Dar Branch
  - Debre Markos Branch
- Gondar District
  - Gondar Branch
- Woldia District
  - Dessie Branch

## Review-Focused Data Shapes

### Loans

- branch review
- district review
- head office review
- approved
- closed
- needs more info

### KYC / Onboarding

- approved
- review in progress
- needs action

### Support

- waiting agent
- assigned
- waiting customer
- resolved
- escalated

### Notifications

- member in-app notifications
- reminder campaign records
- delivery logs with failure and delivery outcomes

### Governance

- open vote with participation
- draft governance vote
- published governance vote

### Audit

- chat escalation
- autopay pause
- campaign failure
- vote opened
- onboarding needs action
- district risk review

## Primary Demo Credentials

### Staff

- `admin.head-office@amharabank.com / demo-pass`
- `manager.head-office@amharabank.com / demo-pass`
- `manager.north-district@amharabank.com / demo-pass`
- `manager.bahirdar-branch@amharabank.com / demo-pass`
- `agent.support@amharabank.com / demo-pass`

### Members

- `AMH-100001 / demo-pass`
- `0911000003 / demo-pass`
- `0911000006 / demo-pass`
- `0911000007 / demo-pass`
- `0911000008 / demo-pass`

## Source Of Truth

The seeded demo dataset is defined in:

- `/Users/getnetbelay/Documents/amhara_bank_app/backend/src/scripts/seed-demo.ts`
