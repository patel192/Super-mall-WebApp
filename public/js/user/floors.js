// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");
const floorsGrid = document.getElementById("floorsGrid");

// ================= LOAD FLOORS =================
async function loadFloors() {
  floorsGrid.innerHTML = "";

  const floorsSnap = await getDocs(collection(db, "floors"));

  if (floorsSnap.empty) {
    floorsGrid.innerHTML = `
      <div class="col-span-full text-center text-slate-400 py-10">
        No floors available
      </div>`;
    return;
  }

  for (const docSnap of floorsSnap.docs) {
    const floor = docSnap.data();

    // Count active shops on this floor
    const shopsSnap = await getDocs(
      query(
        collection(db, "shops"),
        where("floorId", "==", docSnap.id),
        where("status", "==", "active")
      )
    );

    const card = document.createElement("div");
    card.className = `
  group bg-white 
  border border-slate-200 
  rounded-3xl 
  p-8
  shadow-sm
  hover:shadow-xl 
  hover:-translate-y-1 
  transition-all duration-300
  cursor-pointer
`;

    card.innerHTML = `
  <div class="flex items-start justify-between">
    <div class="space-y-2">
      <h3 class="text-xl font-semibold text-slate-900">
        ${floor.name}
      </h3>

      <p class="text-sm text-slate-500">
        ${shopsSnap.size} shop${shopsSnap.size !== 1 ? "s" : ""}
      </p>
    </div>

    <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary
                flex items-center justify-center text-lg
                group-hover:bg-primary group-hover:text-white transition">
      <i class="fa-solid fa-layer-group"></i>
    </div>
  </div>

  <p class="text-sm text-slate-500 mt-6 leading-relaxed">
    ${floor.description || "Explore shops available on this floor"}
  </p>

  <div class="mt-6 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition">
    View shops →
  </div>
`;

    card.onclick = () => {
      window.location.href = `/user/Shops.html?floor=${docSnap.id}`;
    };

    floorsGrid.appendChild(card);
  }
}

// ================= INIT =================
(async function init() {
  try {
    await loadFloors();
  } catch (err) {
    console.error("Failed to load floors:", err);
    floorsGrid.innerHTML = `
      <div class="col-span-full text-center text-red-500 py-10">
        Failed to load floors
      </div>`;
  } finally {
    loader.classList.add("hidden");
  }
})();
