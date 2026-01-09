// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");
const shopsGrid = document.getElementById("shopsGrid");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

// ================= PARAM =================
const params = new URLSearchParams(window.location.search);
const floorId = params.get("floor");

// ================= LOAD FLOOR INFO (OPTIONAL) =================
async function loadFloorInfo() {
  if (!floorId) return;

  const snap = await getDoc(doc(db, "floors", floorId));
  if (snap.exists()) {
    const floor = snap.data();
    pageTitle.textContent = floor.name;
    pageSubtitle.textContent = "Shops on this floor";
  }
}

// ================= LOAD SHOPS =================
async function loadShops() {
  shopsGrid.innerHTML = "";

  let q;

  if (floorId) {
    // 🟦 Floor-based shops
    q = query(
      collection(db, "shops"),
      where("floorId", "==", floorId),
      where("status", "==", "active")
    );
  } else {
    // 🟩 All shops (sidebar entry)
    pageTitle.textContent = "All Shops";
    pageSubtitle.textContent = "Browse all available shops";

    q = query(
      collection(db, "shops"),
      where("status", "==", "active")
    );
  }

  const snap = await getDocs(q);

  if (snap.empty) {
    shopsGrid.innerHTML = `
      <div class="col-span-full text-center text-slate-400 py-10">
        No shops available
      </div>`;
    return;
  }

  snap.forEach((docSnap) => {
    const shop = docSnap.data();

    const card = document.createElement("div");
    card.className =
      "bg-white border rounded-2xl p-6 hover:shadow-md transition cursor-pointer";

    card.innerHTML = `
      <div class="flex items-center gap-4">
        <img
          src="${shop.logoUrl || "https://via.placeholder.com/80"}"
          class="w-20 h-20 rounded-xl object-cover border"/>

        <div>
          <h3 class="font-semibold text-dark">
            ${shop.name}
          </h3>
          <p class="text-sm text-slate-500">
            ${shop.category || "Shop"}
          </p>
        </div>
      </div>

      <p class="text-xs text-slate-500 mt-4 line-clamp-2">
        ${shop.description || "Explore products from this shop"}
      </p>
    `;

    card.onclick = () => {
      window.location.href =
        `/user/Shop-Details.html?id=${docSnap.id}`;
    };

    shopsGrid.appendChild(card);
  });
}

// ================= INIT =================
(async function init() {
  try {
    await loadFloorInfo();
    await loadShops();
  } catch (err) {
    console.error("Failed to load shops:", err);
    shopsGrid.innerHTML = `
      <div class="col-span-full text-center text-red-500 py-10">
        Failed to load shops
      </div>`;
  } finally {
    loader.classList.add("hidden");
  }
})();
