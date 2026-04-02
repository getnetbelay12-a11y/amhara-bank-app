# Mobile Redesign Plan

## Design Goal

Keep the current live-app capability breadth, but organize it into a simpler mobile experience that customers can understand within a few seconds.

## Navigation

The mobile bottom navigation should be:

- `Home`
- `Payments`
- `Transactions`
- `Support`
- `Profile`

This removes `My Bank` as a primary bucket and redistributes its contents into clearer destination pages.

## Home

Home should stay intentionally small:

- greeting
- balance card
- 4 quick actions
- smart reminders
- recent activity preview

Quick actions:

- Send Money
- Pay Bills
- Buy Airtime
- Transfer

Smart reminders should be dynamic and only appear when relevant:

- school payment due
- utility due
- DSTV due
- loan payment due
- support reply
- insurance renewal
- autopay failure
- suspicious login alert

If there are no relevant urgent items, Home should not show an empty reminder stack. It should either omit the section or show one compact helpful tip.

## Payments Hub

Payments should be one clean grouped hub.

### Everyday Payments

- Bill Payment
- Utilities
- School Pay
- Airtime

### Transfers And Requests

- Send Money
- Request to Pay
- Beneficiaries

### Other Services

- Travel and Hotel
- Donation
- Event and Ticketing
- 3rd Party Payments

Payments should use clean rows or medium cards, not oversized colored blocks.

## Transactions

Transactions should focus on money movement visibility:

- mini statement
- transaction history
- search
- filters
- monthly grouping
- debit and credit indicators

## Support

Support should be a first-class section, not an afterthought.

- Live Chat
- ABa Care Center
- FAQ
- Branch and ATM locator

Live Chat should support:

- create chat
- history
- customer replies
- console agent assignment and reply
- notification back to mobile

## Profile

Profile should be grouped by intent.

### Account

- My Profile
- Update Phone Number
- Linked Members
- Beneficiaries

### Security

- Biometrics
- Account Lock
- Change PIN or Password
- Devices and Sessions

### Support

- Live Chat
- ABa Care Center

### Services

- Branch and ATM locator
- Exchange Rate
- Loan Calculator
- Authenticator
- Fast Track
- Spending
- ATM Order

### Legal And Settings

- Terms and Conditions
- Language
- Notifications
- Logout

### Shareholder

Visible only if the member is eligible:

- shareholder dashboard
- announcements
- active voting

## School Pay Upgrade

School Pay should become a structured recurring-payment flow:

- student profile
- school name
- monthly amount
- due date
- reminders
- history
- optional autopay

## Notifications

The app should keep a proper in-app notification center with:

- Today and Earlier grouping
- read and unread state
- deep linking
- persistent history

## Branding Rules

- blue for primary actions, headers, and important icons
- yellow for highlights and warning emphasis
- white for the main layout and content surfaces
- avoid large blue content blocks

## Delivery Order

1. live chat
2. notification center and push-first delivery
3. loan workflow tracker
4. onboarding and KYC
5. recurring payments
6. security upgrades
7. shareholder refinement
