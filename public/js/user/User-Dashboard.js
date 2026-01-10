import { db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const shopsGrid = document.getElementById("shopsGrid");
const grid = document.getElementById("trendingOffersGrid");

(async function initDashboard() {
  await Promise.all([loadUserKPIs(), loadTrendingOffers(), loadPopularShops()]);
})();

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;

  let current = 0;
  const step = Math.max(1, Math.ceil(target / 30));

  function update() {
    current += step;
    if (current >= target) {
      el.textContent = target;
    } else {
      el.textContent = current;
      requestAnimationFrame(update);
    }
  }

  update();
}

async function loadUserKPIs() {
  try {
    const [offersSnap, shopsSnap, categoriesSnap, floorsSnap] = await Promise.all([
      getDocs(query(collection(db, "offers"), where("status", "==", "active"))),
      getDocs(query(collection(db, "shops"), where("status", "==", "active"))),
      getDocs(collection(db, "categories")),
      getDocs(collection(db, "floors")),
    ]);

    animateCount("kpiLiveOffers", offersSnap.size);
    animateCount("kpiShops", shopsSnap.size);
    animateCount("kpiCategories", categoriesSnap.size);
    animateCount("kpiFloors", floorsSnap.size);

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
        <div class="text-center py-10 text-slate-400">
          <img src="https://illustrations.popsy.co/gray/empty-cart.svg" class="w-40 mx-auto mb-4">
          <p class="text-sm">No active offers right now</p>
        </div>`;
      return;
    }

    snap.forEach((docSnap) => {
      const o = docSnap.data();

      const card = document.createElement("div");
      card.className =
        "bg-white border rounded-2xl overflow-hidden lift cursor-pointer";

      card.onclick = () => {
        window.location.href = `/user/Offer-Details.html?id=${docSnap.id}`;
      };

      card.innerHTML = `
        <div class="relative">
          <img src="${o.thumbnailUrl}" class="w-full h-44 object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

          <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            ${o.discountType === "percentage" ? o.discountValue + "% OFF" : "₹" + o.discountValue + " OFF"}
          </span>

          <h3 class="absolute bottom-3 left-4 text-white font-medium">
            ${o.title}
          </h3>
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Trending offers error:", err);
    grid.innerHTML = `<p class="text-sm text-red-500">Failed to load offers</p>`;
  }
}

async function loadPopularShops() {
  shopsGrid.innerHTML = "";

  const snap = await getDocs(query(collection(db, "shops"), limit(8)));

  if (snap.empty) {
    shopsGrid.innerHTML = `
      <div class="text-center py-10 text-slate-400">
        <img src="https://illustrations.popsy.co/gray/storefront.svg" class="w-40 mx-auto mb-4">
        <p>No shops found</p>
      </div>`;
    return;
  }

  snap.forEach((docSnap) => {
    const s = docSnap.data();

    const card = document.createElement("div");
    card.className = "bg-white border rounded-2xl p-5 lift";

    card.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold">
          ${s.name.charAt(0)}
        </div>

        <div>
          <h3 class="font-medium text-dark">${s.name}</h3>
          <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            ${s.category}
          </span>
        </div>
      </div>
    `;

    shopsGrid.appendChild(card);
  });
}
