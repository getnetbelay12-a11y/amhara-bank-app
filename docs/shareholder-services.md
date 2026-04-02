# Shareholder Services

## Visibility Rules

- visible only for shareholder members
- voting should appear only when relevant
- shareholder messages and announcements should stay inside shareholder service areas

## Placement

- Profile or dedicated shareholder area
- Shareholder Dashboard
- active Voting
- shareholder Announcements

## Mobile Experience

Shareholder services should remain secondary and role-based:

- shareholder dashboard
- announcements
- governance messages
- voting only when active

These should not be visible as global main navigation items for all members.

## Backend

- votes
- vote_options
- vote_responses
- announcements

## Console Experience

Head Office only should manage:

- create vote
- open vote
- close vote
- results
- announcements

## APIs

- `GET /votes/active`
- `GET /votes/:id`
- `POST /votes/:id/respond`
- `GET /announcements/me`
