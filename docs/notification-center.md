# Notification Center

## Goal

Make mobile app notifications the primary customer communication channel while keeping email as the secondary fallback and SMS or Telegram optional for special cases.

## Notification Types

- `loan_due`
- `loan_overdue`
- `loan_approved`
- `loan_document_required`
- `loan_rejected`
- `loan_disbursed`
- `insurance_renewal_due`
- `insurance_expiring`
- `insurance_expired`
- `loan_linked_insurance_reminder`
- `payment_success`
- `payment_failed`
- `school_payment_due`
- `support_reply`
- `support_assigned`
- `support_resolved`
- `suspicious_login`
- `account_locked`
- `account_unlocked`
- `phone_number_change_requested`
- `phone_number_change_completed`
- `kyc_submitted`
- `kyc_verified`
- `kyc_rejected`
- `kyc_need_more_information`
- `autopay_success`
- `autopay_failed`
- `shareholder_announcement`
- `vote_open`
- `vote_closing_soon`
- `vote_result_published`

## Channels

Primary:

- `mobile_push`

Secondary:

- `email`

Optional:

- `sms`
- `telegram`

## Mobile Experience

The mobile notification center should:

- group notifications by `Today` and `Earlier`
- persist history in the app
- show unread and read state
- open the correct destination when tapped

Deep-link targets should include:

- loan detail
- payment receipts
- live chat
- KYC or onboarding follow-up
- service request detail
- card management
- shareholder voting and announcements

## Backend Responsibilities

The backend notification system should:

- create notification records
- send push first
- fall back to email when push fails
- store delivery status
- keep metadata for deep links and action labels

## Console Responsibilities

Managers should be able to send notification campaigns through:

- mobile push
- email
- SMS

Typical use cases:

- loan reminders
- insurance reminders
- announcements
- governance notices

## Important Customer Events

- loan status changed
- loan document requested
- support reply received
- insurance near expiry
- autopay failed
- account locked or unlocked
- phone number change requested
- suspicious login detected

## Current Platform Direction

The app and backend already support:

- in-app notification history
- actionable notification metadata
- mobile deep-link routing
- manager notification workflows
- device-token registration
- mobile push as the default notification channel in the platform model
- local iPhone simulator push delivery through `xcrun simctl push`

## Local Test Coverage

The local iPhone simulator path now supports testing notification-center delivery without opening the app first.

Verified flow:

- backend creates the notification record
- backend sends the mobile push through the `ios_simulator` provider
- iOS simulator SpringBoard stores and delivers the notification
- the app badge updates even when the app is terminated

The next production-critical step remains true external APNs delivery and final cold-start session restoration.

The backend now includes an `apns` provider path for physical iPhone delivery. The remaining gap is operational:

- supply real Apple credentials
- test on signed device builds
- validate tap-through behavior on a physical phone
