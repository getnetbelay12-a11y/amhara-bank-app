# Seeded Review Checklist

Use this checklist after starting the seeded local stack:

```bash
./infrastructure/start-local-stack.sh --seed
```

## Seeded Accounts

### Staff

- Head office: `admin.head-office@amharabank.com / demo-pass`
- Head office manager: `manager.head-office@amharabank.com / demo-pass`
- District manager: `manager.north-district@amharabank.com / demo-pass`
- Branch manager: `manager.bahirdar-branch@amharabank.com / demo-pass`
- Support agent: `agent.support@amharabank.com / demo-pass`

### Members

- Shareholder: `AMH-100001 / demo-pass`
- Member: `0911000003 / demo-pass`
- Member: `0911000006 / demo-pass`
- Member: `0911000007 / demo-pass`
- Member: `0911000008 / demo-pass`

## Head Office Review

Sign in with `admin.head-office@amharabank.com / demo-pass`.

Check:

- institution dashboard loads with district comparisons
- loan queue shows multiple items across branch, district, and head-office review
- notification center shows loan and insurance reminder pressure
- governance area shows `open`, `draft`, and `published` vote states
- audit area shows autopay, campaign, vote, onboarding, and chat activity
- risk area shows actionable loan, KYC, support, and notification pressure

## District Review

Sign in with `manager.north-district@amharabank.com / demo-pass`.

Check:

- district dashboard loads only district-scoped branch data
- branch performance shows Bahir Dar and Debre Markos comparisons
- district support shows multiple active conversations
- district loan queue shows branch and district-level items only
- KYC/onboarding queue includes `review_in_progress` and `needs_action`
- district user cannot access institution-wide data outside their scope

## Branch Review

Sign in with `manager.bahirdar-branch@amharabank.com / demo-pass`.

Check:

- branch dashboard loads only Bahir Dar branch data
- employee performance shows multiple staff rows, not just one officer
- branch loan queue shows branch-owned cases only
- branch KYC queue shows active review workload
- branch support shows scoped member chats only
- branch user cannot open out-of-scope district or branch records

## Live Chat Review

1. Sign in on mobile with `AMH-100001 / demo-pass`
2. Open `Live Chat`
3. Start a new support message
4. In the web console, open support inbox as head office or support agent
5. Confirm the conversation appears in the open queue
6. Reply from the console
7. Confirm the reply appears back in the mobile app

## Operations Review

Check these seeded areas too:

- AutoPay operations has active and paused instructions
- notification watchlists show failures and delivered reminders
- audit viewer has high-signal rows across multiple days
- governance participation is not empty because the open vote has seeded responses

## Quick Health Check

Run:

```bash
./scripts/verify_live_api.sh
```

Expected:

- live chat roundtrip passes
- scoped staff logins pass
- branch out-of-scope loan detail returns `404`
