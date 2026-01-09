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

import {
  trackOfferView,
  trackOfferClick
} from "../utils/offerAnalytics.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");
const offersGrid = document.getElementById("offersGrid");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

// ================= PARAM =================
const params = new URLSearchParams(window.location.search);
const productId = params.get("product");

// ================= LOAD OFFERS =================
async function loadOffers() {
  offersGrid.innerHTML = "";

  let q;

  if (productId) {
    q = query(
      collection(db, "offers"),
      where("status", "==", "active"),
      where("productId", "==", productId)
    );

    pageTitle.textContent = "Offers for this Product";
    pageSubtitle.textContent = "Special deals available for this item";
  } else {
    q = query(
      collection(db, "offers"),
      where("status", "==", "active")
    );
  }

  const snap = await getDocs(q);

  if (snap.empty) {
    offersGrid.innerHTML = `
      <div class="col-span-full text-center text-slate-400 py-10">
        No active offers available
      </div>`;
    return;
  }

  for (const docSnap of snap.docs) {
    const offer = docSnap.data();

    // Load product info
    let productName = "Product";
    let productImage = "https://via.placeholder.com/400";

    const productSnap = await getDoc(
      doc(db, "products", offer.productId)
    );

    if (productSnap.exists()) {
      const p = productSnap.data();
      productName = p.name;
      productImage = p.imageUrl || productImage;
    }

    // Render card
    const card = document.createElement("div");
    card.className =
      "bg-white border rounded-2xl overflow-hidden hover:shadow-md transition";

    card.innerHTML = `
      <div class="relative">
        <img
          src="${offer.thumbnailUrl || productImage}"
          class="w-full h-44 object-cover"/>

        <span class="absolute top-3 left-3 px-2 py-1 rounded-lg
                     bg-red-600 text-white text-xs font-medium">
          ${
            offer.discountType === "percentage"
              ? offer.discountValue + "% OFF"
              : "₹" + offer.discountValue + " OFF"
          }
        </span>
      </div>

      <div class="p-4 space-y-2">
        <h3 class="font-semibold text-dark">
          ${offer.title}
        </h3>

        <p class="text-sm text-slate-500">
          On ${productName}
        </p>

        <button
          class="view-offer w-full mt-3 px-4 py-2 rounded-xl
                 bg-primary text-white text-sm font-medium
                 hover:bg-blue-700 transition">
          View Offer
        </button>
      </div>
    `;

    // Track view (safe)
    try {
      await trackOfferView(docSnap.id, offer.productId);
    } catch (err) {
      console.warn("Offer view tracking failed", err);
    }

    // Click
    card.querySelector(".view-offer").onclick = async () => {
      try {
        await trackOfferClick(docSnap.id, offer.productId);
      } catch (err) {
        console.warn("Offer click tracking failed", err);
      }

      window.location.href =
        `/user/Offer-Details.html?id=${docSnap.id}`;
    };

    offersGrid.appendChild(card);
  }
}

// ================= INIT =================
(async function init() {
  try {
    await loadOffers();
  } catch (err) {
    console.error("Failed to load offers:", err);
    offersGrid.innerHTML = `
      <div class="col-span-full text-center text-red-500 py-10">
        Failed to load offers
      </div>`;
  } finally {
    loader.classList.add("hidden");
  }
})();
