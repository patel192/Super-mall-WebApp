import { db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================

const shopsGrid = document.getElementById("shopsGrid");
const grid = document.getElementById("trendingOffersGrid");

// ================= INIT =================
(async function initDashboard() {
  await Promise.all([loadUserKPIs(), loadTrendingOffers(), loadPopularShops()]);
})();

async function loadUserKPIs() {
  try {
    const now = new Date();

    // Parallel queries (FAST)
    const [offersSnap, shopsSnap, categoriesSnap, floorsSnap] =
      await Promise.all([
        // Live offers
        getDocs(
          query(collection(db, "offers"), where("status", "==", "active"))
        ),

        // Active shops
        getDocs(
          query(collection(db, "shops"), where("status", "==", "active"))
        ),

        // Categories
        getDocs(collection(db, "categories")),

        // Floors (optional)
        getDocs(collection(db, "floors")),
      ]);

    document.getElementById("kpiLiveOffers").textContent = offersSnap.size;

    document.getElementById("kpiShops").textContent = shopsSnap.size;

    document.getElementById("kpiCategories").textContent = categoriesSnap.size;

    document.getElementById("kpiFloors").textContent = floorsSnap.size;
  } catch (err) {
    console.error("Failed to load KPIs:", err);
  }
}

async function loadTrendingOffers() {
  try {
    const q = query(
      collection(db, "offers"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(6)
    );

    const snap = await getDocs(q);
    grid.innerHTML = "";

    if (snap.empty) {
      grid.innerHTML = `
          <p class="text-sm text-slate-400">
            No active offers right now
          </p>`;
      return;
    }

    snap.forEach((docSnap) => {
      const o = docSnap.data();

      const card = document.createElement("div");
      card.className =
        "bg-white border rounded-2xl overflow-hidden hover:shadow-md transition cursor-pointer";

      card.onclick = () => {
        window.location.href = `/public/user/Offer-Details.html?id=${docSnap.id}`;
      };

      card.innerHTML = `
          <div class="relative">
            <img
              src="${o.thumbnailUrl}"
              class="w-full h-44 object-cover"/>

            <span class="absolute top-3 left-3
              px-3 py-1 rounded-full text-xs font-medium
              bg-green-100 text-green-700">
              ${
                o.discountType === "percentage"
                  ? o.discountValue + "% OFF"
                  : "₹" + o.discountValue + " OFF"
              }
            </span>
          </div>

          <div class="p-4 space-y-1">
            <h3 class="font-medium text-slate-900 line-clamp-1">
              ${o.title}
            </h3>

            <p class="text-sm text-slate-500">
              Valid till ${o.endDate.toDate().toLocaleDateString()}
            </p>
          </div>
        `;

      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Trending offers error:", err);
    grid.innerHTML = `
        <p class="text-sm text-red-500">
          Failed to load offers
        </p>`;
  }
}
// ================= SHOPS =================
async function loadPopularShops() {
  shopsGrid.innerHTML = "";

  const snap = await getDocs(query(collection(db, "shops"), limit(8)));

  if (snap.empty) {
    shopsGrid.innerHTML = `
      <p class="text-slate-400 text-sm">
        No shops found
      </p>`;
    return;
  }

  snap.forEach((docSnap) => {
    const s = docSnap.data();

    const card = document.createElement("div");
    card.className =
      "bg-white border rounded-2xl p-5 hover:shadow-md transition";

    card.innerHTML = `
      <h3 class="font-medium text-dark">
        ${s.name}
      </h3>
      <p class="text-sm text-slate-500 mt-1">
        ${s.category}
      </p>
    `;

    shopsGrid.appendChild(card);
  });
}
