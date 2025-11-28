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
// 🌟 TOP NAVBAR SUPPORT
// =========================
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".content-section");
const subSidebar = document.getElementById("subSidebar");

// =========================
// SUB-SIDEBAR DATA
// =========================
const subLinksData = {
  overview: [
    { label: "Dashboard Summary", icon: '<i data-lucide="layout-dashboard"></i>' },
    { label: "Today\'s Metrics", icon: '<i data-lucide="calendar"></i>' },
    { label: "Performance Charts", icon: '<i data-lucide="bar-chart"></i>' },
    { label: "Activity Logs", icon: '<i data-lucide="clipboard-list"></i>' },
    { label: "New Registrations", icon: '<i data-lucide="users"></i>' }
  ],

  shops: [
    { label: "All Shops", icon: '<i data-lucide="store"></i>' },
    { label: "Add New Shop", icon: '<i data-lucide="plus-circle"></i>' },
    { label: "Pending Approvals", icon: '<i data-lucide="clock"></i>' },
    { label: "Shop Categories", icon: '<i data-lucide="folder"></i>' },
    { label: "Shops Analytics", icon: '<i data-lucide="pie-chart"></i>' }
  ],

  offers: [
    { label: "All Offers", icon: '<i data-lucide="tag"></i>' },
    { label: "Create Offer", icon: '<i data-lucide="plus"></i>' },
    { label: "Expired Offers", icon: '<i data-lucide="alert-circle"></i>' },
    { label: "Offer Analytics", icon: '<i data-lucide="chart-line"></i>' }
  ],

  users: [
    { label: "All Users", icon: '<i data-lucide="users"></i>' },
    { label: "User Roles", icon: '<i data-lucide="shield"></i>' },
    { label: "Active Users", icon: '<i data-lucide="check-circle"></i>' },
    { label: "Verification Requests", icon: '<i data-lucide="badge-check"></i>' }
  ],

  analytics: [
    { label: "Revenue Graphs", icon: '<i data-lucide="trending-up"></i>' },
    { label: "User Growth", icon: '<i data-lucide="arrow-up-circle"></i>' },
    { label: "Shop Growth", icon: '<i data-lucide="activity"></i>' },
    { label: "Orders Trend", icon: '<i data-lucide="line-chart"></i>' }
  ],

  messages: [
    { label: "Inbox", icon: '<i data-lucide="inbox"></i>' },
    { label: "Support Tickets", icon: '<i data-lucide="life-buoy"></i>' },
    { label: "Unread", icon: '<i data-lucide="mail"></i>' },
    { label: "Spam", icon: '<i data-lucide="ban"></i>' }
  ],

  myshops: [
    { label: "Shop Overview", icon: '<i data-lucide="store"></i>' },
    { label: "Products", icon: '<i data-lucide="package"></i>' },
    { label: "Sales", icon: '<i data-lucide="wallet"></i>' },
    { label: "Offers", icon: '<i data-lucide="tag"></i>' },
    { label: "Reviews", icon: '<i data-lucide="star"></i>' }
  ],
};

// =========================
// UPDATE SUB-SIDEBAR
// =========================
function updateSubSidebar(section) {
  const links = subLinksData[section] || [];

  subSidebar.innerHTML = `
    <div class="sub-title">${section.charAt(0).toUpperCase() + section.slice(1)}</div>
    ${links
      .map(
        (item) => `
        <div class="sub-link">
           ${item.icon}
           <span>${item.label}</span>
        </div>`
      )
      .join("")}
  `;

  // activate lucide icons
  lucide.createIcons();

  // activate click behavior
  attachSubLinkEvents();
}

// =========================
// SUB-LINK ACTIVE BEHAVIOR
// =========================
function activateSublink(e) {
  document.querySelectorAll(".sub-link").forEach((l) => l.classList.remove("active"));
  e.currentTarget.classList.add("active");
}

function attachSubLinkEvents() {
  document.querySelectorAll(".sub-link").forEach((link) => {
    link.addEventListener("click", activateSublink);
  });
}

// =========================
// HIDE / SHOW SECTIONS
// =========================
function hideAllSections() {
  sections.forEach((sec) => sec.classList.remove("active-section"));
}

function showSection(sectionId) {
  hideAllSections();
  const section = document.getElementById(sectionId);
  if (section) section.classList.add("active-section");
}

// =========================
// NAV CLICK
// =========================
function highlightLink(clicked) {
  navLinks.forEach((link) => link.classList.remove("active"));
  clicked.classList.add("active");
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const section = link.dataset.section;

    highlightLink(link);
    showSection(section);
    updateSubSidebar(section);
    handleNavigation(section);
  });
});

// =========================
// DEFAULT PAGE LOAD
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const first = navLinks[0];
  if (first) {
    highlightLink(first);
    showSection("overview");
    updateSubSidebar("overview");
    loadOverviewData();
  }
});

// =========================
// OVERVIEW DATA
// =========================
async function loadOverviewData() {
  try {
    const shopsSnap = await getCountFromServer(collection(db, "shops"));
    const offersSnap = await getCountFromServer(collection(db, "offers"));
    const usersSnap = await getCountFromServer(collection(db, "users"));

    document.getElementById("total-shops").textContent = shopsSnap.data().count;
    document.getElementById("total-offers").textContent = offersSnap.data().count;
    document.getElementById("total-users").textContent = usersSnap.data().count;
    document.getElementById("total-revenue").textContent =
      "₹" + (shopsSnap.data().count * 5000).toLocaleString();

    const topList = document.getElementById("top-shops");
    topList.innerHTML = "";

    const topShopsSnap = await getDocs(
      query(collection(db, "shops"), orderBy("rating", "desc"), limit(5))
    );

    if (topShopsSnap.empty) {
      topList.innerHTML = "<li>No shops found</li>";
    } else {
      topShopsSnap.forEach((doc) => {
        const shop = doc.data();
        topList.innerHTML += `
          <li>
            <strong>${shop.name}</strong><br>
            <small>⭐ ${shop.rating} | ${shop.category}</small>
          </li>`;
      });
    }

    // ACTIVITY LOGS
    const logsSnap = await getDocs(
      query(collection(db, "appLogs"), orderBy("timestamp", "desc"), limit(5))
    );

    const activityList = document.getElementById("activity-feed");
    activityList.innerHTML = "";

    if (logsSnap.empty) {
      activityList.innerHTML = "<li>No recent activity</li>";
    } else {
      logsSnap.forEach((doc) => {
        const log = doc.data();
        activityList.innerHTML += `
          <li>
            <strong>${log.action}</strong><br>
            <small>${log.timestamp?.toDate().toLocaleString() || "Unknown"}</small>
          </li>`;
      });
    }
  } catch (e) {
    console.error("Error loading overview:", e);
  }
}

// =========================
// NAVIGATION HANDLER
// =========================
function handleNavigation(section) {
  switch (section) {
    case "overview":
      loadOverviewData();
      break;
    case "shops":
      loadShops();
      break;
    case "offers":
      loadOffers();
      break;
    case "users":
      loadUsers();
      break;
    case "analytics":
      loadAnalytics();
      break;
    case "messages":
      loadMessages();
      break;
  }
}
