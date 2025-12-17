#!/bin/bash

# Script to test load balancing
# This script sends multiple requests to test if load is distributed across backend instances

echo "=========================================="
echo "Testing Load Balancing"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API endpoint
API_URL="http://localhost/api/health"

echo -e "${BLUE}Testing health endpoint: ${API_URL}${NC}"
echo ""

# Test 1: Single request
echo -e "${YELLOW}Test 1: Single request${NC}"
response=$(curl -s -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s" $API_URL)
echo "$response"
echo ""

# Test 2: Multiple concurrent requests
echo -e "${YELLOW}Test 2: 10 concurrent requests${NC}"
for i in {1..10}; do
    (
        response=$(curl -s $API_URL)
        echo "Request $i: $response"
    ) &
done
wait
echo ""

# Test 3: Sequential requests to see response times
echo -e "${YELLOW}Test 3: 20 sequential requests with timing${NC}"
for i in {1..20}; do
    time=$(curl -s -o /dev/null -w "%{time_total}" $API_URL)
    echo -e "Request $i: ${GREEN}${time}s${NC}"
done
echo ""

# Test 4: Check if all backend instances are responding
echo -e "${YELLOW}Test 4: Checking backend instances directly${NC}"
echo "Note: These should only work if ports are exposed"
for port in 9999; do
    echo -e "Checking backend on port $port..."
    response=$(curl -s http://localhost:$port/api/health 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend on port $port is responding${NC}"
    else
        echo -e "${YELLOW}⚠ Backend on port $port is not accessible (this is normal if ports are not exposed)${NC}"
    fi
done
echo ""

# Test 5: Load test with Apache Bench (if available)
if command -v ab &> /dev/null; then
    echo -e "${YELLOW}Test 5: Load test with Apache Bench (100 requests, 10 concurrent)${NC}"
    ab -n 100 -c 10 $API_URL
else
    echo -e "${YELLOW}Test 5: Apache Bench not installed. Install with: apt-get install apache2-utils${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Load balancing test completed!"
echo "==========================================${NC}"

