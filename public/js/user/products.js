import { db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs
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
    ...docSnap.data()
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
      group bg-white dark:bg-slate-800 
      border dark:border-slate-700 
      rounded-3xl overflow-hidden 
      hover:-translate-y-1 hover:shadow-xl 
      transition-all duration-300
    `;

    card.innerHTML = `
      <div class="relative overflow-hidden">
        <img
          src="${p.imageUrl || "https://via.placeholder.com/400"}"
          class="w-full h-52 object-cover group-hover:scale-105 transition duration-500"/>

        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
      </div>

      <div class="p-5 space-y-3">
        <h3 class="font-semibold text-dark dark:text-white truncate">
          ${p.name}
        </h3>

        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          ${p.description || "No description available"}
        </p>

        <div class="flex justify-between items-center pt-2">
          <span class="text-lg font-bold text-primary">
            ₹${p.price}
          </span>

          <span class="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
            ${p.category || "General"}
          </span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();

  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    (p.category || "").toLowerCase().includes(q)
  );

  renderProducts(filtered);
});

loadProducts();
