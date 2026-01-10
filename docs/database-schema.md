# Database Schema — SuperMall Web App (Field-Accurate)

This document reflects the **actual Firestore collections and fields** used in the SuperMall Web App, based on the real data you provided.

This is suitable for technical review, portfolio evaluation, and recruiter inspection.

---

## 1. Database Overview

Database: **Cloud Firestore (NoSQL)**
Architecture: **Multi-collection, event-driven, role-based system**

Design characteristics demonstrated:

* Hierarchical mall structure (floors → shops → products)
* Role-based user control
* Real approval workflow (merchantRequests)
* Analytics collections
* Real-time notifications
* Audit logging

---

## 2. Collections and Schemas

### 2.1 `users`

Path:

```
/users/{uid}
```

Fields:

| Field     | Type      | Description                                             |
| --------- | --------- | ------------------------------------------------------- |
| fullName  | string    | User name                                               |
| email     | string    | Auth email                                              |
| phone     | string    | Contact number                                          |
| provider  | string    | email / google                                          |
| role      | string    | user / merchant_pending / merchant / admin / superadmin |
| createdAt | timestamp | Account creation time                                   |
| address   | map       | street, city, state, pincode                            |

Purpose:

* Authentication profile
* Role-based routing
* Access control

---

### 2.2 `floors`

Path:

```
/floors/{floorId}
```

Fields:

| Field       | Type      | Description                   |
| ----------- | --------- | ----------------------------- |
| name        | string    | Floor name (e.g., Food Court) |
| level       | number    | Floor order                   |
| description | string    | Floor purpose                 |
| createdAt   | timestamp | Created time                  |
| updatedAt   | timestamp | Last updated                  |

Purpose:

* Mall navigation structure
* Parent layer for shops

---

### 2.3 `shops`

Path:

```
/shops/{shopId}
```

Fields:

| Field            | Type      | Description                     |
| ---------------- | --------- | ------------------------------- |
| name             | string    | Shop name                       |
| description      | string    | Shop details                    |
| category         | string    | Electronics, Food, Beauty, etc. |
| floorId          | string    | Reference to floors             |
| ownerId          | string    | users.uid                       |
| logoUrl          | string    | Shop logo                       |
| profileCompleted | boolean   | Setup status                    |
| status           | string    | active / inactive               |
| location         | map       | city, state, pincode            |
| createdAt        | timestamp | Created time                    |
| updatedAt        | timestamp | Updated time                    |

Purpose:

* Represents merchant storefronts
* Links merchant users to shops

---

### 2.4 `products`

Path:

```
/products/{productId}
```

Fields:

| Field       | Type      | Description       |
| ----------- | --------- | ----------------- |
| name        | string    | Product name      |
| description | string    | Product details   |
| category    | string    | Product category  |
| price       | number    | Price             |
| imageUrl    | string    | Product image     |
| ownerId     | string    | Merchant uid      |
| shopId      | string    | Shop reference    |
| status      | string    | active / inactive |
| views       | number    | Total views       |
| clicks      | number    | Engagement clicks |
| createdAt   | timestamp | Created time      |
| updatedAt   | timestamp | Updated time      |

Purpose:

* Core marketplace content
* Supports analytics and engagement tracking

---

### 2.5 `offers`

Path:

```
/offers/{offerId}
```

Fields:

| Field         | Type      | Description            |
| ------------- | --------- | ---------------------- |
| title         | string    | Offer title            |
| productId     | string    | Related product        |
| ownerId       | string    | Merchant uid           |
| discountType  | string    | percentage / flat      |
| discountValue | number    | Discount amount        |
| startDate     | timestamp | Offer start            |
| endDate       | timestamp | Offer end              |
| status        | string    | active / expired       |
| thumbnailUrl  | string    | Offer image            |
| views         | number    | Offer views            |
| clicks        | number    | Offer clicks           |
| _liveNotified | boolean   | Notification sent flag |
| createdAt     | timestamp | Created time           |
| updatedAt     | timestamp | Updated time           |

Purpose:

* Promotional system
* Integrated with analytics

---

### 2.6 `merchantRequests`

Path:

```
/merchantRequests/{requestId}
```

Fields:

| Field       | Type      | Description                   |
| ----------- | --------- | ----------------------------- |
| uid         | string    | Applicant user uid            |
| shopName    | string    | Proposed shop name            |
| category    | string    | Shop category                 |
| description | string    | Shop details                  |
| address     | map       | street, city, state, pincode  |
| contact     | map       | email, phone                  |
| status      | string    | pending / approved / rejected |
| createdAt   | timestamp | Request time                  |

Purpose:

* Approval workflow for merchants
* Demonstrates moderation pipeline

---

### 2.7 `notifications`

Path:

```
/notifications/{notificationId}
```

Fields:

| Field      | Type      | Description              |
| ---------- | --------- | ------------------------ |
| title      | string    | Notification title       |
| message    | string    | Body content             |
| link       | string    | Redirect path            |
| type       | string    | PRODUCT_FIRST_VIEW, etc. |
| targetUid  | string    | Recipient user           |
| targetRole | string    | admin / merchant / user  |
| read       | boolean   | Seen/unseen              |
| createdAt  | timestamp | Created time             |

Purpose:

* Real-time event feedback
* Improves UX and engagement

---

### 2.8 `product_stats`

Path:

```
/product_stats/{statId}
```

Fields:

| Field     | Type      | Description     |
| --------- | --------- | --------------- |
| productId | string    | Related product |
| ownerId   | string    | Merchant uid    |
| date      | string    | YYYY-MM-DD      |
| views     | number    | Daily views     |
| clicks    | number    | Daily clicks    |
| createdAt | timestamp | Created time    |
| updatedAt | timestamp | Updated time    |

Purpose:

* Daily analytics aggregation
* Merchant dashboard metrics

---

### 2.9 `offer_stats`

Path:

```
/offer_stats/{statId}
```

Fields:

| Field     | Type      | Description   |
| --------- | --------- | ------------- |
| offerId   | string    | Related offer |
| ownerId   | string    | Merchant uid  |
| date      | string    | YYYY-MM-DD    |
| views     | number    | Daily views   |
| clicks    | number    | Daily clicks  |
| updatedAt | timestamp | Updated time  |

Purpose:

* Offer performance tracking
* Analytics for merchants

---

### 2.10 `logs`

Path:

```
/logs/{logId}
```

Fields:

| Field     | Type      | Description                      |
| --------- | --------- | -------------------------------- |
| uid       | string    | Acting user                      |
| type      | string    | GOOGLE_LOGIN, PRODUCT_VIEW, etc. |
| message   | string    | Log description                  |
| timestamp | timestamp | Event time                       |

Purpose:

* Audit trail
* Debugging support
* Demonstrates engineering discipline

---

## 3. Logical Relationships

```
floors.id        → shops.floorId
shops.id         → products.shopId
users.uid        → shops.ownerId
users.uid        → products.ownerId
products.id      → offers.productId
users.uid        → notifications.targetUid
```

These are enforced by application logic.

---

## 4. What This Schema Demonstrates

This database design proves:

* Intentional data modeling (not random collections)
* Role-aware architecture
* Real moderation workflows
* Event-driven analytics
* Real-time UX systems
* Scalable Firestore patterns

This is **not a beginner schema**. It reflects real application design thinking.

---

Prepared as professional technical documentation for the SuperMall Web App.
