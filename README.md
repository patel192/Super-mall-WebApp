README.md — SuperMall WebApp  
SuperMall Web Application  
Live URL: https://supermall-web-app-ee373.firebaseapp.com  
A multi-role marketplace web application where users can explore shops, products, and offers, 
merchants can manage their storefronts, and administrators can control the entire ecosystem.  
Problem Statement  
Traditional mall management systems lack transparency, analytics, and centralized digital 
presence. This project creates a digital mall ecosystem with analytics, role-based dashboards, and 
real-time data management.  
User Roles  
• Super Admin  
• Merchant (Shop Owner)  
• User (Customer)  
Core Features  
User Features  
• Browse shops, products, offers  
• Compare products  
• View shop details  
• User dashboard & profile  
Merchant Features  
• Shop profile management  
• Product management  
• Offer management  
• Product and offer analytics (views, clicks, CTR)  
• Real-time notifications  
• Merchant dashboard Admin Features  
• Manage floors, categories, shops  
• Merchant approval system  
• Full system control Advanced Features  
• Firebase-based Notification System  
• Real-time analytics tracking  
• Offer auto-status updater  
• Product and offer trends  
• Top-performing product/offer metrics  
• Modular UI layouts  
Tech Stack  
• Frontend: HTML5, Tailwind CSS, Vanilla JavaScript  
• Backend (BaaS): Firebase o Firebase Authentication o Firestore Database o Firebase 
Hosting  
• Analytics: Firestore-based event tracking  
• Deployment: Firebase Hosting  
Project Structure  
SuperMall-WebApp/ ├── 
admin/  
├── super-admin/  
├── user/  
├── js/ │   
├── admin/  
│   ├── super-admin/  
│   ├── user/  
│   ├── layout/  
│   └── utils/  
├── assets/  
├── auth.html  
├── index.html  
└── firebase.json  
Setup Instructions (Local)  
1. 
Clone the repository git clone https://github.com/patel192/Super-mall
WebApp.git  
2. 
3. 
Configure Firebase in js/firebase-config.js  
Run using Live Server or any static server  
Deployment  
Deployed using Firebase Hosting:  
firebase login 
firebase init hosting 
firebase deploy  
Status  
Core modules implemented including authentication, dashboards, analytics, and notifications. 
Additional features and optimizations are planned as part of future iterations.  
Author  
Developed by Patel Muhammad as part of internship projects demonstrating full-stack Firebase
based web application development skills.  
