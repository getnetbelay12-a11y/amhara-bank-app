# Database

## Database Name

The backend uses MongoDB with the database name:

`amhara_bank_app`

Local default:

`mongodb://localhost:27017/amhara_bank_app`

Atlas example:

`mongodb+srv://<username>:<password>@cluster.mongodb.net/amhara_bank_app`

## Local Run

1. Copy `backend/.env.development.example` to `backend/.env`.
2. Ensure `MONGODB_URI` points to `amhara_bank_app`.
3. Start MongoDB locally.
4. Run the backend:

```bash
cd backend
npm install
npm run start:dev
```

Optional demo seed:

```bash
cd backend
npm run seed:demo
```

## MongoDB Atlas

Set `MONGODB_URI` to an Atlas URI that ends with `/amhara_bank_app`.

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/amhara_bank_app
```

Keep Atlas usernames, passwords, and connection options only in private `.env` files.

## Collection Creation

MongoDB creates the `amhara_bank_app` database and its collections automatically when the application first inserts documents.

You do not need to manually create the database in the Mongo shell.

## Expected Collections

- `members`
- `staff`
- `branches`
- `districts`
- `savings_accounts`
- `transactions`
- `loans`
- `loan_workflow_history`
- `loan_documents`
- `notifications`
- `staff_activity_logs`
- `staff_performance_daily`
- `staff_performance_weekly`
- `staff_performance_monthly`
- `staff_performance_yearly`
- `votes`
- `vote_options`
- `vote_responses`
- `vote_audit_logs`
- `audit_logs`

## Core Record Shapes

The platform should keep these record families stable because both mobile and console rely on them:

### Members

- member identity and contact data
- `branchId`
- `districtId`
- `memberType`
- `isShareholder`
- lifecycle status

### Staff

- role
- branch and district assignment
- permissions
- status

### Loans

- `userId` or `memberId`
- amount
- status
- `currentLevel`
- supporting documents
- timestamps

### Loan Timeline

- stage-by-stage workflow events
- actor role and comment when relevant

### Chats

- conversations
- messages
- assignment state
- support routing scope

### Notifications

- type
- title
- message
- read or unread state
- delivery channel
- created and delivered timestamps

### School Payments

- student profile
- school name
- monthly fee
- due date
- auto-pay state

### Performance Metrics

- employee summaries
- branch summaries
- district summaries

### Voting

- vote definition
- options
- responses
- lifecycle status

## Connection Logging

At startup, the backend logs:

- `Connected to MongoDB database: amhara_bank_app`
- `Mongo host: <hostname>`
