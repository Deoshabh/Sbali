# 🚀 Shiprocket Webhook Integration with Real-time Updates

## Complete Production-Ready Implementation

### ✅ What's Implemented

#### Backend (Node.js/Express)

- ✅ Secure webhook endpoint with HMAC-SHA256 signature verification
- ✅ IP whitelist middleware for Shiprocket servers
- ✅ Idempotency checks (prevents duplicate processing)
- ✅ Asynchronous processing (immediate 200 OK response)
- ✅ WebhookLog model for audit trail
- ✅ Order model with trackingHistory timeline
- ✅ Real-time updates via Soketi/Pusher
- ✅ Admin endpoints for webhook log management

#### Frontend (React/Next.js)

- ✅ OrderTracker component with real-time updates
- ✅ Visual timeline of shipment journey
- ✅ Socket reconnection logic
- ✅ Current status with icons and colors
- ✅ AWB, courier, and ETA display

#### Security

- ✅ HMAC signature verification
- ✅ IP whitelist (Shiprocket IPs)
- ✅ Fallback token authentication
- ✅ Environment variable configuration

---

## 📁 Files Created/Modified

### Backend

1. **`backend/utils/soketi.js`** - Soketi client configuration
2. **`backend/middleware/shiprocketWebhookSecurity.js`** - Security middleware
3. **`backend/models/WebhookLog.js`** - Webhook audit log model
4. **`backend/models/Order.js`** - Updated with trackingHistory
5. **`backend/controllers/webhookController.js`** - Webhook handler with idempotency
6. **`backend/routes/webhookRoutes.js`** - Webhook routes
7. **`backend/server.js`** - Updated route registration

### Frontend

1. **`frontend/src/components/OrderTracker.jsx`** - Real-time tracking component

### Configuration

1. **`.env.webhook.example`** - Environment variable template

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install pusher

# Frontend
cd frontend
npm install pusher-js
```

### 2. Configure Environment Variables

#### Backend `.env`

```env
# Shiprocket
SHIPROCKET_EMAIL=your-email@example.com
SHIPROCKET_PASSWORD=your-password
SHIPROCKET_WEBHOOK_SECRET=your-secret  # Optional HMAC
SHIPROCKET_WEBHOOK_TOKEN=48f6cc854c7a94beb4ea1144ca8242ba7e78a0f5a07127364250cade5083f7a2

# Soketi (your existing Dokploy instance)
SOKETI_APP_ID=app-id
SOKETI_APP_KEY=app-key
SOKETI_APP_SECRET=app-secret
SOKETI_HOST=your-soketi-host.com
SOKETI_PORT=6001
SOKETI_USE_TLS=true
SOKETI_CLUSTER=mt1
```

#### Frontend `.env.local`

```env
# Soketi Public Config
NEXT_PUBLIC_SOKETI_KEY=app-key
NEXT_PUBLIC_SOKETI_HOST=your-soketi-host.com
NEXT_PUBLIC_SOKETI_PORT=6001
NEXT_PUBLIC_SOKETI_TLS=true
NEXT_PUBLIC_SOKETI_CLUSTER=mt1
```

### 3. Configure Shiprocket Webhook

1. **Login to Shiprocket Dashboard**
2. **Navigate to**: Settings → API → Webhooks
3. **Add Webhook URL**:
   ```
   https://api.sbali.in/api/webhooks/shiprocket
   ```
4. **Add Security Header**:
   - Header Name: `x-api-key`
   - Header Value: Your `SHIPROCKET_WEBHOOK_TOKEN`
5. **Enable Events**:
   - ✅ AWB Generated
   - ✅ Picked Up
   - ✅ Shipped
   - ✅ In Transit
   - ✅ Out for Delivery
   - ✅ Delivered
   - ✅ RTO
   - ✅ Cancelled
6. **Test** and **Save**

### 4. Update Traefik/Docker Configuration

Add Soketi to `docker-compose.traefik.yml` (if not already running via Dokploy):

```yaml
services:
  soketi:
    image: quay.io/soketi/soketi:1.6.1-16-debian
    container_name: soketi
    environment:
      SOKETI_DEBUG: "1"
      SOKETI_DEFAULT_APP_ID: "app-id"
      SOKETI_DEFAULT_APP_KEY: "app-key"
      SOKETI_DEFAULT_APP_SECRET: "app-secret"
      SOKETI_HOST: "0.0.0.0"
      SOKETI_PORT: "6001"
    ports:
      - "6001:6001"
    networks:
      - traefik-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.soketi.rule=Host(`ws.sbali.in`)"
      - "traefik.http.routers.soketi.entrypoints=websecure"
      - "traefik.http.routers.soketi.tls=true"
      - "traefik.http.services.soketi.loadbalancer.server.port=6001"
```

### 5. Local Testing with Ngrok

For testing webhooks locally:

```bash
# Install ngrok
# Windows: choco install ngrok
# Mac: brew install ngrok

# Start ngrok
ngrok http 5000

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
# Update Shiprocket webhook URL to:
# https://abc123.ngrok.io/api/webhooks/shiprocket
```

---

## 🧪 Testing

### Test Webhook Endpoint

```powershell
# PowerShell
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "YOUR_TOKEN"
}
$body = @{
    awb = "TEST123"
    current_status = "IN TRANSIT"
    sr_order_id = 123
    timestamp = (Get-Date).ToString("o")
    location = "Mumbai Hub"
} | ConvertTo-Json

Invoke-WebRequest -Uri https://api.sbali.in/api/webhooks/shiprocket `
  -Method POST `
  -Headers $headers `
  -Body $body `
  -UseBasicParsing
```

### Check Webhook Logs (Admin)

```bash
# Get recent webhook logs
GET https://api.sbali.in/api/webhooks/logs?page=1&limit=20

# Filter by status
GET https://api.sbali.in/api/webhooks/logs?status=failed

# Retry failed webhook
POST https://api.sbali.in/api/webhooks/retry/:logId
```

---

## 📱 Usage in Frontend

### Order Detail Page

```jsx
import OrderTracker from "@/components/OrderTracker";

export default function OrderDetailPage({ order }) {
  return (
    <div>
      <h1>Order {order.orderId}</h1>

      {/* Real-time tracking component */}
      <OrderTracker orderId={order._id} order={order} showTimeline={true} />
    </div>
  );
}
```

### Customer Order List

```jsx
<OrderTracker
  orderId={order._id}
  order={order}
  showTimeline={false} // Compact view
/>
```

---

## 🔐 Security Considerations

### IP Whitelist

The middleware checks these Shiprocket IPs:

- `13.234.161.44`
- `13.234.27.58`
- `13.234.251.9`
- `52.66.111.82`
- `13.235.80.206`
- `3.110.101.158`

**Note**: IP check is **skipped in development mode**.

### Signature Verification

- Uses HMAC-SHA256 with `SHIPROCKET_WEBHOOK_SECRET`
- Falls back to `x-api-key` token if HMAC not configured
- Signature computed from raw request body

### Idempotency

- Each webhook event gets unique `eventId`
- Format: `{awb}-{status}-{timestamp}`
- Duplicate events return 200 OK without reprocessing
- Webhook logs stored for 90 days (auto-deleted)

---

## 🔄 Event Flow

```
1. Shiprocket sends webhook → https://api.sbali.in/api/webhooks/shiprocket
2. Middleware validates IP + signature
3. Generate eventId, check for duplicates
4. Save WebhookLog (status: pending)
5. Return 200 OK immediately
6. Process asynchronously:
   - Find order by sr_order_id or awb
   - Update order status
   - Add to trackingHistory
   - Emit Soketi event to channel `order-{orderId}`
7. Frontend receives real-time update
8. UI updates automatically
```

---

## 📊 Webhook Events Handled

| Shiprocket Status | Order Status | Description            |
| ----------------- | ------------ | ---------------------- |
| AWB GENERATED     | processing   | Shipment created       |
| PICKED UP         | processing   | Courier picked up      |
| IN TRANSIT        | shipped      | Package moving         |
| OUT FOR DELIVERY  | shipped      | Out for delivery       |
| DELIVERED         | delivered    | Successfully delivered |
| CANCELLED         | cancelled    | Order cancelled        |
| RTO               | cancelled    | Returned to origin     |

---

## 🐛 Troubleshooting

### Webhook not receiving events

1. Check Shiprocket dashboard webhook logs
2. Verify webhook URL is accessible (test with curl)
3. Check firewall/security groups allow Shiprocket IPs
4. Review backend logs for errors

### Real-time updates not working

1. Check Soketi is running: `curl http://soketi-host:9601/metrics`
2. Verify frontend environment variables
3. Check browser console for WebSocket errors
4. Ensure firewall allows WebSocket connections (port 6001)

### Duplicate processing

- Check `WebhookLog` collection for status
- Verify `eventId` uniqueness
- Review `createdAt` timestamps

---

## 🚀 Deployment Checklist

- [ ] Install dependencies (`pusher`, `pusher-js`)
- [ ] Configure backend environment variables
- [ ] Configure frontend environment variables
- [ ] Update Traefik to allow `x-api-key` header
- [ ] Deploy backend with webhook routes
- [ ] Deploy frontend with OrderTracker component
- [ ] Configure Shiprocket webhook URL
- [ ] Test webhook with real shipment
- [ ] Monitor webhook logs for errors
- [ ] Set up alerts for failed webhooks

---

## 📝 Admin Features

### View Webhook Logs

```
GET /api/webhooks/logs?page=1&limit=50&status=failed
```

### Retry Failed Webhook

```
POST /api/webhooks/retry/:logId
```

### Monitor in Real-time

- Admin dashboard channel: `shipments`
- Event: `shipment-update`
- Subscribe to see all shipment updates

---

## 🎯 Next Steps

1. **Production Testing**: Create test shipment and verify webhook
2. **Monitoring**: Set up alerts for failed webhooks
3. **Analytics**: Track delivery times and courier performance
4. **Customer Notifications**: Add email/SMS notifications on status changes
5. **Job Queue**: Consider Bull/BullMQ for high-volume webhooks

---

## 📚 Additional Resources

- [Shiprocket API Docs](https://apidocs.shiprocket.in/)
- [Soketi Documentation](https://docs.soketi.app/)
- [Pusher Protocol](https://pusher.com/docs/channels/library_auth_reference/pusher-websockets-protocol/)
- [Ngrok Documentation](https://ngrok.com/docs)

---

**Implementation Complete!** ✅

All components are production-ready with security, idempotency, and real-time updates.
