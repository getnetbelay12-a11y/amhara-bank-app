# Notification Deep Links

## Goal

Every high-value notification should open the correct screen instead of dropping the user into a generic inbox.

## Mobile Deep-Link Targets

- `loan_due` -> `/loans/:id`
- `loan_overdue` -> `/loans/:id`
- `loan_approved` -> `/loans/:id`
- `loan_rejected` -> `/loans/:id`
- `loan_document_required` -> `/loans/:id`
- `loan_disbursed` -> `/loans/:id`
- `support_reply` -> `/support/:conversationId`
- `support_assigned` -> `/support/:conversationId`
- `support_resolved` -> `/support/:conversationId`
- `kyc_need_more_information` -> `/kyc` or `/fayda-verification`
- `school_payment_due` -> `/payments/school/:profileId`
- `payment_success` -> `/payments/receipts?filter=school` or `/payments/receipts?filter=qr`
- `autopay_failed` -> recurring-payment detail or payment receipts
- `suspicious_login` -> `/profile/security`
- `account_locked` -> `/profile/security`
- `account_unlocked` -> `/profile/security`
- `vote_open` -> `/shareholder/voting/:voteId`
- `vote_closing_soon` -> `/shareholder/voting/:voteId`
- `shareholder_announcement` -> `/shareholder`

## Current Mobile Routing Coverage

The current mobile app routes notifications into:

- service request detail
- loan detail
- live chat detail
- card management
- payment receipts
- Fayda verification
- school payment
- security center
- shareholder voting
- shareholder dashboard

The push payload used for local simulator delivery also carries:

- `deepLink`
- `actionLabel`
- `notificationData`

That metadata is preserved in the system-delivered notification payload, so local iPhone simulator push tests can validate both delivery and deep-link readiness.

The same payload contract is now used by the real APNs provider path for physical iPhone delivery.

## Routing Rule

Every notification should carry:

- `type`
- `actionLabel`
- `deepLink`

Optional supporting metadata:

- `entityType`
- `entityId`
- `dataPayload`

## UX Rule

The notification center remains the inbox, but tapping a notification should immediately open the related flow. Home should only show compact urgent reminder summaries, not the full notification list.

## Current Limitation

Deep-link handling is implemented for notification taps, but true cold-start routing after the app has been force-terminated still depends on adding persistent session restore on mobile.
