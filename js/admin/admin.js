// admin.js
import { loadOverviewSection } from "../admin/admin-overview.js";
import { loadShops } from "../admin/admin-shops.js";
import { loadOffers } from "../admin/admin-offers.js";
import { loadUsers } from "../admin/admin-users.js";
import { loadAnalytics } from "../admin/admin-analytics.js";
import { loadMessages } from "../admin/admin-messages.js";

// =========================
// 🌟 TOP NAVBAR
// =========================
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".content-section");
const subSidebar = document.getElementById("subSidebar");

// =========================
// SUB-SIDEBAR DATA (with keys)
// =========================
const subLinksData = {
  overview: [
    {
      key: "summary",
      label: "Dashboard Summary",
      icon: '<i data-lucide="layout-dashboard"></i>',
    },
    {
      key: "today",
      label: "Today's Metrics",
      icon: '<i data-lucide="calendar"></i>',
    },
    {
      key: "charts",
      label: "Performance Charts",
      icon: '<i data-lucide="bar-chart"></i>',
    },
    {
      key: "activity",
      label: "Activity Logs",
      icon: '<i data-lucide="clipboard-list"></i>',
    },
    {
      key: "registrations",
      label: "New Registrations",
      icon: '<i data-lucide="users"></i>',
    },
  ],

  shops: [
    { key: "all", label: "All Shops", icon: '<i data-lucide="store"></i>' },
    {
      key: "add",
      label: "Add New Shop",
      icon: '<i data-lucide="plus-circle"></i>',
    },
    {
      key: "pending",
      label: "Pending Approvals",
      icon: '<i data-lucide="clock"></i>',
    },
    {
      key: "categories",
      label: "Shop Categories",
      icon: '<i data-lucide="folder"></i>',
    },
    {
      key: "analytics",
      label: "Shops Analytics",
      icon: '<i data-lucide="pie-chart"></i>',
    },
  ],

  offers: [
    { key: "all", label: "All Offers", icon: '<i data-lucide="tag"></i>' },
    {
      key: "create",
      label: "Create Offer",
      icon: '<i data-lucide="plus"></i>',
    },
    {
      key: "expired",
      label: "Expired Offers",
      icon: '<i data-lucide="alert-circle"></i>',
    },
    {
      key: "analytics",
      label: "Offer Analytics",
      icon: '<i data-lucide="chart-line"></i>',
    },
  ],

  users: [
    { key: "all", label: "All Users", icon: '<i data-lucide="users"></i>' },
    { key: "roles", label: "User Roles", icon: '<i data-lucide="shield"></i>' },
    {
      key: "active",
      label: "Active Users",
      icon: '<i data-lucide="check-circle"></i>',
    },
    {
      key: "verification",
      label: "Verification Requests",
      icon: '<i data-lucide="badge-check"></i>',
    },
  ],

  analytics: [
    {
      key: "revenue",
      label: "Revenue Graphs",
      icon: '<i data-lucide="trending-up"></i>',
    },
    {
      key: "userGrowth",
      label: "User Growth",
      icon: '<i data-lucide="arrow-up-circle"></i>',
    },
    {
      key: "shopGrowth",
      label: "Shop Growth",
      icon: '<i data-lucide="activity"></i>',
    },
    {
      key: "orders",
      label: "Orders Trend",
      icon: '<i data-lucide="line-chart"></i>',
    },
  ],

  messages: [
    { key: "inbox", label: "Inbox", icon: '<i data-lucide="inbox"></i>' },
    {
      key: "tickets",
      label: "Support Tickets",
      icon: '<i data-lucide="life-buoy"></i>',
    },
    { key: "unread", label: "Unread", icon: '<i data-lucide="mail"></i>' },
    { key: "spam", label: "Spam", icon: '<i data-lucide="ban"></i>' },
  ],
};

// =========================
// UPDATE SUB-SIDEBAR
// =========================
function updateSubSidebar(section) {
  const links = subLinksData[section] || [];

  subSidebar.innerHTML = `
    <div class="sub-title">${
      section.charAt(0).toUpperCase() + section.slice(1)
    }</div>
    ${links
      .map(
        (item) => `
        <div class="sub-link" data-subkey="${item.key}">
           ${item.icon}
           <span>${item.label}</span>
        </div>`
      )
      .join("")}
  `;

  lucide.createIcons();
  attachSubLinkEvents(section);
}

// =========================
// SUB-LINK CLICK BEHAVIOR
// =========================
function attachSubLinkEvents(section) {
  const links = document.querySelectorAll(".sub-link");

  links.forEach((link) => {
    link.addEventListener("click", () => {
      // remove previous active
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const subkey = link.dataset.subkey;

      // ---- WHICH SECTION ARE WE IN? ----
      if (section === "overview") {
        loadOverviewSection(subkey);
      }

      if (section === "shops") {
        loadShops(subkey);
      }

      if (section === "offers") {
        loadOffers(subkey);
      }

      if (section === "users") {
        loadUsers(subkey);
      }

      if (section === "analytics") {
        loadAnalytics(subkey);
      }

      if (section === "messages") {
        loadMessages(subkey);
      }
    });
  });
}

// =========================
// MAIN SECTION NAVIGATION
// =========================
function hideAllSections() {
  sections.forEach((sec) => sec.classList.remove("active-section"));
}

function showSection(sectionId) {
  document
    .querySelectorAll(".content-section")
    .forEach((sec) => sec.classList.remove("active-section"));

  // ONLY show the main section, not the sub-parts
  document.getElementById(sectionId).classList.add("active-section");

  // Reset overview parts
  if (sectionId === "overview") {
    loadOverviewSection("summary");
  }
}

function highlightLink(clicked) {
  navLinks.forEach((l) => l.classList.remove("active"));
  clicked.classList.add("active");
}

// NAVBAR CLICK
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
// PAGE LOAD DEFAULT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const first = navLinks[0];
  if (first) {
    highlightLink(first);
    showSection("overview");
    updateSubSidebar("overview");
    loadOverviewSection("summary"); // 🔥 now loads the OVERVIEW sub-part
  }
});

// =========================
// SECTION LOADER DISPATCHER
// =========================
function handleNavigation(section) {
  switch (section) {
    case "overview":
      loadOverviewSection("summary");
      break;

    case "shops":
      loadShops("all");
      break;

    case "offers":
      loadOffers("all");
      break;

    case "users":
      loadUsers("all");
      break;

    case "analytics":
      loadAnalytics("revenue");
      break;

    case "messages":
      loadMessages("inbox");
      break;
  }
}
