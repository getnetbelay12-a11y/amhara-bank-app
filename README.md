# Amhara Bank App PoC

Documentation-first modular monorepo for an Amhara Bank digital platform covering:
- shareholder members
- regular members
- branch, district, and head office staff
- managers
- admins

## Workspaces
- `backend/` NestJS API with MongoDB via Mongoose
- `mobile/` Flutter member application
- `web/` React manager/admin dashboard
- `docs/` product, API, and screen design
- `flows/` user and operational workflows
- `database/` schema notes and starter models
- `infrastructure/` environment examples and deployment notes

## Implemented Backend Modules
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

## Core Business Rules
- Member types are `shareholder` and `member`
- Only shareholder members can vote
- One vote is allowed per member per vote event
- Loan amount `<= 20,000,000 ETB` stays at branch level
- Loan amount `> 20,000,000 ETB` moves branch -> district -> head office
- Important actions create audit logs, workflow history, notifications, and staff activity where relevant

## Run The Backend
```bash
cd backend
npm install
npm run build
npm test -- --runInBand
npm run seed:demo
npm run start:dev
```

Required environment values are listed in [infrastructure/backend.env.example](/Users/getnetbelay/Documents/amhara_bank_app/infrastructure/backend.env.example).
Database details are documented in [docs/database.md](/Users/getnetbelay/Documents/amhara_bank_app/docs/database.md).

Demo dataset:
- run `npm run seed:demo` in `backend/`
- member login: `AMH-100001 / demo-pass`
- member PIN flow: `AMH-100001` then `1234`
- staff admin: `admin.head-office@amharabank.com / demo-pass`
- staff district: `manager.north-district@amharabank.com / demo-pass`
- staff branch: `manager.bahirdar-branch@amharabank.com / demo-pass`
- support agent: `agent.support@amharabank.com / demo-pass`
- extra member demos: `0911000006`, `0911000007`, `0911000008` with password `demo-pass`
- helper: `./infrastructure/run-local-demo.sh`
- stack runner: `./infrastructure/start-local-stack.sh --seed`
- seeded review guide: [docs/seeded-review-checklist.md](/Users/getnetbelay/Documents/amhara_bank_app/docs/seeded-review-checklist.md)
- demo data overview: [docs/demo-data-overview.md](/Users/getnetbelay/Documents/amhara_bank_app/docs/demo-data-overview.md)

## Run The Web App
```bash
cd web
npm install
npm run dev
```

Real API mode:
- set `VITE_API_BASE_URL` from [web/.env.example](/Users/getnetbelay/Documents/amhara_bank_app/web/.env.example)
- web will use HTTP-first clients for auth, dashboard, notifications, voting, and audit
- quick start: `./infrastructure/start-local-stack.sh`

Fallback mode:
- if `VITE_API_BASE_URL` is unset or requests fail, the app falls back to demo adapters

## Run The Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

Real API mode:
- run with `flutter run --dart-define=API_BASE_URL=http://localhost:4000`
- mobile will use HTTP-first clients for member auth, profile, and savings
- if backend/web are already running: `./infrastructure/start-local-stack.sh --seed` then launch Flutter separately

Fallback mode:
- if `API_BASE_URL` is not provided or requests fail, the app falls back to demo adapters

## Current Verification Status
- Backend TypeScript build passes
- Backend Jest suite passes
- Web production build passes
- Mobile `flutter analyze` passes

## Smoke Paths
1. Staff web: log in with `admin.head-office@amharabank.com / demo-pass`, `manager.north-district@amharabank.com / demo-pass`, or `manager.bahirdar-branch@amharabank.com / demo-pass`, then review the role-scoped dashboard, loan queue, support queue, and notifications.
2. Member mobile: sign in with `AMH-100001 / demo-pass`, then open Home and Savings to load the shareholder member profile, account balances, and recent transactions.
3. Full seeded review: use [docs/seeded-review-checklist.md](/Users/getnetbelay/Documents/amhara_bank_app/docs/seeded-review-checklist.md) for head-office, district, branch, live-chat, autopay, audit, and governance validation.

## Local Stack Helper
- `./infrastructure/start-local-stack.sh` starts backend and web together
- `./infrastructure/start-local-stack.sh --seed` seeds demo data first
- `./infrastructure/run-local-demo.sh` prints the equivalent manual commands

## Config Reuse Notes
- selective reuse decisions are documented in [docs/reuse-from-ethiopia-insurance-app.md](/Users/getnetbelay/Documents/amhara_bank_app/docs/reuse-from-ethiopia-insurance-app.md)

## Recommended Next Steps
1. Use [docs/seeded-review-checklist.md](/Users/getnetbelay/Documents/amhara_bank_app/docs/seeded-review-checklist.md) to run role-by-role seeded review across web and mobile
2. Add targeted UI polish where the richer demo data exposes cramped cards, weak empty states, or unclear labels
3. Add only targeted tests when new behavior is introduced
