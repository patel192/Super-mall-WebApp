// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= HELPERS =================
function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// ================= TRACK PRODUCT VIEW =================
export async function trackProductView(productId, ownerId) {
  try {
    const sessionKey = `product_viewed_${productId}`;
    if (sessionStorage.getItem(sessionKey)) return;

    sessionStorage.setItem(sessionKey, "1");

    // 1️⃣ Increment total views
    await updateDoc(doc(db, "products", productId), {
      views: increment(1),
    });

    // 2️⃣ Daily stats
    const today = getTodayKey();
    const statsRef = doc(db, "product_stats", `${productId}_${today}`);
    const snap = await getDoc(statsRef);

    if (snap.exists()) {
      await updateDoc(statsRef, {
        views: increment(1),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(statsRef, {
        productId,
        ownerId,
        date: today,
        views: 1,
        clicks: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("Product view tracking failed:", err);
  }
}

// ================= TRACK PRODUCT CLICK =================
export async function trackProductClick(productId, ownerId) {
  try {
    const sessionKey = `product_clicked_${productId}`;
    if (sessionStorage.getItem(sessionKey)) return;

    sessionStorage.setItem(sessionKey, "1");

    // 1️⃣ Increment total clicks
    await updateDoc(doc(db, "products", productId), {
      clicks: increment(1),
    });

    // 2️⃣ Daily stats
    const today = getTodayKey();
    const statsRef = doc(db, "product_stats", `${productId}_${today}`);
    const snap = await getDoc(statsRef);

    if (snap.exists()) {
      await updateDoc(statsRef, {
        clicks: increment(1),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(statsRef, {
        productId,
        ownerId,
        date: today,
        views: 0,
        clicks: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("Product click tracking failed:", err);
  }
}
