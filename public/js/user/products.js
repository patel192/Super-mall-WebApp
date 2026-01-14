import { db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const grid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const loader = document.getElementById("pageLoader");

let allProducts = [];

async function loadProducts() {
  const snap = await getDocs(
    query(collection(db, "products"), where("status", "==", "active"))
  );

  if (snap.empty) {
    grid.innerHTML = `
      <div class="col-span-full text-center text-slate-400 py-20">
        No products available
      </div>
    `;
    loader.classList.add("hidden");
    return;
  }

  allProducts = snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  renderProducts(allProducts);
  loader.classList.add("hidden");
}

function renderProducts(products) {
  grid.innerHTML = "";

  products.forEach((p) => {
    const card = document.createElement("a");
    card.href = `/user/Product-Details.html?id=${p.id}`;
    card.className = `
    group bg-white dark:bg-slate-900
    border border-slate-200 dark:border-slate-800
    rounded-3xl overflow-hidden
    shadow-sm hover:shadow-2xl
    hover:-translate-y-1
    transition-all duration-300
  `;

    card.innerHTML = `
    <!-- Image -->
    <div class="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
      <img
        src="${p.imageUrl || "https://via.placeholder.com/600"}"
        loading="lazy"
        class="
          w-full h-full object-cover
          transition-transform duration-500
          group-hover:scale-[1.02]
        "
      />

      <!-- Soft gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"></div>

      <!-- Category badge -->
      <div class="absolute top-4 left-4">
        <span class="text-[11px] font-medium px-3 py-1 rounded-full
          bg-white/90 backdrop-blur
          text-slate-800 shadow">
          ${p.category || "General"}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 space-y-3">
      <h3 class="text-base font-semibold text-slate-900 dark:text-white truncate">
        ${p.name}
      </h3>

      <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[40px]">
        ${p.description || "No description available"}
      </p>

      <div class="flex items-center justify-between pt-2">
        <span class="text-xl font-bold text-primary">
          ₹${p.price}
        </span>

        <span class="text-xs text-slate-400 group-hover:text-primary transition">
          View →
        </span>
      </div>
    </div>
  `;

    grid.appendChild(card);
  });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();

  const filtered = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
  );

  renderProducts(filtered);
});

loadProducts();
