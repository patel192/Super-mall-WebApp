// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
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

    q = query(collection(db, "shops"), where("status", "==", "active"));
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
    card.className = `
    group bg-white 
    border border-slate-200 
    rounded-3xl overflow-hidden
    shadow-sm hover:shadow-2xl
    hover:-translate-y-1
    transition-all duration-300
    cursor-pointer
  `;

    card.innerHTML = `
    <!-- Cover -->
    <div class="relative h-40 bg-slate-100 overflow-hidden">
      <img
        src="${shop.logoUrl || "https://via.placeholder.com/600"}"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
    </div>

    <!-- Content -->
    <div class="p-6 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="font-semibold text-lg text-slate-900 truncate">
            ${shop.name}
          </h3>

          <span class="inline-block mt-1 text-xs font-medium 
            bg-primary/10 text-primary 
            px-3 py-1 rounded-full">
            ${shop.category || "Shop"}
          </span>
        </div>

        <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary font-bold">
          ${shop.name?.charAt(0)?.toUpperCase() || "S"}
        </div>
      </div>

      <p class="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
        ${shop.description || "Explore products from this shop"}
      </p>

      <div class="text-xs text-slate-400 group-hover:text-primary transition">
        View shop →
      </div>
    </div>
  `;

    card.onclick = () => {
      window.location.href = `/user/Shop-Details.html?id=${docSnap.id}`;
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
