// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  trackProductView,
  trackProductClick
} from "../utils/productAnalytics.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");

const imageEl = document.getElementById("productImage");
const nameEl = document.getElementById("productName");
const categoryEl = document.getElementById("productCategory");
const descEl = document.getElementById("productDesc");
const priceEl = document.getElementById("productPrice");
const shopEl = document.getElementById("shopName");
const ctaBtn = document.getElementById("productCta");

// Stats
const statViews = document.getElementById("statViews");
const statClicks = document.getElementById("statClicks");
const statCTR = document.getElementById("statCTR");

// ================= PARAM =================
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (!productId) {
  window.location.href = "/user/Floors.html";
  throw new Error("Missing productId");
}

// ================= LOAD STATS =================
async function loadStats() {
  let views = 0;
  let clicks = 0;

  const snap = await getDocs(
    query(
      collection(db, "product_stats"),
      where("productId", "==", productId)
    )
  );

  snap.forEach((doc) => {
    const d = doc.data();
    views += d.views || 0;
    clicks += d.clicks || 0;
  });

  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : "0.00";

  statViews.textContent = views;
  statClicks.textContent = clicks;
  statCTR.textContent = `${ctr}%`;
}

// ================= LOAD PRODUCT =================
async function loadProduct() {
  try {
    const productSnap = await getDoc(doc(db, "products", productId));

    if (!productSnap.exists()) {
      alert("Product not found");
      window.location.href = "/user/Floors.html";
      return;
    }

    const product = productSnap.data();

    imageEl.src = product.imageUrl || "https://via.placeholder.com/600";
    nameEl.textContent = product.name;
    categoryEl.textContent = product.category || "General";
    descEl.textContent = product.description || "No description available";
    priceEl.textContent = `₹${product.price}`;

    let shopId = null;
    if (product.shopId) {
      shopId = product.shopId;
      const shopSnap = await getDoc(doc(db, "shops", shopId));
      if (shopSnap.exists()) {
        shopEl.textContent = `Sold by ${shopSnap.data().name}`;
      }
    }

    // Track view
    await trackProductView(productId, shopId);

    ctaBtn.onclick = async () => {
      await trackProductClick(productId, shopId);
      window.location.href = `/user/Offers.html?product=${productId}`;
    };

    await loadStats();

  } catch (err) {
    console.error(err);
    alert("Failed to load product");
  } finally {
    loader.classList.add("hidden");
  }
}

// ================= INIT =================
loadProduct();
