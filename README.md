
Repository: **Super-mall-WebApp**

```markdown
# 🛍️ SuperMall Web Application
```
SuperMall is a multi-role e-commerce mall management system built using HTML, CSS, JavaScript, and Firebase.  
It allows Super Admins, Merchants, and Users to interact in a structured marketplace environment.

Live Demo: https://supermall-web-app-ee373.firebaseapp.com/

---

## 📌 Overview

SuperMall is designed to simulate a real-world online mall system where:
- Merchants manage shops, products, and offers
- Users browse products, compare items, and view offers
- Super Admin manages floors, approvals, and platform structure

The system includes real-time analytics, notifications, and role-based dashboards.

---

## 🚀 Features

### Super Admin
- Approve merchant requests
- Manage floors
- Monitor overall platform structure
- Manage users and shops

### Merchant (Shop Owner)
- Shop dashboard with analytics
- Product management (CRUD)
- Offer management
- Shop profile management
- Notifications for events (approvals, product performance, offers)

### User
- Browse shops and products
- View offers
- Compare products
- View shop details
- Manage user profile

### Analytics Features
- Product views and clicks tracking
- Offer views and clicks tracking
- Daily performance statistics
- Top performing products and offers
- Trend charts for performance

### Notifications System
- Merchant approval notifications
- Product first view/click notifications
- Offer live/expired notifications
- Event-based real-time alerts

---

## 🛠️ Tech Stack

Frontend:
- HTML5
- Tailwind CSS
- JavaScript (Vanilla)

Backend / Services:
- Firebase Authentication
- Firebase Firestore Database
- Firebase Hosting

Other Tools:
- Chart.js for analytics visualization
- Firebase CLI
- Git & GitHub

---

## 📂 Project Structure

├── admin/
├── super-admin/
├── user/
├── js/
│ ├── admin/
│ ├── super-admin/
│ ├── user/
│ ├── utils/
│ └── firebase-config.js
├── public/
├── assets/
├── auth.html
├── index.html
└── firebase.json

yaml
Copy code

---

## ⚙️ Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/patel192/Super-mall-WebApp.git
cd Super-mall-WebApp
```
Install Firebase CLI:
```bash
npm install -g firebase-tools
```
Login to Firebase:
```bash
firebase login
```

Run locally:
```bash
firebase serve
```
Deploy:
```bash
firebase deploy
```

## 📊 Implemented Dashboards

- Super Admin Dashboard  
- Merchant Dashboard  
- User Dashboard  
- Analytics KPIs  
- Charts for trends  
- Notification system  

---

## 📌 Project Status

This project is **actively under development**.

### Planned Improvements
- Advanced search and filters  
- Recommendation system  
- UI improvements  
- Performance optimizations  
- Firestore security rules hardening  

---

## 👨‍💻 Author

**Muhammad Patel**

- **GitHub:** https://github.com/patel192  

---

## 📄 License

This project is built for **learning, portfolio, and internship demonstration purposes**.

