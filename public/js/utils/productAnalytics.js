// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc
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

    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) return;

    const product = productSnap.data();
    const isFirstView =
      (product.views || 0) === 0 && !product.firstViewNotified;

    // 1️⃣ Increment total views
    await updateDoc(productRef, {
      views: increment(1),
    });

    // 🔔 FIRST VIEW NOTIFICATION (GLOBAL, ONCE)
    if (isFirstView && ownerId) {
      await addDoc(collection(db, "notifications"), {
        type: "PRODUCT_FIRST_VIEW",
        title: "Product Viewed 🎉",
        message: `Your product "${product.name}" received its first view.`,
        targetRole: "admin",
        targetUid: ownerId,
        link: "/public/admin/Products.html",
        read: false,
        createdAt: serverTimestamp(),
      });

      // lock it forever
      await updateDoc(productRef, {
        firstViewNotified: true,
      });
    }

    // 2️⃣ Daily stats
    const today = getTodayKey();
    const statsRef = doc(db, "product_stats", `${productId}_${today}`);
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
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

    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) return;

    const product = productSnap.data();
    const isFirstClick =
      (product.clicks || 0) === 0 && !product.firstClickNotified;

    // 1️⃣ Increment total clicks
    await updateDoc(productRef, {
      clicks: increment(1),
    });

    // 🔔 FIRST CLICK NOTIFICATION (GLOBAL, ONCE)
    if (isFirstClick && ownerId) {
      await addDoc(collection(db, "notifications"), {
        type: "PRODUCT_FIRST_CLICK",
        title: "Product Clicked 🎯",
        message: `Your product "${product.name}" received its first click.`,
        targetRole: "admin",
        targetUid: ownerId,
        link: "/public/admin/Products.html",
        read: false,
        createdAt: serverTimestamp(),
      });

      // lock it forever
      await updateDoc(productRef, {
        firstClickNotified: true,
      });
    }

    // 2️⃣ Daily stats
    const today = getTodayKey();
    const statsRef = doc(db, "product_stats", `${productId}_${today}`);
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
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
