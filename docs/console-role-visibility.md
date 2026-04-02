# Console Role Visibility

## Goal

Keep the console strictly role-based so branch, district, and head office staff only see the data and workflows they are responsible for.

## Head Office

Head Office should see:

- institution-wide analytics
- district performance
- enterprise notification campaigns
- governance and voting management
- institution-wide support and loan visibility where policy allows

## District

District users should see:

- branch performance within the district
- district loan escalations
- district support workload
- district KYC and exception visibility where policy allows

District users should not see unrelated districts.

## Branch

Branch users should see:

- branch employee performance
- branch loan queue
- branch KYC queue
- branch support operations
- branch service-request handling

Branch users should not see unrelated branches.

## Console Areas

Role-based console areas should include:

- dashboard and performance reporting
- loan operations
- support workspace
- notification campaigns
- governance
- customer 360 view
- KYC and exception queues
- autopay and school-payment operations

## Key Restriction Rules

- Head Office can create, open, close, and publish governance actions
- district scope must be filtered to the user district
- branch scope must be filtered to the user branch
- no cross-scope leakage in summary tiles, queues, or details

## Role Expectations

### Head Office

- institution-wide KPIs
- district ranking
- branch outlier alerts
- risk watchlists
- support and notification command-center visibility
- governance controls

### District

- only branches in district
- branch ranking and queue pressure
- district loan escalations
- KYC and support backlog by branch
- complaint and overdue ratios across district branches

### Branch

- own branch employees and queues only
- daily loan, KYC, support, autopay, card, and phone-update worklists
- suspicious account actions that require branch review

### Governance Roles

- active votes
- participation analysis
- announcements
- results after close
- no access for non-authorized non-head-office users

## Validation Expectations

Before any serious presentation or go-live claim, the platform should prove:

- head office sees institution-wide data
- district sees district-only data
- branch sees branch-only data
- no employee, branch, district, or customer data leaks across scopes
