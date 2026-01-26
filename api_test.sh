#!/bin/bash

BASE_URL="http://localhost:3000/api/features"

echo "1. Creating a new feature..."
curl -s -X POST -H "Content-Type: application/json" -d '{"title": "Dark Mode", "description": "Please add dark mode"}' $BASE_URL
echo -e "\n"

echo "2. Listing features..."
curl -s $BASE_URL | grep "Dark Mode" && echo "Feature found!" || echo "Feature NOT found!"
echo -e "\n"

# Get ID (Assuming it is 1 for the first one)
ID=1

echo "3. Voting for feature $ID..."
curl -s -X POST $BASE_URL/$ID/vote
echo -e "\n"

echo "4. Updating status for feature $ID..."
curl -s -X PATCH -H "Content-Type: application/json" -d '{"status": "planned"}' $BASE_URL/$ID/status
echo -e "\n"

echo "5. Verifying update..."
curl -s $BASE_URL | grep "planned" && echo "Status updated!" || echo "Status NOT updated!"
echo -e "\n"
