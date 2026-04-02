# Live Chat

## Goal

Make Live Chat a first-class digital support channel across mobile app, backend, and console.

## Platform Flow

Live Chat should work end to end between:

- customer mobile app
- backend support APIs
- support and manager console

## Customer Capabilities

- start a support conversation
- view conversation history
- send messages
- receive replies
- receive notification when a support agent responds

## Console Capabilities

- view open chats
- view assigned chats
- view resolved chats
- assign conversation owner
- reply to the customer
- resolve or close the chat
- monitor support workload and SLA state

## Customer APIs

- `GET /support/chats/me`
- `POST /support/chats`
- `GET /support/chats/:id`
- `POST /support/chats/:id/messages`

## Console APIs

- `GET /support/console/chats/open`
- `GET /support/console/chats/assigned`
- `GET /support/console/chats/resolved`
- `GET /support/console/chats/:id`
- `POST /support/console/chats/:id/assign`
- `POST /support/console/chats/:id/messages`
- `PATCH /support/console/chats/:id/status`

## Statuses

- open
- assigned
- waiting_customer
- waiting_agent
- resolved
- closed

## Notification Behavior

Important notification events:

- support chat created
- support reply received
- conversation reassigned where applicable
- conversation resolved

Customer notifications should deep-link back into the chat thread.

## Current Direction

The current platform already has the architecture for mobile and console chat, including notification support. The remaining production-critical requirement is complete real-stack end-to-end proof for:

- customer message
- console receive
- agent reply
- mobile receive
