// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  trackOfferView,
  trackOfferClick
} from "../utils/offerAnalytics.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");

const imageEl = document.getElementById("offerImage");
const titleEl = document.getElementById("offerTitle");
const discountEl = document.getElementById("offerDiscount");
const descEl = document.getElementById("offerDesc");

const startEl = document.getElementById("offerStart");
const endEl = document.getElementById("offerEnd");
const countdownEl = document.getElementById("offerCountdown");
const statusBanner = document.getElementById("statusBanner");

const shopInfo = document.getElementById("shopInfo");
const productBtn = document.getElementById("productBtn");

// ================= PARAM =================
const params = new URLSearchParams(window.location.search);
const offerId = params.get("id");

if (!offerId) {
  window.location.href = "/public/user/Offers.html";
}

// ================= HELPERS =================
function formatDate(ts) {
  return ts.toDate().toLocaleString();
}

function startCountdown(endMs) {
  function tick() {
    const diff = endMs - Date.now();

    if (diff <= 0) {
      countdownEl.textContent = "Offer expired";
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    countdownEl.textContent =
      `Ends in ${h}h ${m}m ${s}s`;
  }

  tick();
  setInterval(tick, 1000);
}

// ================= LOAD OFFER =================
async function loadOffer() {
  try {
    const offerSnap = await getDoc(doc(db, "offers", offerId));

    if (!offerSnap.exists()) {
      alert("Offer not found");
      window.location.href = "/public/user/Offers.html";
      return;
    }

    const offer = offerSnap.data();
    const now = Date.now();

    // STATUS
    let status = offer.status;
    if (status === "active" && offer.endDate.toMillis() < now) {
      status = "expired";
    }

    // STATUS BANNER
    if (status !== "active") {
      statusBanner.classList.remove("hidden");

      if (status === "paused") {
        statusBanner.textContent = "This offer is currently paused";
        statusBanner.className =
          "mb-6 px-4 py-3 rounded-xl bg-orange-100 text-orange-700 text-sm font-medium";
      } else if (status === "expired") {
        statusBanner.textContent = "This offer has expired";
        statusBanner.className =
          "mb-6 px-4 py-3 rounded-xl bg-slate-200 text-slate-600 text-sm font-medium";
      } else {
        statusBanner.textContent = "This offer is not available";
        statusBanner.className =
          "mb-6 px-4 py-3 rounded-xl bg-red-100 text-red-700 text-sm font-medium";
      }
    }

    // UI
    imageEl.src = offer.thumbnailUrl;
    titleEl.textContent = offer.title;

    discountEl.textContent =
      offer.discountType === "percentage"
        ? `${offer.discountValue}% OFF`
        : `₹${offer.discountValue} OFF`;

    startEl.textContent = formatDate(offer.startDate);
    endEl.textContent = formatDate(offer.endDate);

    descEl.textContent =
      offer.description || "Special offer available for this product.";

    // COUNTDOWN
    if (status === "active") {
      startCountdown(offer.endDate.toMillis());
    } else {
      countdownEl.textContent = "Not active";
    }

    // SHOP INFO
    if (offer.ownerId) {
      const shopSnap = await getDoc(
        doc(db, "shops", offer.ownerId)
      );

      if (shopSnap.exists()) {
        shopInfo.textContent =
          `Sold by ${shopSnap.data().name}`;
      }
    }

    // ANALYTICS (safe)
    try {
      await trackOfferView(offerId, offer.productId);
    } catch {}

    // CTA
    productBtn.onclick = async () => {
      try {
        await trackOfferClick(offerId, offer.productId);
      } catch {}

      window.location.href =
        `/public/user/Product-Details.html?id=${offer.productId}`;
    };

  } catch (err) {
    console.error(err);
    alert("Failed to load offer");
  } finally {
    loader.classList.add("hidden");
  }
}

loadOffer();
