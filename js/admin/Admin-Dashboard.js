// ================= FIREBASE =================
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getTopPerformingOffers } from "../utils/topOffers.js";
// ================= DOM =================
const loader = document.getElementById("pageLoader");
const shopNameEl = document.getElementById("shopName");

const kpiProducts = document.getElementById("kpiProducts");
const kpiOffers = document.getElementById("kpiOffers");
const kpiStatus = document.getElementById("kpiStatus");
const kpiCreated = document.getElementById("kpiCreated");
const kpiTotalOffers = document.getElementById("kpiTotalOffers");
const kpiLiveOffers = document.getElementById("kpiLiveOffers");
const kpiOfferViews = document.getElementById("kpiOfferViews");
const kpiOfferClicks = document.getElementById("kpiOfferClicks");
const kpiOfferCTR = document.getElementById("kpiOfferCTR");
const topOffersTable = document.getElementById("topOffersTable");

// Helpers
function renderOfferTrendChart(labels, views, clicks) {
  const ctx = document.getElementById("offerTrendChart");

  if (offerTrendChart) {
    offerTrendChart.destroy();
  }

  offerTrendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Views",
          data: views,
          borderColor: "#2563EB",
          backgroundColor: "rgba(37,99,235,0.1)",
          tension: 0.4,
        },
        {
          label: "Clicks",
          data: clicks,
          borderColor: "#16A34A",
          backgroundColor: "rgba(22,163,74,0.1)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

// CONST
let offerTrendChart = null;

// ================= HELPERS =================
function isProfileComplete(shop) {
  return Boolean(shop.name && shop.category && shop.location?.city);
}
// ================= OFFERS ANALYTICS =================
async function loadOffersAnalytics(ownerId) {
  const snap = await getDocs(
    query(collection(db, "offers"), where("ownerId", "==", ownerId))
  );

  let totalOffers = 0;
  let activeOffers = 0;
  let totalViews = 0;
  let totalClicks = 0;

  let topOffer = null;

  const now = Date.now();

  snap.forEach((docSnap) => {
    const o = docSnap.data();
    totalOffers++;

    const start = o.startDate?.toMillis?.() ?? 0;
    const end = o.endDate?.toMillis?.() ?? 0;

    const isActive = o.status !== "disabled" && now >= start && now <= end;

    if (isActive) activeOffers++;

    const views = o.views || 0;
    const clicks = o.clicks || 0;

    totalViews += views;
    totalClicks += clicks;

    const ctr = views > 0 ? clicks / views : 0;

    if (!topOffer || ctr > topOffer.ctr) {
      topOffer = {
        title: o.title,
        views,
        clicks,
        ctr,
      };
    }
  });

  // Inject UI
  document.getElementById("dashTotalOffers").textContent = totalOffers;
  document.getElementById("dashActiveOffers").textContent = activeOffers;
  document.getElementById("dashOfferViews").textContent = totalViews;
  document.getElementById("dashOfferClicks").textContent = totalClicks;

  const avgCTR =
    totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) + "%" : "0%";

  document.getElementById("dashOfferCTR").textContent = avgCTR;

  // Top Offer
  const topEl = document.getElementById("topOffer");

  if (!topOffer) {
    topEl.textContent = "No offer data available";
    return;
  }

  topEl.innerHTML = `
    <span class="font-medium text-dark">
      ${topOffer.title}
    </span>
    <span>
      ${topOffer.views} views ·
      ${topOffer.clicks} clicks ·
      <span class="text-green-600 font-medium">
        ${(topOffer.ctr * 100).toFixed(2)}%
      </span>
    </span>
  `;
}
async function loadOfferPerformance(ownerId) {
  const snap = await getDocs(
    query(collection(db, "offers"), where("ownerId", "==", ownerId))
  );

  let totalOffers = 0;
  let liveOffers = 0;
  let totalViews = 0;
  let totalClicks = 0;

  const now = Date.now();

  snap.forEach((docSnap) => {
    const o = docSnap.data();
    totalOffers++;

    const start = o.startDate?.toMillis();
    const end = o.endDate?.toMillis();

    const isLive =
      o.status !== "disabled" && start && end && now >= start && now <= end;

    if (isLive) liveOffers++;

    totalViews += o.views || 0;
    totalClicks += o.clicks || 0;
  });

  const ctr =
    totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) + "%" : "0%";

  // Inject UI
  kpiTotalOffers.textContent = totalOffers;
  kpiLiveOffers.textContent = liveOffers;
  kpiOfferViews.textContent = totalViews;
  kpiOfferClicks.textContent = totalClicks;
  kpiOfferCTR.textContent = ctr;
}
async function loadTopPerformingOffers(ownerId) {
  const topOffer = await getTopPerformingOffers({
    limit: 5,
    minViews: 30,
  });

  console.log(topOffer);

  const snap = await getDocs(
    query(collection(db, "offers"), where("ownerId", "==", ownerId))
  );

  if (snap.empty) {
    topOffersTable.innerHTML = `
      <tr>
        <td colspan="5"
            class="px-6 py-10 text-center text-slate-400">
          No offers found
        </td>
      </tr>`;
    return;
  }

  const now = Date.now();

  const offers = snap.docs.map((docSnap) => {
    const o = docSnap.data();
    const views = o.views || 0;
    const clicks = o.clicks || 0;

    const ctr = views > 0 ? (clicks / views) * 100 : 0;

    let status = "expired";
    const start = o.startDate?.toMillis();
    const end = o.endDate?.toMillis();

    if (o.status === "disabled") {
      status = "disabled";
    } else if (now < start) {
      status = "scheduled";
    } else if (now >= start && now <= end) {
      status = "active";
    }

    return {
      title: o.title,
      views,
      clicks,
      ctr,
      status,
    };
  });

  // Sort: Clicks DESC → CTR DESC
  offers.sort((a, b) => {
    if (b.clicks !== a.clicks) {
      return b.clicks - a.clicks;
    }
    return b.ctr - a.ctr;
  });

  const topOffers = offers.slice(0, 5);

  topOffersTable.innerHTML = "";

  topOffers.forEach((o) => {
    topOffersTable.innerHTML += `
      <tr class="border-t">
        <td class="px-6 py-4 font-medium text-slate-900">
          ${o.title}
        </td>

        <td class="px-6 py-4">
          ${o.views}
        </td>

        <td class="px-6 py-4">
          ${o.clicks}
        </td>

        <td class="px-6 py-4">
          ${o.ctr.toFixed(1)}%
        </td>

        <td class="px-6 py-4">
          <span class="px-2 py-1 rounded-full text-xs
            ${
              o.status === "active"
                ? "bg-green-100 text-green-700"
                : o.status === "scheduled"
                ? "bg-amber-100 text-amber-700"
                : o.status === "disabled"
                ? "bg-red-100 text-red-700"
                : "bg-slate-200 text-slate-600"
            }">
            ${o.status}
          </span>
        </td>
      </tr>
    `;
  });
}
async function loadOfferTrend(ownerId, days = 7) {
  const today = new Date();
  const labels = [];
  const viewsData = [];
  const clicksData = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    labels.push(key);

    const snap = await getDocs(
      query(
        collection(db, "offer_stats"),
        where("ownerId", "==", ownerId),
        where("date", "==", key)
      )
    );

    let views = 0;
    let clicks = 0;

    snap.forEach((doc) => {
      const data = doc.data();
      views += data.views || 0;
      clicks += data.clicks || 0;
    });

    viewsData.push(views);
    clicksData.push(clicks);
  }

  renderOfferTrendChart(labels, viewsData, clicksData);
}

// ================= INIT =================
onAuthStateChanged(auth, async (user) => {
  try {
    if (!user) {
      window.location.href = "/auth.html";
      return;
    }

    // 1️⃣ Fetch shop
    const shopQuery = query(
      collection(db, "shops"),
      where("ownerId", "==", user.uid)
    );

    const shopSnap = await getDocs(shopQuery);

    if (shopSnap.empty) {
      window.location.href = "/admin/Shop-Profile.html";
      return;
    }

    const shopDoc = shopSnap.docs[0];
    const shop = shopDoc.data();

    // 2️⃣ Force completion
    if (!isProfileComplete(shop)) {
      window.location.href = "/admin/Shop-Profile.html";
      return;
    }

    // 3️⃣ Fetch KPIs (parallel)
    const [productsSnap, offersSnap] = await Promise.all([
      getDocs(
        query(collection(db, "products"), where("ownerId", "==", user.uid))
      ),
      getDocs(
        query(
          collection(db, "offers"),
          where("ownerId", "==", user.uid),
          where("status", "==", "active")
        )
      ),
    ]);

    // 4️⃣ Inject UI
    shopNameEl.textContent = shop.name || "My Shop";

    kpiProducts.textContent = productsSnap.size;
    kpiOffers.textContent = offersSnap.size;
    kpiStatus.textContent = shop.status || "active";

    kpiCreated.textContent = shop.createdAt?.toDate
      ? shop.createdAt.toDate().toLocaleDateString()
      : "—";
    // ===== KPI CONTEXTUAL HINTS =====
    if (productsSnap.size === 0) {
      document.getElementById("kpiProductsHint").textContent =
        "No products yet · Add your first product";
    }

    if (offersSnap.size === 0) {
      document.getElementById("kpiOffersHint").textContent =
        "No active offers · Create one now";
    } else {
      document.getElementById("kpiOffersHint").textContent =
        "Offers currently visible to users";
    }

    // Status color
    if (shop.status === "active") {
      kpiStatus.classList.add("text-green-600");
    } else {
      kpiStatus.classList.add("text-red-600");
    }
    await loadOffersAnalytics(user.uid);
    await loadOfferPerformance(user.uid);
    await loadTopPerformingOffers(user.uid);
    await loadOfferTrend(user.uid);
  } catch (err) {
    console.error("Admin dashboard error:", err);
    alert("Failed to load dashboard");
  } finally {
    loader.classList.add("hidden");
  }
});
