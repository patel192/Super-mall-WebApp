// js/admin-overview.js
import { db } from "../firebase-config.js";
import {
  collection,
  getCountFromServer,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Helper to escape HTML
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function animateNumber(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("updated");
  setTimeout(() => el.classList.remove("updated"), 550);
}

export async function loadOverviewData() {
  try {
    // loading placeholders
    const setLoading = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    setLoading("total-shops", "Loading...");
    setLoading("total-offers", "Loading...");
    setLoading("total-users", "Loading...");
    setLoading("total-revenue", "Loading...");

    // Fetch counts
    const [shopsCountSnap, offersCountSnap, usersCountSnap] = await Promise.all([
      getCountFromServer(collection(db, "shops")),
      getCountFromServer(collection(db, "offers")),
      getCountFromServer(collection(db, "users")),
    ]);

    const shopsCount = shopsCountSnap.data().count || 0;
    const offersCount = offersCountSnap.data().count || 0;
    const usersCount = usersCountSnap.data().count || 0;

    document.getElementById("total-shops").textContent = shopsCount.toLocaleString();
    animateNumber("total-shops");

    document.getElementById("total-offers").textContent = offersCount.toLocaleString();
    animateNumber("total-offers");

    document.getElementById("total-users").textContent = usersCount.toLocaleString();
    animateNumber("total-users");

    // Compute revenue (best-effort)
    let totalRevenue = 0;
    try {
      const offersSnap = await getDocs(collection(db, "offers"));
      offersSnap.forEach((ofs) => {
        const d = ofs.data();
        if (d.revenue != null) totalRevenue += Number(d.revenue) || 0;
        else if (d.estimatedRevenue != null) totalRevenue += Number(d.estimatedRevenue) || 0;
        else if (d.price && d.discount) {
          totalRevenue += (Number(d.price) || 0) * ((Number(d.discount) || 0) / 100);
        }
      });
    } catch (err) {
      console.warn("Could not compute revenue:", err);
    }
    document.getElementById("total-revenue").textContent = `₹${Math.round(totalRevenue).toLocaleString()}`;
    animateNumber("total-revenue");

    // Top shops
    try {
      let topSnap;
      try {
        topSnap = await getDocs(query(collection(db, "shops"), orderBy("traffic", "desc"), limit(5)));
      } catch {
        topSnap = await getDocs(query(collection(db, "shops"), limit(5)));
      }
      const topListEl = document.getElementById("top-shops");
      topListEl.innerHTML = "";
      if (topSnap.empty) {
        topListEl.innerHTML = "<li>No shops found</li>";
      } else {
        topSnap.forEach((s) => {
          const sd = s.data();
          const name = sd.name || sd.title || "Unnamed Shop";
          const visits = sd.traffic ?? sd.visits ?? sd.rating ?? "N/A";
          topListEl.insertAdjacentHTML(
            "beforeend",
            `<li><strong>${escapeHtml(name)}</strong><br><small class="muted">— ${typeof visits === "number" ? visits.toLocaleString() : escapeHtml(String(visits))} visits</small></li>`
          );
        });
      }
    } catch (err) {
      console.error("Error loading top shops:", err);
      document.getElementById("top-shops").innerHTML = "<li>Failed to load top shops</li>";
    }

    // Recent activity (appLogs or analytics fallback)
    try {
      const logsCollectionsToTry = ["appLogs", "analytics", "app_log"];
      let logsSnap = null;
      for (const colName of logsCollectionsToTry) {
        try {
          const q = query(collection(db, colName), orderBy("timestamp", "desc"), limit(6));
          const snap = await getDocs(q);
          if (!snap.empty) {
            logsSnap = snap;
            break;
          }
        } catch (errInner) {
          // ignore and try next collection
        }
      }

      const activityEl = document.getElementById("activity-feed");
      activityEl.innerHTML = "";
      if (!logsSnap || logsSnap.empty) {
        activityEl.innerHTML = "<li>No recent activity</li>";
      } else {
        logsSnap.forEach((l) => {
          const ld = l.data();
          const when = ld.timestamp && typeof ld.timestamp.toDate === "function"
            ? ld.timestamp.toDate().toLocaleString()
            : (ld.timestamp ? String(ld.timestamp) : "unknown time");
          const action = ld.action || ld.message || ld.event || "Activity";
          activityEl.insertAdjacentHTML(
            "beforeend",
            `<li><strong>${escapeHtml(action)}</strong><br><small>${escapeHtml(when)}</small></li>`
          );
        });
      }
    } catch (err) {
      console.error("Error loading activity logs:", err);
      document.getElementById("activity-feed").innerHTML = "<li>Error loading activity</li>";
    }

    console.log("✅ Overview data loaded");
  } catch (err) {
    console.error("❌ Error loading overview data:", err);
  }
}

// Auto-run on DOMContentLoaded if overview is active
function runOnOverviewReady() {
  const overviewSection = document.getElementById("overview");
  if (!overviewSection) return;
  if (overviewSection.classList.contains("active-section")) {
    loadOverviewData();
  }
  window.addEventListener("hashchange", () => {
    if (location.hash.replace("#", "") === "overview") loadOverviewData();
  });
}
document.addEventListener("DOMContentLoaded", runOnOverviewReady);
