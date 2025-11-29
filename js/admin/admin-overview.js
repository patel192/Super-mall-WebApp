// js/admin-overview.js
import { db } from "../firebase-config.js";
import {
  collection,
  getCountFromServer,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ------------------------------
   Helpers
------------------------------ */

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

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* ------------------------------
   Part visibility controller
------------------------------ */

// hide all overview parts, show requested one
function setActiveOverviewPart(partKey = "summary") {
  const allParts = document.querySelectorAll(".overview-part");
  allParts.forEach((p) => p.classList.remove("overview-part-active"));

  const active = document.querySelector(
    `.overview-part[data-overview-part="${partKey}"]`
  );
  if (active) {
    active.classList.add("overview-part-active");
  }
}

/* ==================================================
   1. DASHBOARD SUMMARY  (KPIs)
================================================== */
export async function loadOverviewSummary() {
  try {
    setText("total-shops", "…");
    setText("total-offers", "…");
    setText("total-users", "…");
    setText("total-revenue", "…");

    const [shopsCountSnap, offersCountSnap, usersCountSnap] =
      await Promise.all([
        getCountFromServer(collection(db, "shops")),
        getCountFromServer(collection(db, "offers")),
        getCountFromServer(collection(db, "users")),
      ]);

    const shopsCount = shopsCountSnap.data().count || 0;
    const offersCount = offersCountSnap.data().count || 0;
    const usersCount = usersCountSnap.data().count || 0;

    setText("total-shops", shopsCount.toLocaleString());
    animateNumber("total-shops");

    setText("total-offers", offersCount.toLocaleString());
    animateNumber("total-offers");

    setText("total-users", usersCount.toLocaleString());
    animateNumber("total-users");

    // Revenue – best-effort from offers collection
    let totalRevenue = 0;
    try {
      const offersSnap = await getDocs(collection(db, "offers"));
      offersSnap.forEach((ofs) => {
        const d = ofs.data();
        if (d.revenue != null) {
          totalRevenue += Number(d.revenue) || 0;
        } else if (d.estimatedRevenue != null) {
          totalRevenue += Number(d.estimatedRevenue) || 0;
        } else if (d.price && d.discount) {
          totalRevenue +=
            (Number(d.price) || 0) * ((Number(d.discount) || 0) / 100);
        }
      });
    } catch (errRev) {
      console.warn("Could not compute revenue:", errRev);
    }

    setText(
      "total-revenue",
      "₹" + Math.round(totalRevenue).toLocaleString()
    );
    animateNumber("total-revenue");

    console.log("✅ Overview summary loaded");
  } catch (err) {
    console.error("❌ Error loading overview summary:", err);
    setText("total-shops", "Error");
    setText("total-offers", "Error");
    setText("total-users", "Error");
    setText("total-revenue", "Error");
  }
}

/* ==================================================
   2. TODAY'S METRICS
   (stub – you can improve with real 'today' filters)
================================================== */
export async function loadOverviewTodayMetrics() {
  try {
    // Simple placeholders for now.
    // Later you can add where(timestamp >= todayStart && timestamp <= todayEnd)
    setText("users-today", "0");
    setText("shops-today", "0");
    setText("revenue-today", "₹0");
    setText("orders-today", "0");
    console.log("✅ Today metrics loaded (stub)");
  } catch (err) {
    console.error("❌ Error loading today metrics:", err);
  }
}

/* ==================================================
   3. PERFORMANCE CHARTS
   (you can plug Chart.js or similar here)
================================================== */
export async function loadOverviewCharts() {
  try {
    // Placeholder – hook in Chart.js here if needed
    console.log("📊 loadOverviewCharts called – implement charts here if needed");
  } catch (err) {
    console.error("❌ Error loading charts:", err);
  }
}

/* ==================================================
   4. TOP SHOPS + ACTIVITY LOGS
================================================== */
export async function loadOverviewActivity() {
  /* ---- TOP SHOPS ---- */
  try {
    let topSnap;
    try {
      topSnap = await getDocs(
        query(collection(db, "shops"), orderBy("traffic", "desc"), limit(5))
      );
    } catch {
      topSnap = await getDocs(query(collection(db, "shops"), limit(5)));
    }

    const topListEl = document.getElementById("top-shops");
    if (topListEl) {
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
            `<li>
              <strong>${escapeHtml(name)}</strong><br>
              <small class="muted">— ${
                typeof visits === "number"
                  ? visits.toLocaleString()
                  : escapeHtml(String(visits))
              } visits</small>
            </li>`
          );
        });
      }
    }
  } catch (err) {
    console.error("Error loading top shops:", err);
    const el = document.getElementById("top-shops");
    if (el) el.innerHTML = "<li>Failed to load top shops</li>";
  }

  /* ---- ACTIVITY LOGS ---- */
  try {
    const activityEl = document.getElementById("activity-feed");
    if (!activityEl) return;

    const logsCollectionsToTry = ["appLogs", "analytics", "app_log"];
    let logsSnap = null;

    for (const colName of logsCollectionsToTry) {
      try {
        const qLogs = query(
          collection(db, colName),
          orderBy("timestamp", "desc"),
          limit(6)
        );
        const snap = await getDocs(qLogs);
        if (!snap.empty) {
          logsSnap = snap;
          break;
        }
      } catch (errInner) {
        // ignore and try next collection
      }
    }

    activityEl.innerHTML = "";
    if (!logsSnap || logsSnap.empty) {
      activityEl.innerHTML = "<li>No recent activity</li>";
    } else {
      logsSnap.forEach((l) => {
        const ld = l.data();
        const when =
          ld.timestamp && typeof ld.timestamp.toDate === "function"
            ? ld.timestamp.toDate().toLocaleString()
            : ld.timestamp
            ? String(ld.timestamp)
            : "unknown time";
        const action = ld.action || ld.message || ld.event || "Activity";
        activityEl.insertAdjacentHTML(
          "beforeend",
          `<li>
            <strong>${escapeHtml(action)}</strong><br>
            <small>${escapeHtml(when)}</small>
          </li>`
        );
      });
    }
  } catch (err) {
    console.error("Error loading activity logs:", err);
    const el = document.getElementById("activity-feed");
    if (el) el.innerHTML = "<li>Error loading activity</li>";
  }

  console.log("✅ Overview activity loaded");
}

/* ==================================================
   5. NEW REGISTRATIONS + ALERTS
================================================== */
export async function loadOverviewRegistrations() {
  /* ---- ALERTS (placeholder) ---- */
  const alertEl = document.getElementById("alert-feed");
  if (alertEl) {
    alertEl.innerHTML = "<li>No alerts</li>";
  }

  /* ---- NEW REGISTRATIONS ---- */
  try {
    const usersCol = collection(db, "users");
    let usersSnap;
    try {
      usersSnap = await getDocs(
        query(usersCol, orderBy("createdAt", "desc"), limit(6))
      );
    } catch {
      usersSnap = await getDocs(query(usersCol, limit(6)));
    }

    const regEl = document.getElementById("new-registrations");
    if (!regEl) return;

    regEl.innerHTML = "";
    if (usersSnap.empty) {
      regEl.innerHTML = "<li>No recent registrations</li>";
    } else {
      usersSnap.forEach((u) => {
        const ud = u.data();
        const name = ud.name || ud.displayName || "Unnamed User";
        const email = ud.email || "no email";
        const created =
          ud.createdAt && typeof ud.createdAt.toDate === "function"
            ? ud.createdAt.toDate().toLocaleDateString()
            : "";

        regEl.insertAdjacentHTML(
          "beforeend",
          `<li>
            <strong>${escapeHtml(name)}</strong><br>
            <small>${escapeHtml(email)} ${
            created ? "• " + escapeHtml(created) : ""
          }</small>
          </li>`
        );
      });
    }
    console.log("✅ Overview registrations loaded");
  } catch (err) {
    console.error("Error loading new registrations:", err);
    const regEl = document.getElementById("new-registrations");
    if (regEl) {
      regEl.innerHTML = "<li>Error loading registrations</li>";
    }
  }
}

/* ==================================================
   MASTER DISPATCHER (called from admin.js)
================================================== */
export function loadOverviewSection(part = "summary") {
  setActiveOverviewPart(part);

  switch (part) {
    case "summary":
      loadOverviewSummary();
      break;
    case "today":
      loadOverviewTodayMetrics();
      break;
    case "charts":
      loadOverviewCharts();
      break;
    case "activity":
      loadOverviewActivity();
      break;
    case "registrations":
      loadOverviewRegistrations();
      break;
    default:
      loadOverviewSummary();
  }
}

/* Optional: auto-load summary if overview is active on first load */
document.addEventListener("DOMContentLoaded", () => {
  const overviewSection = document.getElementById("overview");
  if (overviewSection && overviewSection.classList.contains("active-section")) {
    loadOverviewSection("summary");
  }
});
