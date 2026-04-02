#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:4000}"

member_login="$(
  curl -s -X POST "$BASE_URL/auth/member/login" \
    -H 'Content-Type: application/json' \
    -d '{"customerId":"AMH-100001","password":"demo-pass"}'
)"
member_token="$(printf '%s' "$member_login" | jq -r '.accessToken')"

head_office_login="$(
  curl -s -X POST "$BASE_URL/auth/staff/login" \
    -H 'Content-Type: application/json' \
    -d '{"identifier":"admin.head-office@amharabank.com","password":"demo-pass"}' \
)"
head_office_token="$(printf '%s' "$head_office_login" | jq -r '.accessToken')"

district_login="$(
  curl -s -X POST "$BASE_URL/auth/staff/login" \
    -H 'Content-Type: application/json' \
    -d '{"identifier":"manager.north-district@amharabank.com","password":"demo-pass"}'
)"

branch_login="$(
  curl -s -X POST "$BASE_URL/auth/staff/login" \
    -H 'Content-Type: application/json' \
    -d '{"identifier":"manager.bahirdar-branch@amharabank.com","password":"demo-pass"}'
)"

district_token="$(printf '%s' "$district_login" | jq -r '.accessToken')"
branch_token="$(printf '%s' "$branch_login" | jq -r '.accessToken')"

accounts="$(
  curl -s "$BASE_URL/savings/accounts/my" \
    -H "Authorization: Bearer $member_token"
)"

loans="$(
  curl -s "$BASE_URL/loans/my" \
    -H "Authorization: Bearer $member_token"
)"

notifications="$(
  curl -s "$BASE_URL/notifications/me" \
    -H "Authorization: Bearer $member_token"
)"

votes="$(
  curl -s "$BASE_URL/votes/active" \
    -H "Authorization: Bearer $member_token"
)"

chats="$(
  curl -s "$BASE_URL/support/chats/me" \
    -H "Authorization: Bearer $member_token"
)"

support_open="$(
  curl -s "$BASE_URL/support/console/chats/open" \
    -H "Authorization: Bearer $head_office_token"
)"

loan_queue="$(
  curl -s "$BASE_URL/loan-workflow/queue" \
    -H "Authorization: Bearer $head_office_token"
)"

district_support_open="$(
  curl -s "$BASE_URL/support/console/chats/open" \
    -H "Authorization: Bearer $district_token"
)"

branch_support_open="$(
  curl -s "$BASE_URL/support/console/chats/open" \
    -H "Authorization: Bearer $branch_token"
)"

district_loan_queue="$(
  curl -s "$BASE_URL/loan-workflow/queue" \
    -H "Authorization: Bearer $district_token"
)"

branch_loan_queue="$(
  curl -s "$BASE_URL/loan-workflow/queue" \
    -H "Authorization: Bearer $branch_token"
)"

out_of_scope_loan_id="$(
  jq -rn \
    --argjson all "$loan_queue" \
    --argjson branch "$branch_loan_queue" \
    '
      ($branch | map(.loanId)) as $branchIds
      | ($all | map(. as $item | select(($branchIds | index($item.loanId)) == null)) | .[0].loanId) // ""
    '
)"

branch_out_of_scope_loan_status="n/a"
if [[ -n "$out_of_scope_loan_id" ]]; then
  branch_out_of_scope_loan_status="$(
    curl -s -o /tmp/amhara_branch_out_of_scope_loan.json -w '%{http_code}' \
      "$BASE_URL/loan-workflow/queue/$out_of_scope_loan_id" \
      -H "Authorization: Bearer $branch_token"
  )"
fi

chat_probe_message="Live verification $(date +%s)"
created_chat="$(
  curl -s -X POST "$BASE_URL/support/chats" \
    -H "Authorization: Bearer $member_token" \
    -H 'Content-Type: application/json' \
    -d "{
      \"issueCategory\":\"general_help\",
      \"initialMessage\":\"$chat_probe_message\"
    }"
)"
created_chat_id="$(printf '%s' "$created_chat" | jq -r '.conversationId // .id')"

assigned_chat="$(
  curl -s -X POST "$BASE_URL/support/console/chats/$created_chat_id/assign" \
    -H "Authorization: Bearer $head_office_token" \
    -H 'Content-Type: application/json' \
    -d '{}'
)"

reply_text="Support reply $(date +%s)"
staff_reply="$(
  curl -s -X POST "$BASE_URL/support/console/chats/$created_chat_id/messages" \
    -H "Authorization: Bearer $head_office_token" \
    -H 'Content-Type: application/json' \
    -d "{
      \"message\":\"$reply_text\"
    }"
)"

member_chat_detail="$(
  curl -s "$BASE_URL/support/chats/$created_chat_id" \
    -H "Authorization: Bearer $member_token"
)"

account_id="$(printf '%s' "$accounts" | jq -r '.[0]._id // .[0].accountId // empty')"
payment='null'

if [[ -n "$account_id" ]]; then
  payment="$(
    curl -s -X POST "$BASE_URL/payments/school" \
      -H "Authorization: Bearer $member_token" \
      -H 'Content-Type: application/json' \
      -d "{
        \"accountId\":\"$account_id\",
        \"studentId\":\"ST-VERIFY-01\",
        \"schoolName\":\"Blue Nile Academy\",
        \"amount\":25,
        \"channel\":\"mobile\",
        \"narration\":\"verification payment\"
      }"
  )"
fi

jq -n \
  --argjson accounts "$accounts" \
  --argjson loans "$loans" \
  --argjson notifications "$notifications" \
  --argjson votes "$votes" \
  --argjson chats "$chats" \
  --argjson headOfficeLogin "$head_office_login" \
  --argjson districtLogin "$district_login" \
  --argjson branchLogin "$branch_login" \
  --argjson supportOpen "$support_open" \
  --argjson districtSupportOpen "$district_support_open" \
  --argjson branchSupportOpen "$branch_support_open" \
  --argjson loanQueue "$loan_queue" \
  --argjson districtLoanQueue "$district_loan_queue" \
  --argjson branchLoanQueue "$branch_loan_queue" \
  --argjson createdChat "$created_chat" \
  --argjson assignedChat "$assigned_chat" \
  --argjson staffReply "$staff_reply" \
  --argjson memberChatDetail "$member_chat_detail" \
  --arg createdChatId "$created_chat_id" \
  --arg chatProbeMessage "$chat_probe_message" \
  --arg replyText "$reply_text" \
  --arg branchOutOfScopeLoanStatus "$branch_out_of_scope_loan_status" \
  --argjson payment "$payment" \
  '{
    member: {
      accounts: ($accounts | length),
      loans: ($loans | length),
      notifications: ($notifications | length),
      activeVotes: ($votes | length),
      chats: ($chats | length),
      liveChatRoundtrip: {
        conversationId: $createdChatId,
        initialMessageStored: ((($createdChat.messages // []) | map(.message) | index($chatProbeMessage)) != null),
        replyReturnedToMember: ((($memberChatDetail.messages // []) | map(.message) | index($replyText)) != null),
        currentStatus: ($memberChatDetail.status // null)
      },
      paymentResult: $payment
    },
    staff: {
      headOffice: {
        role: ($headOfficeLogin.user.role // null),
        branchId: ($headOfficeLogin.user.branchId // null),
        districtId: ($headOfficeLogin.user.districtId // null),
        permissions: ($headOfficeLogin.user.permissions // []),
        openSupportChats: ($supportOpen | length),
        loanQueue: ($loanQueue | length)
      },
      district: {
        role: ($districtLogin.user.role // null),
        districtId: ($districtLogin.user.districtId // null),
        openSupportChats: ($districtSupportOpen | length),
        loanQueue: ($districtLoanQueue | length)
      },
      branch: {
        role: ($branchLogin.user.role // null),
        branchId: ($branchLogin.user.branchId // null),
        districtId: ($branchLogin.user.districtId // null),
        openSupportChats: ($branchSupportOpen | length),
        loanQueue: ($branchLoanQueue | length),
        outOfScopeLoanDetailStatus: $branchOutOfScopeLoanStatus
      },
      liveChatConsoleFlow: {
        assignedAgentId: ($assignedChat.assignedAgentId // $assignedChat.assignedToStaffId // null),
        statusAfterReply: ($staffReply.status // null)
      },
      firstLoanActions: ($loanQueue[0].availableActions // [])
    }
  }'
