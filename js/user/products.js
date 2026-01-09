// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const grid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const loader = document.getElementById("pageLoader");

let allProducts = [];

// ================= LOAD PRODUCTS =================
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

// ================= RENDER =================
function renderProducts(products) {
  grid.innerHTML = "";

  products.forEach((p) => {
    const card = document.createElement("a");
    card.href = `/user/Product-Details.html?id=${p.id}`;
    card.className =
      "group bg-white border rounded-2xl overflow-hidden hover:shadow-md transition";

    card.innerHTML = `
      <img
        src="${p.imageUrl || "https://via.placeholder.com/300"}"
        class="w-full h-44 object-cover"/>

      <div class="p-4 space-y-2">

        <h3 class="font-medium text-dark truncate">
          ${p.name}
        </h3>

        <p class="text-xs text-slate-500 line-clamp-2">
          ${p.description || "No description"}
        </p>

        <div class="flex justify-between items-center pt-2">
          <span class="font-semibold text-primary">
            ₹${p.price}
          </span>

          <span class="text-xs text-slate-400">
            ${p.category || "General"}
          </span>
        </div>

      </div>
    `;

    grid.appendChild(card);
  });
}

// ================= SEARCH =================
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();

  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    (p.category || "").toLowerCase().includes(q)
  );

  renderProducts(filtered);
});

// ================= INIT =================
loadProducts();
