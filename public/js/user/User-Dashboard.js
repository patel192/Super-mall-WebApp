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
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 30));

  function update() {
    current += step;
    if (current >= target) el.textContent = target;
    else {
      el.textContent = current;
      requestAnimationFrame(update);
    }
  }
  update();
}

async function loadUserKPIs() {
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
}

async function loadTrendingOffers() {
  const snap = await getDocs(query(
    collection(db, "offers"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(6)
  ));

  grid.innerHTML = "";

  snap.forEach(docSnap => {
    const o = docSnap.data();

    const card = document.createElement("div");
    card.className =
      "group relative overflow-hidden rounded-3xl shadow hover:shadow-xl transition cursor-pointer";

    card.onclick = () => location.href = `/user/Offer-Details.html?id=${docSnap.id}`;

    card.innerHTML = `
      <img src="${o.thumbnailUrl}" class="w-full h-64 object-cover group-hover:scale-105 transition duration-500"/>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      <div class="absolute bottom-4 left-4 right-4 text-white">
        <span class="text-xs bg-white/20 px-3 py-1 rounded-full">
          ${o.discountType === "percentage" ? o.discountValue + "% OFF" : "₹" + o.discountValue + " OFF"}
        </span>
        <h3 class="mt-3 font-semibold">${o.title}</h3>
      </div>
    `;

    grid.appendChild(card);
  });
}

async function loadPopularShops() {
  const snap = await getDocs(query(collection(db, "shops"), limit(8)));

  shopsGrid.innerHTML = "";

  snap.forEach(docSnap => {
    const s = docSnap.data();
    const logo = s.logoUrl || "https://ui-avatars.com/api/?name=" + s.name;

    const card = document.createElement("div");
    card.className =
      "group bg-white dark:bg-slate-800 rounded-3xl shadow hover:shadow-xl transition overflow-hidden cursor-pointer";

    card.onclick = () => location.href = `/user/Shop-Details.html?id=${docSnap.id}`;

    card.innerHTML = `
      <div class="h-28 bg-gradient-to-br from-primary to-indigo-600"></div>

      <div class="relative p-5 -mt-10">
        <img src="${logo}" class="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow"/>

        <h3 class="mt-4 font-semibold text-slate-900 dark:text-white line-clamp-1">
          ${s.name}
        </h3>

        <p class="text-xs text-slate-500">${s.location?.city || ""}</p>

        <span class="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          ${s.category}
        </span>
      </div>
    `;

    shopsGrid.appendChild(card);
  });
}
