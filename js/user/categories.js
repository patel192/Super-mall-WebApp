// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");
const categoriesGrid = document.getElementById("categoriesGrid");

// ================= STATIC CATEGORY LIST =================
// (simple, intentional, no CRUD needed)
const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Food & Beverages",
  "Groceries",
  "Beauty",
  "Services",
  "Other"
];

// ================= LOAD CATEGORIES =================
async function loadCategories() {
  categoriesGrid.innerHTML = "";

  for (const category of CATEGORIES) {
    const shopsSnap = await getDocs(
      query(
        collection(db, "shops"),
        where("category", "==", category),
        where("status", "==", "active")
      )
    );

    if (shopsSnap.empty) continue;

    const card = document.createElement("div");
    card.className =
      "bg-white border rounded-2xl p-6 hover:shadow-md transition cursor-pointer";

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold text-dark">
            ${category}
          </h3>
          <p class="text-sm text-slate-500 mt-1">
            ${shopsSnap.size} shop${shopsSnap.size !== 1 ? "s" : ""}
          </p>
        </div>

        <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary
                    flex items-center justify-center">
          <i class="fa-solid fa-tags"></i>
        </div>
      </div>

      <p class="text-xs text-slate-500 mt-4">
        Explore ${category.toLowerCase()} shops
      </p>
    `;

    card.onclick = () => {
      window.location.href =
        `/user/Shops.html?category=${encodeURIComponent(category)}`;
    };

    categoriesGrid.appendChild(card);
  }

  if (!categoriesGrid.children.length) {
    categoriesGrid.innerHTML = `
      <div class="col-span-full text-center text-slate-400 py-10">
        No categories available
      </div>`;
  }
}

// ================= INIT =================
(async function init() {
  try {
    await loadCategories();
  } catch (err) {
    console.error("Failed to load categories:", err);
    categoriesGrid.innerHTML = `
      <div class="col-span-full text-center text-red-500 py-10">
        Failed to load categories
      </div>`;
  } finally {
    loader.classList.add("hidden");
  }
})();
