# API Summary

## Auth
- `POST /auth/member/login`
- `POST /auth/staff/login`
- `POST /auth/refresh`
- `GET /auth/me`

## Health
- `GET /health`

## Members
- `GET /members/me`
- `PATCH /members/me`
- `POST /members`
- `GET /members`
- `GET /members/:memberId`

## Savings
- `GET /savings/accounts/my`
- `GET /savings/accounts/:accountId`
- `GET /savings/accounts/:accountId/transactions`
- `GET /savings/accounts/member/:memberId`

## Payments
- `POST /payments/school`
- `GET /payments/school/my`
- `GET /payments/school/summary`

## Loans
- `POST /loans`
- `POST /loans/:loanId/documents`
- `GET /loans/my`
- `GET /loans/:loanId`

## Loan Workflow
- `PATCH /loan-workflow/:loanId/action`
- `GET /loan-workflow/queue`
- `GET /loan-workflow/queue/:loanId`
- `GET /loan-workflow/queue/:loanId/customer-profile`

## Notifications
- `POST /notifications`
- `GET /notifications`
- `GET /notifications/me`
- `PATCH /notifications/:notificationId/read`
- `GET /notifications/campaigns`
- `POST /notifications/campaigns`
- `POST /notifications/campaigns/:campaignId/send`
- `GET /notifications/logs`

## Uploads
- `POST /uploads/documents`
- `GET /uploads/documents`
- `GET /uploads/documents/metadata`
- `GET /insights/me`
- `GET /insights/me/home`

## Voting
- `GET /votes/active`
- `GET /votes/:id`
- `POST /votes/:id/respond`
- `GET /votes/:id/results`
- `POST /admin/votes`
- `GET /admin/votes`
- `POST /admin/votes/:id/options`
- `POST /admin/votes/:id/open`
- `POST /admin/votes/:id/close`
- `GET /admin/votes/:id/participation`

## Staff Activity
- `POST /staff-activity`
- `GET /staff-activity/performance`

## Dashboard And Reports
- `GET /manager/dashboard/summary`
- `GET /manager/dashboard/branch-performance`
- `GET /manager/dashboard/district-performance`
- `GET /manager/dashboard/staff-ranking`
- `GET /manager/dashboard/voting-summary`
- `GET /manager/command-center/head-office`
- `GET /manager/command-center/district`
- `GET /manager/command-center/branch`
- `GET /reports/manager-snapshot`

## Support

- `GET /support/chats/me`
- `POST /support/chats`
- `POST /support/chats/:chatId/messages`
- `GET /support/console/chats/open`
- `GET /support/console/chats/assigned`
- `GET /support/console/chats/resolved`
- `GET /support/console/chats/:chatId`
- `POST /support/console/chats/:chatId/reply`
- `POST /support/console/chats/:chatId/assign`
- `POST /support/console/chats/:chatId/resolve`
- `POST /support/console/chats/:chatId/close`

## Audit
- `GET /audit`
- `GET /audit/entity/:entityType/:entityId`
- `GET /audit/actor/:actorId`

## Service Requests
- `POST /service-requests`
- `GET /service-requests/my`
- `GET /service-requests/:requestId`
- `PATCH /service-requests/:requestId/cancel`
- `GET /manager/service-requests`
- `GET /manager/service-requests/:requestId`
- `PATCH /manager/service-requests/:requestId/status`

## Card Management
- `GET /cards/my`
- `POST /cards/request`
- `PATCH /cards/:cardId/lock`
- `PATCH /cards/:cardId/unlock`
- `POST /cards/:cardId/replacement`
- `GET /manager/cards/requests`
- `GET /manager/cards/requests/:requestId`
- `PATCH /manager/cards/requests/:requestId/status`
