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
    card.className =
      "bg-white border rounded-2xl p-6 hover:shadow-md transition cursor-pointer";

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold text-dark">
            ${floor.name}
          </h3>
          <p class="text-sm text-slate-500 mt-1">
            ${shopsSnap.size} shop${shopsSnap.size !== 1 ? "s" : ""}
          </p>
        </div>

        <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary
                    flex items-center justify-center">
          <i class="fa-solid fa-layer-group"></i>
        </div>
      </div>

      <p class="text-xs text-slate-500 mt-4">
        ${floor.description || "Explore shops on this floor"}
      </p>
    `;

    card.onclick = () => {
      window.location.href = `/public/user/Shops.html?floor=${docSnap.id}`;
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
