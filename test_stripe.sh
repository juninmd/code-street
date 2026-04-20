node server/index.js &
SERVER_PID=$!
sleep 2
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"tier": "enterprise"}'
echo ""

curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "checkout.session.completed", "data": {"object": {"id": "cs_test_12345"}}}'
echo ""

kill $SERVER_PID
