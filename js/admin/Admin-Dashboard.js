// ================= FIREBASE =================
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");
const shopNameEl = document.getElementById("shopName");

const kpiProducts = document.getElementById("kpiProducts");
const kpiOffers = document.getElementById("kpiOffers");
const kpiStatus = document.getElementById("kpiStatus");
const kpiCreated = document.getElementById("kpiCreated");

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

  snap.forEach(docSnap => {
    const o = docSnap.data();
    totalOffers++;

    const start = o.startDate?.toMillis?.() ?? 0;
    const end = o.endDate?.toMillis?.() ?? 0;

    const isActive =
      o.status !== "disabled" &&
      now >= start &&
      now <= end;

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
        ctr
      };
    }
  });

  // Inject UI
  document.getElementById("dashTotalOffers").textContent = totalOffers;
  document.getElementById("dashActiveOffers").textContent = activeOffers;
  document.getElementById("dashOfferViews").textContent = totalViews;
  document.getElementById("dashOfferClicks").textContent = totalClicks;

  const avgCTR =
    totalViews > 0
      ? ((totalClicks / totalViews) * 100).toFixed(2) + "%"
      : "0%";

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
  } catch (err) {
    console.error("Admin dashboard error:", err);
    alert("Failed to load dashboard");
  } finally {
    loader.classList.add("hidden");
  }
});
