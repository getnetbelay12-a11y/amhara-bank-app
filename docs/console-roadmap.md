# Console Roadmap

## Product Direction

The console should operate as a role-based bank operations platform, not a generic admin panel.

It should prioritize:

- executive dashboards
- branch and district performance visibility
- loan operations
- support operations
- campaign and reminder delivery
- governance control
- audit and risk visibility

## Current State

Already present:

- head office, district, and branch dashboard shells
- KPI summary endpoints and dashboard pages
- governance/voting console for head office roles
- notification center with reminder templates
- live chat support console APIs and web surfaces
- staff performance, watchlist, and ranking patterns
- role-aware navigation in the web shell

Strengthened recently:

- dashboard messaging framed around intervention and action
- governance flows aligned to stricter vote lifecycle rules
- watchlists improved for head office, district, and branch views

## Adopt Now

### 1. Executive Dashboards

Current dashboard hierarchy is correct and should remain:

- head office sees district performance
- district sees branch performance
- branch sees employee performance

Now make each view more operational:

- highlight watchlist items first
- surface SLA risk
- show pending-loan and pending-KYC pressure
- make intervention actions explicit

### 2. Support Console

The current chat foundation is good enough to become a real support operations surface.

Adopt now:

- open, assigned, and resolved queues
- unread counts
- waiting-time indicators
- canned reply placeholders
- clear escalation path from branch support to specialist or head office support

### 3. Loan Operations Console

The loan console should become queue-driven:

- new review queue
- deficiency queue
- escalation queue
- disbursement queue
- overdue follow-up queue
- aging views

### 4. Reminder and Campaign Console

The notification center should be treated as a service-operations tool.

Channels to keep aligned:

- in-app
- email
- SMS
- Telegram

Priority reminders:

- loan due soon
- loan overdue
- insurance renewal
- KYC pending
- autopay failure

### 5. Governance Console

Head office only:

- create vote
- validate schedule and options
- open vote
- close vote
- review participation by district and branch
- publish governance announcements

## Future Roadmap

- support SLA dashboards with breach trend reporting
- bulk reminder/campaign audience segmentation
- staff coaching notes and action tracking
- richer risk and audit timeline views
- loan document viewer and deficiency resolution workspace
- workforce planning insights by district and branch

## Recommended Implementation Order

1. complete queue-based loan operations views
2. deepen support console with SLA and escalation controls
3. connect notification center to clearer campaign history and delivery outcomes
4. add audit/risk drill-down views for managers
5. strengthen governance publishing and archive management
