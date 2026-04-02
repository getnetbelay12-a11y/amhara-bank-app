# Mobile Push Notifications

## Goal

Mobile push notifications are a major upgrade beyond the current live app alert experience. The platform should treat mobile push as the primary customer notification channel and use email as the main fallback for important reminders.

## Channel Strategy

Primary:

- `mobile_push`

Secondary:

- `email`

Optional fallback:

- `sms`
- `telegram`

Default behavior:

- send mobile push first
- fall back to email for important cases when configured
- keep SMS and Telegram optional for critical or special workflows

## Supported Notification Types

### Loan

- `loan_due`
- `loan_overdue`
- `loan_approved`
- `loan_rejected`
- `loan_document_required`
- `loan_disbursed`

### Insurance

- `insurance_renewal_due`
- `insurance_expiring`
- `insurance_expired`
- `loan_linked_insurance_reminder`

### Payments

- `payment_success`
- `payment_failed`
- `school_payment_due`
- `autopay_success`
- `autopay_failed`

### Support

- `support_reply`
- `support_assigned`
- `support_resolved`

### Security

- `suspicious_login`
- `account_locked`
- `account_unlocked`
- `phone_number_change_requested`
- `phone_number_change_completed`

### Onboarding And KYC

- `kyc_submitted`
- `kyc_verified`
- `kyc_rejected`
- `kyc_need_more_information`

### Shareholder And Governance

- `shareholder_announcement`
- `vote_open`
- `vote_closing_soon`
- `vote_result_published`

## Push Registration Flow

When a user signs in on mobile:

1. the app creates or refreshes a device identifier
2. on iPhone, the app requests notification permission and registers for remote notifications
3. the app registers the device token with the backend
3. the backend stores the user and device token mapping
4. future push notifications target the stored devices first

Stored device token fields:

- `userId`
- `deviceId`
- `platform`
- `token`
- `appVersion`
- `updatedAt`

## Backend Models

The notification stack uses:

- `notifications`
- `notification_campaigns`
- `notification_logs`
- `device_tokens`

Current platform note:

`notification_logs` is the delivery-log collection already used by campaigns and reminder sending. It acts as the practical delivery-log store for the current implementation.

## Console Behavior

The manager notification console supports:

- mobile push
- email
- SMS
- Telegram

Managers can use push delivery for:

- loan reminders
- insurance reminders
- announcements
- shareholder updates

## Local iPhone Simulator Test Mode

For local development, the backend supports a simulator-only push provider:

- `PUSH_PROVIDER=ios_simulator`
- `PUSH_IOS_SIMULATOR_DEVICE=booted`
- `PUSH_IOS_SIMULATOR_BUNDLE_ID=com.getnetbelay.amharaBankMobile`

This provider sends APNs-style payloads to the booted iPhone simulator through:

- `xcrun simctl push`

That allows local testing of:

- notification delivery while the app is closed
- system badge updates
- push payload deep-link metadata

The current local verification path was tested with a `school_payment_due` notification and confirmed through:

- backend send result `status=sent`
- SpringBoard notification delivery logs
- the simulator delivered-notification store

## Real iPhone APNs Mode

For physical-device testing and production-style delivery, the backend now also supports:

- `PUSH_PROVIDER=apns`
- `APNS_TEAM_ID`
- `APNS_KEY_ID`
- `APNS_BUNDLE_ID`
- `APNS_PRIVATE_KEY`
- `APNS_USE_SANDBOX=true` for development builds

This provider uses Apple token-based authentication over HTTP/2 and sends the same deep-link payload structure as the simulator path.

## Why This Is An Upgrade

The live app already signals strong security and alert behavior, but this platform upgrade improves it by adding:

- persistent in-app notification history
- push-first delivery design
- deep-link navigation into the exact workflow
- manager-triggered campaigns across channels
- customer workflow alerts for loans, support, payments, KYC, and governance

## Production Gap

The application-level push flow, iPhone registration, storage, and routing are implemented. The remaining production setup is:

- real APNs credentials populated in the environment
- optional Firebase/APNs abstraction for Android parity
- final production certificate and signing configuration
- persistent mobile session restore for true cold-start tap routing after the app has been fully terminated
