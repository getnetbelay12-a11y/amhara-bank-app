# Backend

NestJS API workspace for the Amhara Bank PoC.

## Implemented Modules
- `auth`
- `members`
- `payments`
- `loans`
- `loan-workflow`
- `notifications`
- `voting`
- `staff-activity`
- `dashboard`
- `reports`
- `audit`

## Commands
```bash
npm install
npm run build
npm test -- --runInBand
npm run seed:demo
npm run start:dev
```

## Demo Seed
`npm run seed:demo` populates a usable PoC dataset for:
- member login: `AMH-100001 / demo-pass`
- member PIN flow: `AMH-100001` then `1234`
- staff admin: `admin.head-office@amharabank.com / demo-pass`
- staff district: `manager.north-district@amharabank.com / demo-pass`
- staff branch: `manager.bahirdar-branch@amharabank.com / demo-pass`
- savings accounts, transactions, school payments, loans, notifications, and an active shareholder vote

## Environment
See [infrastructure/backend.env.example](/Users/getnetbelay/Documents/amhara_bank_app/infrastructure/backend.env.example).

## Notes
- Uses MongoDB via Mongoose for the PoC
- Keeps workflow history, audit logs, vote responses, and notifications in separate append-friendly collections
- Designed to stay migration-friendly for a future PostgreSQL move
