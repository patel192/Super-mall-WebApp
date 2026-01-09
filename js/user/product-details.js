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

// ================= PARAM =================
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (!productId) {
  alert("Invalid product");
  window.location.href = "/user/Floors.html";
}

// ================= LOAD PRODUCT =================
async function loadProduct() {
  try {
    const snap = await getDoc(doc(db, "products", productId));

    if (!snap.exists()) {
      alert("Product not found");
      window.location.href = "/user/Floors.html";
      return;
    }

    const product = snap.data();

    if (product.status !== "active") {
      alert("Product not available");
      window.location.href = "/user/Floors.html";
      return;
    }

    // ================= RENDER PRODUCT =================
    imageEl.src = product.imageUrl || "https://via.placeholder.com/600";
    nameEl.textContent = product.name;
    categoryEl.textContent = product.category || "General";
    descEl.textContent =
      product.description || "No description available";
    priceEl.textContent = `₹${product.price}`;

    // ================= LOAD SHOP (CORRECT) =================
    if (product.shopId) {
      const shopSnap = await getDoc(doc(db, "shops", product.shopId));
      if (shopSnap.exists()) {
        shopEl.textContent = `Sold by ${shopSnap.data().name}`;
      }
    }

    // ================= ANALYTICS (SAFE) =================
    try {
      await trackProductView(productId, product.shopId);
    } catch (err) {
      console.warn("Product view tracking failed", err);
    }

    ctaBtn.onclick = async () => {
      try {
        await trackProductClick(productId, product.shopId);
      } catch (err) {
        console.warn("Product click tracking failed", err);
      }

      window.location.href =
        `/user/Offers.html?product=${productId}`;
    };

  } catch (err) {
    console.error("Product details error:", err);
    alert("Failed to load product");
  } finally {
    loader.classList.add("hidden");
  }
}

loadProduct();
