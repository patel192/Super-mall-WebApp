// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { trackOfferView, trackOfferClick } from "../utils/offerAnalytics.js";
// ================= DOM =================
const imageEl = document.getElementById("offerImage");
const titleEl = document.getElementById("offerTitle");
const badgeEl = document.getElementById("discountBadge");
const validityEl = document.getElementById("offerValidity");
const productEl = document.getElementById("productName");
const shopEl = document.getElementById("shopName");
const ctaBtn = document.getElementById("offerCta");
// ================= GET OFFER ID =================
const params = new URLSearchParams(window.location.search);
const offerId = params.get("id");

if (!offerId) {
  alert("Invalid offer");
  window.location.href = "/user/User-Dashboard.html";
}

// ================= LOAD OFFER =================
async function loadOfferDetails() {
  try {
    const offerRef = doc(db, "offers", offerId);
    const offerSnap = await getDoc(offerRef);

    if (!offerSnap.exists()) {
      alert("Offer not found");
      window.location.href = "/user/User-Dashboard.html";
      return;
    }

    const offer = offerSnap.data();

    // 🚫 Only active offers visible
    if (offer.status !== "active") {
      alert("This offer is no longer available");
      window.location.href = "/user/User-Dashboard.html";
      return;
    }
    await trackOfferView(offerId, offer.ownerId);

    // Inject UI
    imageEl.src = offer.thumbnailUrl;
    titleEl.textContent = offer.title;

    badgeEl.textContent =
      offer.discountType === "percentage"
        ? `${offer.discountValue}% OFF`
        : `₹${offer.discountValue} OFF`;

    badgeEl.className =
      "px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700";

    validityEl.textContent = `Valid till ${offer.endDate
      .toDate()
      .toLocaleDateString()}`;

    // 🔗 Fetch product
    if (offer.productId) {
      const productSnap = await getDoc(doc(db, "products", offer.productId));

      if (productSnap.exists()) {
        productEl.textContent = productSnap.data().name;
      }
    }

    // 🔗 Fetch shop
    if (offer.ownerId) {
      const shopQuery = await getDoc(doc(db, "shops", offer.ownerId));

      if (shopQuery.exists()) {
        shopEl.textContent = shopQuery.data().name;
      }
    }

    ctaBtn.onclick = async () => {
      try {
        await trackOfferClick(offerId, offer.ownerId);
      } catch (err) {
        console.error("Click tracking failed:", err);
      }
    };
  } catch (err) {
    console.error("Offer details error:", err);
    alert("Failed to load offer");
  }
}

loadOfferDetails();
