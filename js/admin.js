import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(() => {
  // === Sidebar and Section Handling ===
  const links = Array.from(document.querySelectorAll(".sidebar-menu a[data-section]"));
  const sections = Array.from(document.querySelectorAll(".content-section"));
  const pageTitle = document.getElementById("page-title");
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const closeSidebar = document.getElementById("closeSidebar");

  function showSection(sectionId, updateHash = true) {
    sections.forEach((sec) => {
      sec.classList.toggle("active-section", sec.id === sectionId);
    });

    links.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === sectionId);
    });

    const activeLink = links.find((l) => l.dataset.section === sectionId);
    pageTitle.textContent = activeLink ? activeLink.textContent.trim() : document.title;

    if (updateHash) {
      try {
        history.replaceState(null, "", `#${sectionId}`);
      } catch {
        location.hash = `#${sectionId}`;
      }
    }

    if (window.innerWidth <= 992 && sidebar.classList.contains("show")) {
      sidebar.classList.remove("show");
    }
  }

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      if (sectionId) showSection(sectionId);
    });
  });

  if (menuToggle) menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
  if (closeSidebar) closeSidebar.addEventListener("click", () => sidebar.classList.remove("show"));

  window.addEventListener("hashchange", () => {
    const hash = location.hash.replace("#", "");
    if (hash && sections.some((s) => s.id === hash)) showSection(hash, false);
  });

  (function init() {
    const initialHash = location.hash.replace("#", "");
    if (initialHash && sections.some((s) => s.id === initialHash)) {
      showSection(initialHash, false);
    } else {
      const preActive = links.find((l) => l.classList.contains("active"));
      if (preActive) showSection(preActive.dataset.section, false);
      else if (sections[0]) showSection(sections[0].id, false);
    }
  })();

  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) sidebar.classList.remove("show");
  });

  // === Admin Info Header ===
  const adminNameEl = document.getElementById("admin-name");
  const adminEmailEl = document.querySelector(".admin-email");
  const adminAvatarEl = document.querySelector(".admin-avatar");

  // === Dashboard Overview Elements ===
  const totalShopsEl = document.getElementById("total-shops");
  const totalOffersEl = document.getElementById("total-offers");
  const totalUsersEl = document.getElementById("total-users");
  const totalRevenueEl = document.getElementById("total-revenue");
  const topShopsEl = document.getElementById("top-shops");
  const activityFeedEl = document.getElementById("activity-feed");

  // === Load Dashboard Data ===
  async function loadDashboardData() {
    try {
      const [shopsSnap, offersSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "shops")),
        getDocs(collection(db, "offers")),
        getDocs(collection(db, "users")),
      ]);

      // Shops Summary
      let active = 0, pending = 0, disabled = 0;
      const shopTraffic = [];
      shopsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.status === "active") active++;
        else if (data.status === "pending") pending++;
        else if (data.status === "disabled") disabled++;
        if (data.traffic) shopTraffic.push({ name: data.name || "Unknown", traffic: data.traffic });
      });
      totalShopsEl.textContent = shopsSnap.size;
      totalShopsEl.nextElementSibling.textContent = `Active ${active} / Pending ${pending} / Disabled ${disabled}`;

      // Offers Summary
      let activeOffers = 0, expiredOffers = 0, totalRevenue = 0;
      offersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.status === "active") activeOffers++;
        else if (data.status === "expired") expiredOffers++;
        if (data.revenue) totalRevenue += Number(data.revenue);
      });
      totalOffersEl.textContent = offersSnap.size;
      totalOffersEl.nextElementSibling.textContent = `Active ${activeOffers} / Expired ${expiredOffers}`;
      totalRevenueEl.textContent = `₹${totalRevenue.toLocaleString()}`;

      // Users Summary
      let customers = 0, shopOwners = 0, admins = 0;
      usersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.role === "customer") customers++;
        else if (data.role === "shopOwner") shopOwners++;
        else if (data.role === "admin") admins++;
      });
      totalUsersEl.textContent = usersSnap.size;
      totalUsersEl.nextElementSibling.textContent = `Customers ${customers} / ShopOwners ${shopOwners} / Admins ${admins}`;

      // Top Shops
      shopTraffic.sort((a, b) => b.traffic - a.traffic);
      const top3 = shopTraffic.slice(0, 3);
      topShopsEl.innerHTML = top3.map(
        (s) => `<li>${s.name} <span class="muted">— ${s.traffic.toLocaleString()} visits</span></li>`
      ).join("");

      // Activity Feed Example
      activityFeedEl.innerHTML = `
        <li><div class="feed-time">Just now</div><div class="feed-text">Loaded ${shopsSnap.size} shops, ${offersSnap.size} offers, ${usersSnap.size} users.</div></li>
      ` + activityFeedEl.innerHTML;

      console.log("✅ Dashboard data loaded!");
    } catch (err) {
      console.error("❌ Error loading dashboard data:", err);
    }
  }

  // === Auth State & User Info ===
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          adminNameEl.textContent = userData.name || "Admin User";
          adminEmailEl.textContent = user.email;
          adminAvatarEl.src = user.photoURL || "https://i.pravatar.cc/40";

          if (userData.role === "admin" || userData.role === "shopOwner") {
            loadDashboardData(); // Only load dashboard if admin/shopOwner
          } else {
            console.warn("⚠️ Access denied: Not an admin or shop owner.");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      window.location.href = "login.html";
    }
  });
})();
