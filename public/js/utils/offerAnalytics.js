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

// ================= TRACK OFFER VIEW =================
export async function trackOfferView(offerId, ownerId) {
  try {
    const viewedKey = `offer_viewed_${offerId}`;
    if (sessionStorage.getItem(viewedKey)) return;
    sessionStorage.setItem(viewedKey, "1");

    const offerRef = doc(db, "offers", offerId);
    const offerSnap = await getDoc(offerRef);
    if (!offerSnap.exists()) return;

    const offer = offerSnap.data();
    const isFirstView =
      (offer.views || 0) === 0 && !offer.firstViewNotified;

    // 1️⃣ Increment total views
    await updateDoc(offerRef, {
      views: increment(1),
    });

    // 🔔 FIRST VIEW NOTIFICATION (ONCE, GLOBAL)
    if (isFirstView && ownerId) {
      await addDoc(collection(db, "notifications"), {
        type: "OFFER_FIRST_VIEW",
        title: "Offer Viewed 👀",
        message: `Your offer "${offer.title}" received its first view.`,
        targetRole: "admin",
        targetUid: ownerId,
        link: "/admin/Offers.html",
        read: false,
        createdAt: serverTimestamp(),
      });

      // Lock notification forever
      await updateDoc(offerRef, {
        firstViewNotified: true,
      });
    }

    // 2️⃣ Daily stats
    const today = getTodayKey();
    const statsRef = doc(db, "offer_stats", `${offerId}_${today}`);
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      await updateDoc(statsRef, {
        views: increment(1),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(statsRef, {
        offerId,
        ownerId,
        date: today,
        views: 1,
        clicks: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

  } catch (err) {
    console.error("Offer view tracking failed:", err);
  }
}

// ================= TRACK OFFER CLICK =================
export async function trackOfferClick(offerId, ownerId) {
  try {
    const clickedKey = `offer_clicked_${offerId}`;
    if (sessionStorage.getItem(clickedKey)) return;
    sessionStorage.setItem(clickedKey, "1");

    const offerRef = doc(db, "offers", offerId);
    const offerSnap = await getDoc(offerRef);
    if (!offerSnap.exists()) return;

    const offer = offerSnap.data();
    const isFirstClick =
      (offer.clicks || 0) === 0 && !offer.firstClickNotified;

    // 1️⃣ Increment total clicks
    await updateDoc(offerRef, {
      clicks: increment(1),
    });

    // 🔔 FIRST CLICK NOTIFICATION (ONCE, GLOBAL)
    if (isFirstClick && ownerId) {
      await addDoc(collection(db, "notifications"), {
        type: "OFFER_FIRST_CLICK",
        title: "Offer Clicked 🎯",
        message: `Your offer "${offer.title}" received its first click.`,
        targetRole: "admin",
        targetUid: ownerId,
        link: "/admin/Offers.html",
        read: false,
        createdAt: serverTimestamp(),
      });

      // Lock notification forever
      await updateDoc(offerRef, {
        firstClickNotified: true,
      });
    }

    // 2️⃣ Daily stats
    const today = getTodayKey();
    const statsRef = doc(db, "offer_stats", `${offerId}_${today}`);
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      await updateDoc(statsRef, {
        clicks: increment(1),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(statsRef, {
        offerId,
        ownerId,
        date: today,
        views: 0,
        clicks: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

  } catch (err) {
    console.error("Offer click tracking failed:", err);
  }
}
