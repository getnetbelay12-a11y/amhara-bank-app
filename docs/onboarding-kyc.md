# Onboarding And KYC

## Goal

Provide a full digital account-opening flow that feels like a real banking process instead of a placeholder form.

## Customer Inputs

- first name
- last name
- phone number
- region
- city
- preferred branch
- Fayda front
- Fayda back
- selfie verification
- PIN

Customers should not be forced to enter a raw branch ID.

## UX Rules

- show a clear progress indicator
- validate each step before continuing
- support region to city to branch selection
- support upload from camera, gallery, or file picker where available
- show status clearly after submission

## Statuses

- draft
- submitted
- under_review
- needs_action
- verified
- rejected

## Verification Approach

The platform should support:

- automated Fayda and identity checks where available
- manual review fallback where automated verification is unavailable or inconclusive

## Evidence Handling

KYC evidence should use a real upload pipeline with stored document references, not temporary local paths.

Important evidence types:

- Fayda front
- Fayda back
- selfie
- supporting documents for remediation or manual review

## Mobile Responsibilities

- guided onboarding flow
- upload handling
- progress tracking
- status tracking
- retry path when more information is required

## Console Responsibilities

- KYC queue
- evidence review
- status update
- rejection or remediation request
- branch and district visibility according to role scope

## Backend Responsibilities

- store onboarding data
- store uploaded evidence references
- track review state
- emit notifications when the status changes
- keep audit history
