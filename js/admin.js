// admin.js
import { db } from "./firebase-config.js";
import {
  collection,
  getCountFromServer,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { loadShops } from "./admin-shops.js";
import { loadOffers } from "./admin-offers.js";
// ======== TAB SWITCH CODE (already written) ======== //
const navLinks = document.querySelectorAll(".nav a");
const sections = document.querySelectorAll(".content-section");

function hideAllSections() {
  sections.forEach((section) => section.classList.remove("active-section"));
}
function showSection(id) {
  const cleanId = id.replace("#", "");
  const section = document.getElementById(cleanId);
  if (section) {
    hideAllSections();
    section.classList.add("active-section");
  }
}
function setActiveLink(clickedLink) {
  navLinks.forEach((link) => link.classList.remove("active"));
  clickedLink.classList.add("active");
}
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.getAttribute("href");

    setActiveLink(link);
    showSection(target);

    handleNavigation(target);  // ⭐ FORCE LOAD
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const firstLink = navLinks[0];
  if (firstLink) {
    setActiveLink(firstLink);
    showSection(firstLink.getAttribute("href"));
    loadOverviewData(); // Load data for Overview
  }
});

// ======== OVERVIEW DASHBOARD LOGIC ======== //
async function loadOverviewData() {
  try {
    // --- Count totals --- //
    const shopsSnap = await getCountFromServer(collection(db, "shops"));
    const offersSnap = await getCountFromServer(collection(db, "offers"));
    const usersSnap = await getCountFromServer(collection(db, "users"));

    document.getElementById("total-shops").textContent = shopsSnap.data().count;
    document.getElementById("total-offers").textContent =
      offersSnap.data().count;
    document.getElementById("total-users").textContent = usersSnap.data().count;
    document.getElementById("total-revenue").textContent =
      "₹" + (shopsSnap.data().count * 5000).toLocaleString();

    // --- Top Shops --- //
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
      topShopsSnap.forEach((doc) => {
        const shop = doc.data();
        topList.innerHTML += `
          <li>
            <strong>${shop.name || "Unnamed Shop"}</strong><br>
            <small>⭐ ${shop.rating || "N/A"} | ${
          shop.category || "General"
        }</small>
          </li>`;
      });
    }

    // --- Recent Activity --- //
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
      logsSnap.forEach((doc) => {
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
function handleNavigation(hash = location.hash) {
  if (hash === "#overview" || hash === "" || !hash) loadOverviewData();
  if (hash === "#shops") loadShops();
  if (hash === "#offers") loadOffers();
}

window.addEventListener("hashchange", handleNavigation);
document.addEventListener("DOMContentLoaded", handleNavigation);

function animateNumber(id) {
  const el = document.getElementById(id);
  el.classList.add("updated");
  setTimeout(() => el.classList.remove("updated"), 400);
}
animateNumber("total-shops");
animateNumber("total-offers");
animateNumber("total-users");
animateNumber("total-revenue");
