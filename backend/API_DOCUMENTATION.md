# WebCafe API Documentation

## Base URL
```
http://localhost:5000/api
https://your-domain.com/api
```

## Authentication
Hầu hết các endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer {your-jwt-token}
```

---

## 🔐 Authentication APIs

### 1. Login Staff
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "staff01",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập nhân viên thành công.",
  "data": {
    "token": "eyJhbGc...",
    "username": "staff01",
    "fullName": "Nguyễn Văn A",
    "role": "Staff",
    "tenantId": 1,
    "storeId": 1,
    "storeName": "Cửa hàng Quận 1",
    "brandName": "WebCafe"
  }
}
```

### 2. Login Tenant Owner
```http
POST /api/auth/owner-login
Content-Type: application/json

{
  "username": "owner@example.com",
  "password": "password123"
}
```

### 3. Login System Admin
```http
POST /api/auth/admin-login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

---

## 🍔 Menu APIs

### Get Menu by Store
```http
GET /api/menu/store/{storeId}
```

### Get Categories
```http
GET /api/menu/categories/tenant/{tenantId}
```

### Create Category
```http
POST /api/menu/categories/tenant/{tenantId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Cà phê",
  "icon": "coffee",
  "sortOrder": 1
}
```
**Required:** ManagerAccess

### Get Menu Items
```http
GET /api/menu/items/tenant/{tenantId}?categoryId=1
```

### Create Menu Item
```http
POST /api/menu/items/tenant/{tenantId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "categoryId": 1,
  "name": "Cà phê sữa đá",
  "description": "Cà phê truyền thống",
  "basePrice": 25000,
  "imageUrl": "https://...",
  "isAvailable": true,
  "sizes": [1, 2],
  "toppings": [1, 2, 3]
}
```
**Required:** ManagerAccess

---

## 📋 Order APIs

### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "storeId": 1,
  "tableId": 5,
  "customerPhone": "0901234567",
  "customerName": "Khách hàng",
  "voucherCode": "DISCOUNT10",
  "pointsToUse": 100,
  "note": "Ít đường",
  "items": [
    {
      "menuItemId": 1,
      "sizeId": 2,
      "quantity": 2,
      "sugarLevel": "50%",
      "iceLevel": "100%",
      "note": "Đá riêng",
      "toppings": [
        { "toppingId": 1 }
      ]
    }
  ]
}
```

### Get Order by Code
```http
GET /api/orders/code/{orderCode}
```

### Get Active Orders
```http
GET /api/orders/active/store/{storeId}
```

### Update Order Status
```http
PUT /api/orders/{orderId}/status
Content-Type: application/json

{
  "status": "preparing"
}
```
**Status values:** pending, confirmed, preparing, ready, served, paid, cancelled

---

## 💳 Payment APIs

### Process Payment (Cash/Card)
```http
POST /api/payments
Content-Type: application/json

{
  "orderId": 123,
  "method": "cash",
  "amount": 50000,
  "transactionRef": "TXN-001"
}
```

### Create VietQR Payment
```http
POST /api/payments/vietqr/create
Content-Type: application/json

{
  "orderId": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": 456,
    "orderCode": "OD-260914-1234",
    "amount": 50000,
    "bankAccount": "1234567890",
    "bankName": "970415",
    "accountName": "WEBCAFE COMPANY",
    "transferContent": "OD-260914-1234",
    "qrCodeUrl": "https://img.vietqr.io/image/...",
    "status": "pending",
    "expiresAt": "2026-09-14T15:30:00Z"
  }
}
```

### Check VietQR Payment Status
```http
GET /api/payments/vietqr/status/{orderId}
```

### VietQR Webhook (For Banks)
```http
POST /api/payments/vietqr/webhook
X-Signature: {hmac-signature}
Content-Type: application/json

{
  "transactionId": "FT26091412345",
  "amount": 50000,
  "description": "Thanh toan OD-260914-1234",
  "transactionTime": "2026-09-14T14:25:00Z",
  "bankAccount": "1234567890"
}
```

---

## 📦 Inventory APIs

### Get Inventory by Store
```http
GET /api/inventory/store/{storeId}
Authorization: Bearer {token}
```
**Required:** StaffAccess

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "stockId": 1,
      "ingredientId": 1,
      "ingredientName": "Cà phê hạt",
      "unit": "kg",
      "currentQuantity": 25.5,
      "minimumStock": 10,
      "isLowStock": false,
      "lastUpdated": "2026-09-14T10:00:00Z"
    }
  ]
}
```

### Import Inventory
```http
POST /api/inventory/import
Authorization: Bearer {token}
Content-Type: application/json

{
  "storeId": 1,
  "ingredientId": 1,
  "quantity": 50,
  "note": "Nhập kho tháng 9"
}
```
**Required:** ManagerAccess

### Adjust Inventory
```http
POST /api/inventory/adjust
Authorization: Bearer {token}
Content-Type: application/json

{
  "storeId": 1,
  "ingredientId": 1,
  "newQuantity": 45.5,
  "note": "Kiểm kê định kỳ"
}
```
**Required:** ManagerAccess

### Get Transaction History
```http
GET /api/inventory/transactions/store/{storeId}?ingredientId=1&fromDate=2026-09-01&toDate=2026-09-14
Authorization: Bearer {token}
```
**Required:** StaffAccess

---

## 🎯 Recommendation APIs

### Get Recommended Combos
```http
GET /api/recommendations/combos/tenant/{tenantId}?top=5
```

**Response:**
```json
{
  "success": true,
  "message": "Gợi ý combo dựa trên dữ liệu mua hàng.",
  "data": [
    {
      "item1Id": 1,
      "item1Name": "Cà phê sữa đá",
      "item1Price": 25000,
      "item2Id": 5,
      "item2Name": "Bánh mì",
      "item2Price": 20000,
      "totalPrice": 45000,
      "suggestedDiscountPrice": 40500,
      "frequency": 45,
      "confidenceScore": 15.5
    }
  ]
}
```

### Get Popular Items
```http
GET /api/recommendations/popular/store/{storeId}?top=10
```

### Get Personalized Recommendations
```http
GET /api/recommendations/personalized/customer/{customerId}/store/{storeId}?top=5
```

### Get Frequently Bought Together
```http
GET /api/recommendations/frequently-bought-together/tenant/{tenantId}/item/{menuItemId}?top=3
```

---

## 📊 Analytics APIs

### Get Dashboard Stats
```http
GET /api/analytics/dashboard/store/{storeId}
Authorization: Bearer {token}
```
**Required:** StaffAccess

**Response:**
```json
{
  "success": true,
  "data": {
    "todayRevenue": 5250000,
    "todayOrders": 45,
    "totalCustomers": 320,
    "availableTables": 8,
    "occupiedTables": 4,
    "topProducts": [
      {
        "menuItemId": 1,
        "name": "Cà phê sữa đá",
        "soldCount": 125,
        "totalRevenue": 3125000
      }
    ],
    "revenueChart": [
      {
        "date": "08/09",
        "revenue": 4500000,
        "ordersCount": 38
      }
    ]
  }
}
```

### Get Revenue Report
```http
GET /api/analytics/revenue/store/{storeId}?fromDate=2026-09-01&toDate=2026-09-14
Authorization: Bearer {token}
```
**Required:** ManagerAccess

**Response:**
```json
{
  "success": true,
  "data": {
    "fromDate": "2026-09-01T00:00:00Z",
    "toDate": "2026-09-14T23:59:59Z",
    "totalRevenue": 45000000,
    "totalOrders": 520,
    "totalDiscount": 2500000,
    "averageOrderValue": 86538,
    "dailyRevenue": [...],
    "paymentMethodStats": [
      {
        "method": "cash",
        "count": 280,
        "totalAmount": 25000000
      },
      {
        "method": "vietqr",
        "count": 240,
        "totalAmount": 20000000
      }
    ]
  }
}
```

### Get Customer Analytics
```http
GET /api/analytics/customers/tenant/{tenantId}?fromDate=2026-09-01&toDate=2026-09-14
Authorization: Bearer {token}
```
**Required:** ManagerAccess

### Get Category Performance
```http
GET /api/analytics/categories/tenant/{tenantId}?fromDate=2026-09-01&toDate=2026-09-14
Authorization: Bearer {token}
```
**Required:** ManagerAccess

---

## 🏪 Table Management APIs

### Get Tables by Store
```http
GET /api/tables/store/{storeId}
```

### Create Table
```http
POST /api/tables
Authorization: Bearer {token}
Content-Type: application/json

{
  "storeId": 1,
  "tableNumber": "A01",
  "capacity": 4,
  "location": "Tầng 1"
}
```
**Required:** ManagerAccess

### Update Table Status
```http
PUT /api/tables/{tableId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "Occupied"
}
```
**Required:** StaffAccess

---

## 🎟️ Voucher APIs

### Check Voucher
```http
POST /api/vouchers/check
Content-Type: application/json

{
  "code": "DISCOUNT10",
  "storeId": 1,
  "orderAmount": 100000,
  "customerPhone": "0901234567"
}
```

### Get Active Vouchers
```http
GET /api/vouchers/store/{storeId}?tenantId=1
```

---

## 📡 SignalR Hub

### Connection:
```
ws://localhost:5000/hubs/orders?access_token={jwt-token}
```

### Methods to Call:
- `JoinStoreGroup(storeId)` - Join group để nhận notifications
- `LeaveStoreGroup(storeId)` - Leave group
- `JoinTableGroup(tableId)` - Theo dõi bàn cụ thể

### Events to Listen:
- `NewOrderReceived(order)` - Có đơn hàng mới
- `OrderStatusChanged(orderId, status, orderCode)` - Trạng thái đơn thay đổi
- `TableStatusChanged(tableId, status)` - Trạng thái bàn thay đổi

---

## 🚨 Error Response Format

```json
{
  "success": false,
  "message": "Lỗi mô tả",
  "errors": {
    "field": ["Error message 1", "Error message 2"]
  }
}
```

### Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔑 Authorization Policies

| Policy | Roles Allowed |
|--------|---------------|
| SystemAdminOnly | SystemAdmin |
| TenantOwnerOnly | Owner, SystemAdmin |
| ManagerAccess | Manager, Owner, SystemAdmin |
| StaffAccess | Staff, Manager, Owner, SystemAdmin |
| KitchenAccess | Kitchen, Manager, Owner, SystemAdmin |
| CashierAccess | Cashier, Manager, Owner, SystemAdmin |

---

## 📝 Notes

1. **Date Format:** ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
2. **Currency:** VND (Vietnamese Dong) - không có phần thập phân
3. **Phone Format:** 10-11 số, bắt đầu với 0
4. **Pagination:** Sử dụng `pageNumber` và `pageSize` query params
5. **SignalR:** Token có thể truyền qua query string hoặc header

---

## 🧪 Testing with Swagger

Access Swagger UI tại:
```
http://localhost:5000/swagger
```

Để test authenticated endpoints:
1. Login qua `/api/auth/login`
2. Copy token từ response
3. Click "Authorize" button
4. Nhập: `Bearer {token}`
5. Click "Authorize"
