#!/bin/bash
# Test all notification routes by sending curl requests to the local dev server.
# Usage: ./scripts/test-notifications.sh [BASE_URL]
# Default BASE_URL: http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"
TIMESTAMP=$(date +%s)

echo "=== Testing notification emails for all signup routes ==="
echo "Base URL: $BASE_URL"
echo ""

# 1. Contact form
echo "1/4 - Contact form (/api/contact)..."
curl -s -X POST "$BASE_URL/api/contact" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Contact\",
    \"email\": \"test-contact-${TIMESTAMP}@example.com\",
    \"subject\": \"Test notification from script\",
    \"message\": \"This is a test contact form submission to verify admin email notifications are working.\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

# 2. Notification popup (Stay Informed)
echo "2/4 - Notification popup (/api/notification-signup)..."
curl -s -X POST "$BASE_URL/api/notification-signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"email\": \"test-popup-${TIMESTAMP}@example.com\",
    \"location\": \"San Francisco, CA\",
    \"newsletter\": true,
    \"isGroup\": true,
    \"groupName\": \"Test Singers\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

# 3. Group request
echo "3/4 - Group request (/api/group-requests)..."
curl -s -X POST "$BASE_URL/api/group-requests" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test GroupReq\",
    \"email\": \"test-group-${TIMESTAMP}@example.com\",
    \"location\": \"Los Angeles, CA\",
    \"experience\": \"intermediate\",
    \"commitment\": \"regular\",
    \"genres\": [\"pop\", \"jazz\"],
    \"performanceInterest\": true,
    \"message\": \"Test group request to verify admin notification.\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

# 4. Booking request
echo "4/4 - Booking request (/api/booking-request)..."
curl -s -X POST "$BASE_URL/api/booking-request" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Booking\",
    \"email\": \"test-booking-${TIMESTAMP}@example.com\",
    \"projectType\": \"workshop\",
    \"message\": \"Test booking request to verify admin notification.\",
    \"eventDate\": \"2026-06-15\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

echo "=== Done! Check inboxes for deke@dekesharon.com and denis@theagentfactory.ai ==="
