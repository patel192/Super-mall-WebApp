// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");

const shopLogo = document.getElementById("shopLogo");
const shopName = document.getElementById("shopName");
const shopMeta = document.getElementById("shopMeta");
const shopDesc = document.getElementById("shopDesc");

const productsGrid = document.getElementById("productsGrid");

// ================= PARAM =================
const params = new URLSearchParams(window.location.search);
const shopId = params.get("id");

if (!shopId) {
  productsGrid.innerHTML = `
    <div class="col-span-full text-center text-slate-400 py-10">
      Invalid shop
    </div>`;
  loader.classList.add("hidden");
  throw new Error("Missing shopId");
}

// ================= LOAD SHOP =================
async function loadShop() {
  const snap = await getDoc(doc(db, "shops", shopId));

  if (!snap.exists()) {
    shopName.textContent = "Shop not found";
    return;
  }

  const shop = snap.data();

  shopName.textContent = shop.name;
  shopDesc.textContent = shop.description || "Explore products from this shop";

  if (shop.logoUrl) {
    shopLogo.src = shop.logoUrl;
  }

  let floorText = "";
  if (shop.floorId) {
    const floorSnap = await getDoc(doc(db, "floors", shop.floorId));
    if (floorSnap.exists()) {
      const f = floorSnap.data();
      floorText = ` • ${f.name}`;
    }
  }

  shopMeta.textContent = `${shop.category || "Shop"}${floorText}`;
}

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  productsGrid.innerHTML = "";

  const snap = await getDocs(
    query(collection(db, "products"), where("shopId", "==", shopId))
  );

  if (snap.empty) {
    productsGrid.innerHTML = `
      <div class="col-span-full text-center text-slate-400 py-10">
        No products available
      </div>`;
    return;
  }

  for (const docSnap of snap.docs) {
    const p = docSnap.data();

    // Check active offer for this product
    let offerBadge = "";
    const offerSnap = await getDocs(
      query(
        collection(db, "offers"),
        where("productId", "==", docSnap.id),
        where("status", "==", "active")
      )
    );

    if (!offerSnap.empty) {
      const o = offerSnap.docs[0].data();
      offerBadge = `
        <span class="absolute top-3 left-3 px-2 py-1 rounded-lg
                     bg-red-600 text-white text-xs font-medium">
          ${
            o.discountType === "percentage"
              ? o.discountValue + "% OFF"
              : "₹" + o.discountValue + " OFF"
          }
        </span>`;
    }

    const card = document.createElement("div");
    card.className = `
  group bg-white 
  border border-slate-200
  rounded-3xl overflow-hidden
  shadow-sm hover:shadow-xl
  hover:-translate-y-1
  transition-all duration-300
  cursor-pointer
`;

    card.innerHTML = `
  <div class="relative h-52 bg-slate-100 overflow-hidden">
    ${offerBadge}

    <img
      src="${p.imageUrl || "https://via.placeholder.com/600"}"
      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    />

    <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
  </div>

  <div class="p-6 space-y-3">
    <h3 class="font-semibold text-lg text-slate-900 truncate">
      ${p.name}
    </h3>

    <div class="flex items-center justify-between">
      <span class="text-lg font-bold text-primary">
        ₹${p.price}
      </span>

      <span class="text-xs text-slate-400 group-hover:text-primary transition">
        View →
      </span>
    </div>
  </div>
`;

    card.onclick = () => {
      window.location.href = `/user/Product-Details.html?id=${docSnap.id}`;
    };

    productsGrid.appendChild(card);
  }
}

// ================= INIT =================
(async function init() {
  try {
    await loadShop();
    await loadProducts();
  } catch (err) {
    console.error("Failed to load shop details:", err);
  } finally {
    loader.classList.add("hidden");
  }
})();
