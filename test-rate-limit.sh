#!/bin/bash

# Rate Limiting Test Script
# This script tests the rate limiting functionality of the contact form

BASE_URL="http://localhost:8888/.netlify/functions/contact"
IP_ADDRESS="192.168.1.100"

echo "=========================================="
echo "Rate Limiting Test Script"
echo "=========================================="
echo ""

# Test 1: Normal request (should succeed)
echo "Test 1: Sending a normal request..."
echo "Expected: HTTP 202 Accepted"
echo ""
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: $IP_ADDRESS" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "zmiana-koloru",
    "message": "This is a test message for rate limiting.",
    "recaptchaToken": "test_token"
  }' | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Send 5 more requests (total 6, should hit the per-minute limit of 5)
echo "Test 2: Sending 5 more requests to hit the per-minute limit..."
echo "Expected: First request should succeed (HTTP 202), remaining 4 should be rate limited (HTTP 429)"
echo ""

for i in {1..5}; do
  echo "Request $i:"
  response=$(curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: $IP_ADDRESS" \
    -d "{
      \"name\": \"Test User\",
      \"email\": \"test@example.com\",
      \"subject\": \"zmiana-koloru\",
      \"message\": \"Test message $i\",
      \"recaptchaToken\": \"test_token\"
    }")

  status_code=$(echo "$response" | jq -r '.code // "unknown"')
  if [ "$status_code" = "rate_limit_exceeded" ]; then
    echo "  ✗ Rate limited (HTTP 429)"
    echo "  Limit type: $(echo "$response" | jq -r '.limitType')"
    echo "  Retry after: $(echo "$response" | jq -r '.retryAfter') seconds"
  else
    echo "  ✓ Success (HTTP 202)"
  fi
  echo ""
  sleep 1
done

echo "---"
echo ""

# Test 3: Request from different IP (should succeed)
echo "Test 3: Sending request from different IP address..."
echo "Expected: HTTP 202 Accepted (different IP should have its own rate limit)"
echo ""
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.200" \
  -d '{
    "name": "Different User",
    "email": "different@example.com",
    "subject": "zmiana-koloru",
    "message": "Test from different IP.",
    "recaptchaToken": "test_token"
  }' | jq '.'
echo ""
echo "---"
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "If all tests passed as expected, rate limiting is working correctly."
echo ""
echo "Next steps:"
echo "1. Wait 60 seconds for the rate limit to reset"
echo "2. Run the script again to verify limits reset properly"
echo "3. Check the server logs for rate limiting messages"
echo ""
