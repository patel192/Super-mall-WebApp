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
  "Other",
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
      "group bg-white border rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl";

    card.innerHTML = `
  <div class="flex items-start justify-between gap-6">

    <div class="space-y-2">
      <h3 class="text-xl font-semibold text-dark group-hover:text-primary transition">
        ${category}
      </h3>

      <p class="text-sm text-slate-500">
        ${shopsSnap.size} shop${shopsSnap.size !== 1 ? "s" : ""}
      </p>
    </div>

    <div class="w-14 h-14 rounded-2xl
                bg-gradient-to-tr from-primary to-violet-500
                text-white flex items-center justify-center
                shadow-md group-hover:scale-105 transition">
      <i class="fa-solid fa-layer-group text-lg"></i>
    </div>
  </div>

  <p class="text-xs text-slate-500 mt-6 leading-relaxed">
    Explore top ${category.toLowerCase()} stores and discover offers curated for you.
  </p>

  <div class="mt-6 flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition">
    Browse category
    <i class="fa-solid fa-arrow-right text-xs"></i>
  </div>
`;

    card.onclick = () => {
      window.location.href = `/user/Shops.html?category=${encodeURIComponent(
        category
      )}`;
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
