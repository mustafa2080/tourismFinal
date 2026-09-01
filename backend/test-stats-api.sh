#!/bin/bash

# Test the API endpoint
echo "Testing /api/dashboard/stats/advanced endpoint"

# Replace with actual token - you can get it from browser storage or login response
TOKEN="your_token_here"

curl -X GET http://localhost:5000/api/dashboard/stats/advanced \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -v
