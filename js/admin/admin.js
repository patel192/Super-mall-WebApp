// admin.js
import { db } from "../firebase-config.js";
import {
  collection,
  getCountFromServer,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { loadShops } from "../admin/admin-shops.js";
import { loadOffers } from "../admin/admin-offers.js";
import { loadUsers } from "../admin/admin-users.js";
import { loadAnalytics } from "../admin/admin-analytics.js";
import { loadMessages } from "../admin/admin-messages.js";

// =========================
// 🌟 NEW TOP NAVBAR SUPPORT
// =========================
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".content-section");

// Hide all sections
function hideAllSections() {
  sections.forEach(sec => sec.classList.remove("active-section"));
}

// Show a specific section
function showSection(sectionId) {
  hideAllSections();
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add("active-section");
  }
}

// Activate navbar link
function highlightLink(clicked) {
  navLinks.forEach(link => link.classList.remove("active"));
  clicked.classList.add("active");
}

// Click listener for top navbar
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    const section = link.getAttribute("data-section");

    highlightLink(link);
    showSection(section);
    handleNavigation(section); // Load section-specific data
  });
});

// =========================
// 🌟 DEFAULT LOAD (Overview)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const first = navLinks[0];
  if (first) {
    highlightLink(first);
    showSection("overview");
    loadOverviewData();
  }
  handleNavigation("overview");
});

// =========================
// 🌟 OVERVIEW DASHBOARD LOGIC
// =========================
async function loadOverviewData() {
  try {
    // --- Count Totals --- //
    const shopsSnap = await getCountFromServer(collection(db, "shops"));
    const offersSnap = await getCountFromServer(collection(db, "offers"));
    const usersSnap = await getCountFromServer(collection(db, "users"));

    document.getElementById("total-shops").textContent = shopsSnap.data().count;
    document.getElementById("total-offers").textContent = offersSnap.data().count;
    document.getElementById("total-users").textContent = usersSnap.data().count;
    document.getElementById("total-revenue").textContent =
      "₹" + (shopsSnap.data().count * 5000).toLocaleString();

    // --- Top Shops List --- //
    const topShopsQuery = query(
      collection(db, "shops"),
      orderBy("rating", "desc"),
      limit(5)
    );

    const topShopsSnap = await getDocs(topShopsQuery);
    const topList = document.getElementById("top-shops");

    topList.innerHTML = "";
    if (topShopsSnap.empty) {
      topList.innerHTML = "<li>No shops found</li>";
    } else {
      topShopsSnap.forEach(doc => {
        const shop = doc.data();
        topList.innerHTML += `
          <li>
            <strong>${shop.name || "Unnamed Shop"}</strong><br>
            <small>⭐ ${shop.rating || "N/A"} | ${shop.category || "General"}</small>
          </li>`;
      });
    }

    // --- Recent Activity Log --- //
    const logsQuery = query(
      collection(db, "appLogs"),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const logsSnap = await getDocs(logsQuery);
    const activityList = document.getElementById("activity-feed");

    activityList.innerHTML = "";
    if (logsSnap.empty) {
      activityList.innerHTML = "<li>No recent activity</li>";
    } else {
      logsSnap.forEach(doc => {
        const log = doc.data();
        const time = log.timestamp?.toDate
          ? log.timestamp.toDate().toLocaleString()
          : "Unknown time";

        activityList.innerHTML += `
          <li>
            <strong>${log.action || "Activity"}</strong><br>
            <small>${time}</small>
          </li>`;
      });
    }

  } catch (err) {
    console.error("❌ Error loading overview data:", err);
  }
}

// =========================
// 🌟 NAVIGATION HANDLER
// =========================
function handleNavigation(section) {
  switch (section) {
    case "overview": loadOverviewData(); break;
    case "shops": loadShops(); break;
    case "offers": loadOffers(); break;
    case "users": loadUsers(); break;
    case "analytics": loadAnalytics(); break;
    case "messages": loadMessages(); break;
    case "myshops": /* later */ break;
  }
}

// =========================
// 🌟 Number Animation
// =========================
function animateNumber(id) {
  const el = document.getElementById(id);
  el.classList.add("updated");
  setTimeout(() => el.classList.remove("updated"), 400);
}

animateNumber("total-shops");
animateNumber("total-offers");
animateNumber("total-users");
animateNumber("total-revenue");

