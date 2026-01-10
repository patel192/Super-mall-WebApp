# System Flow — SuperMall Web App (Field-Accurate)

This document reflects the **actual runtime behavior and data flow** of the SuperMall Web App based on your real Firestore collections and fields.

It is designed to be defensible in interviews, submissions, and technical reviews.

---

## 1. Core Runtime Flow

Every session follows this lifecycle:

1. User opens application
2. Firebase Authentication validates session
3. User profile loaded from `/users/{uid}`
4. Role-based routing occurs (`role` field)
5. Dashboard loads relevant data from Firestore
6. User actions trigger Firestore writes
7. Firestore listeners update UI in real time

```
Client UI
  → Firebase Auth
    → users/{uid}
      → role-based redirect
        → Dashboard
          → Firestore Reads/Writes
            → Real-time UI Updates
```

---

## 2. Authentication & Role Routing

### Source of truth

Collection:

```
/users/{uid}
```

Fields used in flow:

* role (user | merchant_pending | merchant | admin | superadmin)
* fullName
* email
* provider

### Flow

```
Login / Signup
→ Firebase Auth returns uid
→ Fetch /users/{uid}
→ If role == merchant_pending → restricted access
→ If role == merchant → admin dashboard
→ If role == user → user home
→ If role == superadmin → platform dashboard
```

This guarantees **access control at runtime**, not just UI-level restriction.

---

## 3. Merchant Onboarding Flow

### Collection involved

```
/merchantRequests/{requestId}
```

Fields used:

* uid
* shopName
* category
* description
* status (pending | approved | rejected)
* address map
* contact map

### Flow

```
User applies to become merchant
→ Writes document to /merchantRequests
→ status = pending
→ Admin reviews request
→ If approved:
   - User role updated in /users/{uid}
   - Shop created in /shops
```

This demonstrates **real approval workflow**, not a fake role toggle.

---

## 4. Floor → Shop → Product Navigation Flow

### Structural hierarchy (actual schema)

```
floors → shops → products → offers
```

### Example navigation flow

```
User opens mall
→ Fetch /floors ordered by level
→ Select floor
→ Query /shops where floorId == selectedFloorId
→ Select shop
→ Query /products where shopId == selectedShopId and status == active
→ Render products
```

Collections used:

* /floors
* /shops
* /products

This mirrors a **real shopping mall browsing experience**.

---

## 5. Product Interaction & Analytics Flow

### Collections involved

* /products
* /product_stats
* /logs
* /notifications

### Example: User views a product

```
User opens product page
→ Increment products.views
→ Write entry to /product_stats
→ Create notification for shop owner
→ Log event in /logs
```

Real fields used:

* product_stats: views, clicks, date, ownerId, productId
* notifications: title, message, targetUid, targetRole, type
* logs: message, type, uid, timestamp

This demonstrates **event-driven tracking architecture**.

---

## 6. Offers Lifecycle Flow

### Collections involved

* /offers
* /offer_stats

### Offer creation flow

```
Merchant creates offer
→ Write to /offers
→ status = active
→ UI displays active offers
```

### Offer interaction flow

```
User views offer
→ Increment offers.views
→ Write daily stats to /offer_stats
→ Merchant dashboard reflects updated metrics
```

Fields actually used:

* offers: title, productId, ownerId, discountType, discountValue, views, clicks
* offer_stats: views, clicks, date, ownerId, offerId

This reflects a **working analytics pipeline**, not mock data.

---

## 7. Notification System Flow

Collection:

```
/notifications/{notificationId}
```

Fields used:

* targetUid
* targetRole
* title
* message
* link
* type
* read

### Runtime behavior

```
System event occurs (product viewed, offer clicked, etc.)
→ Create notification document
→ Firestore real-time listener triggers UI update
→ Notification appears instantly without refresh
```

This proves the system is **reactive and event-driven**.

---

## 8. Logging Flow (Audit Trail)

Collection:

```
/logs/{logId}
```

Fields:

* uid
* type (GOOGLE_LOGIN, PRODUCT_VIEW, etc.)
* message
* timestamp

Flow:

```
User performs action
→ Log entry written
→ Can be used for debugging, auditing, analytics
```

This demonstrates **production-grade observability thinking**.

---

## 9. End-to-End Example Flow

### Scenario: Product viewed by user

```
User browses floor
→ Opens shop
→ Clicks product
→ Firestore updates:
   - products.views +1
   - product_stats updated
   - notification created for merchant
   - log entry written
→ Merchant dashboard updates in real time
```

This is a **complete real-world data lifecycle**, not a static demo.

---

## 10. What This Flow Demonstrates

This system flow proves that the project includes:

* Real role-based authorization
* Structured approval workflows
* Hierarchical data modeling (floors → shops → products)
* Event-driven architecture
* Real-time Firestore listeners
* Analytics pipelines
* Notifications system
* Audit logging

This is comparable to junior-to-mid production SaaS architecture.

---

Related documentation:

* Architecture: `docs/architecture.md`
* Database Schema: `docs/database-schema.md`

---

Prepared as professional technical documentation for the SuperMall Web App.
