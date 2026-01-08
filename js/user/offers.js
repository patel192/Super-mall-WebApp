// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const offersGrid = document.getElementById("offersGrid");

// ================= LOAD OFFERS =================
async function loadOffers() {
  offersGrid.innerHTML = "";

  const now = Date.now();

  const snap = await getDocs(
    query(
      collection(db, "offers"),
      where("status", "==", "active" ,"or","active")
    )
  );

  if (snap.empty) {
    offersGrid.innerHTML = `
      <div class="col-span-full text-center text-slate-400">
        No active offers available right now
      </div>
    `;
    return;
  }

  for (const docSnap of snap.docs) {
    const offer = docSnap.data();

    // ⏱️ Double safety (status + time)
    if (
      !offer.startDate ||
      !offer.endDate ||
      now < offer.startDate.toMillis() ||
      now > offer.endDate.toMillis()
    ) {
      continue;
    }

    // Fetch shop name
    let shopName = "Shop";
    if (offer.ownerId) {
      const shopSnap = await getDocs(
        query(
          collection(db, "shops"),
          where("ownerId", "==", offer.ownerId)
        )
      );

      if (!shopSnap.empty) {
        shopName = shopSnap.docs[0].data().name;
      }
    }

    const discountText =
      offer.discountType === "percentage"
        ? `${offer.discountValue}% OFF`
        : `₹${offer.discountValue} OFF`;

    const card = document.createElement("a");
    card.href = `/user/offer-details.html?id=${docSnap.id}`;
    card.className =
      "bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition group";

    card.innerHTML = `
      <div class="relative">
        <img src="${offer.thumbnailUrl}"
             class="w-full h-44 object-cover"/>

        <span class="absolute top-3 left-3
          px-3 py-1 rounded-full text-xs font-medium
          bg-green-100 text-green-700">
          ${discountText}
        </span>
      </div>

      <div class="p-4 space-y-1">
        <h3 class="font-medium text-slate-900 group-hover:text-primary transition">
          ${offer.title}
        </h3>

        <p class="text-sm text-slate-500">
          ${shopName}
        </p>

        <p class="text-xs text-slate-400">
          Valid till ${offer.endDate.toDate().toLocaleDateString()}
        </p>
      </div>
    `;

    offersGrid.appendChild(card);
  }
}

loadOffers();
