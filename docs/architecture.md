Architecture — SuperMall Web App

This document describes the architecture and structure of the SuperMall Web App, mapping the project’s folder layout, major modules, and data interactions with Firebase.

1. Project Overview

SuperMall is a multi-role e-commerce mall system implemented with HTML, CSS, JavaScript (Vanilla) and Firebase (Authentication, Firestore, Hosting). The system supports:

Super Admin — Platform governance

Merchants — Shop management

Users — Product browsing and engagement

The application uses role-based routing, real-time Firestore listeners, and analytics systems to deliver a dynamic user experience.

2. Source Directory Structure

Below is the primary code layout from the repository:

Super-mall-WebApp/
├── admin/                 # Admin dashboard pages
├── super-admin/           # Super admin pages
├── user/                  # User pages
├── js/
│   ├── admin/             # Admin utilities/scripts
│   ├── super-admin/       # Super Admin logic
│   ├── user/              # User scripts
│   ├── utils/             # Shared helpers (e.g., DOM utilities)
│   └── firebase-config.js # Firebase initialization
├── assets/                # Images, icons, CSS (shared UI assets)
├── public/                # Hosting public directory (for deployment)
├── auth.html              # Authentication UI
├── index.html             # Entry point
├── firebase.json          # Firebase hosting configuration
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Custom Firestore indexes
└── README.md              # Project overview and instructions


Each high-level folder targets a role-specific section of the UI:

super-admin/ — Routes for floor management, merchant approvals, analytics

admin/ — Merchant controls for products and offers

user/ — Browsing, product exploration, offers

The js/ directory structures scripts by role and shared utilities, enforcing separation of concerns.

3. Architectural Layers
3.1 Presentation Layer

HTML templates (role dashboards, shop listings)

Tailwind CSS for layout and responsiveness

Static assets (logo, images)

This layer delivers UI pages and loads JavaScript that drives dynamic behavior.

3.2 Client Logic

JavaScript scripts located under js/ drive:

Authentication state checks (via Firebase Auth)

Dynamic data fetching and updates (Firestore)

Real-time listeners and UI refresh

Event handlers for user interactions

firebase-config.js centralizes Firebase initialization.

3.3 Backend Services (Firebase)

The application leverages Firebase services:

Authentication — Manages user sign-in/sign-up

Firestore — NoSQL document database for all app data

Hosting — Static site deployment

No traditional backend server is used; instead, business logic runs in the frontend with secure Firestore access rules.

4. Data Interaction Flow

Data flows follow these steps:

User Authentication
User signs in via Firebase Auth.

Role Resolution
After authentication, the frontend queries users/{uid} to resolve role.

Role-based Routing
Redirects user to:

/super-admin/ for super admin

/admin/ for merchant

/user/ for customer

Firestore Operations
Each role requests data from collections like:

floors, shops, products, offers

merchantRequests, notifications

product_stats, offer_stats

Real-Time UI Updates
Firestore listeners propagate changes immediately to the UI.

Refer to the separate System Flow and Database Schema documents for full details.

5. Key Architectural Concepts
Role-Based Access

Every route checks the user’s role before granting access to specific dashboards and functionality.

Event-Driven UX

Real-time listeners (aka onSnapshot) ensure analytics, notifications, and listings update without page refresh.

Separation of Concerns

UI markup separated by role

Scripts organized by module

Shared utilities in js/utils/

6. Diagram (Conceptual)
Client UI (HTML/CSS/JS)
         |
         v
Firebase Auth — User Identity
         |
         v
Firestore (Collections)
         |
         ├── floors → shops → products → offers
         ├── notifications
         ├── merchantRequests
         ├── product_stats / offer_stats
         └── logs


This shows how UI actions map to Firestore collections and real-time responses.

7. Why This Architecture

This approach delivers:

Zero-backend SaaS-style deployment

Real-time reactive UI

Role-aware security

Scalable collections and analytics tracking

8. Related Documents

system-flow.md — Actual runtime sequence and interactions

database-schema.md — Field-accurate Firestore reference