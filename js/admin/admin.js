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

// SUB-SIDEBAR DATA
const subLinksData = {
  overview: ["Dashboard Summary", "Today's Metrics", "Performance Charts", "Activity Logs", "New Registrations"],
  shops: ["All Shops", "Add New Shop", "Pending Approvals", "Shop Categories", "Shops Analytics"],
  offers: ["All Offers", "Create Offer", "Expired Offers", "Offer Analytics"],
  users: ["All Users", "User Roles", "Active Users", "Verification Requests"],
  analytics: ["Revenue Graphs", "User Growth", "Shop Growth", "Orders Trend"],
  messages: ["Inbox", "Support Tickets", "Unread", "Spam"],
  myshops: ["Shop Overview", "Products", "Sales", "Offers", "Reviews"]
};

// UPDATE SUBSIDEBAR
function updateSubSidebar(section) {
  const links = subLinksData[section] || [];
  subSidebar.innerHTML = `
    <div class="sub-title">${section.charAt(0).toUpperCase() + section.slice(1)}</div>
    ${links.map(txt => `<div class="sub-link">${txt}</div>`).join("")}
  `;
}

// HIDE/SHOW SECTIONS
function hideAllSections() {
  sections.forEach(sec => sec.classList.remove("active-section"));
}

function showSection(sectionId) {
  hideAllSections();
  const section = document.getElementById(sectionId);
  if (section) section.classList.add("active-section");
}

// ACTIVATE NAV LINK
function highlightLink(clicked) {
  navLinks.forEach(link => link.classList.remove("active"));
  clicked.classList.add("active");
}

// NAV CLICK HANDLING
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    const section = link.dataset.section;

    highlightLink(link);
    showSection(section);
    updateSubSidebar(section);
    handleNavigation(section);
  });
});

// DEFAULT LOAD
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
// 🌟 OVERVIEW LOGIC
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

    // TOP SHOPS
    const topShopsSnap = await getDocs(
      query(collection(db, "shops"), orderBy("rating", "desc"), limit(5))
    );

    const topList = document.getElementById("top-shops");
    topList.innerHTML = "";

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

    // RECENT LOGS
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
        const time = log.timestamp?.toDate().toLocaleString() ?? "Unknown";

        activityList.innerHTML += `
          <li>
            <strong>${log.action}</strong><br>
            <small>${time}</small>
          </li>`;
      });
    }
  } catch (e) {
    console.error("Error loading overview:", e);
  }
}

// =========================
// SECTION HANDLER
// =========================
function handleNavigation(section) {
  switch (section) {
    case "overview": loadOverviewData(); break;
    case "shops": loadShops(); break;
    case "offers": loadOffers(); break;
    case "users": loadUsers(); break;
    case "analytics": loadAnalytics(); break;
    case "messages": loadMessages(); break;
  }
}
