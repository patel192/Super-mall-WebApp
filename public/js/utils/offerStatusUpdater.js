// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { notifyUser } from "./notificationService.js";

// ================= CONFIG =================
const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

// ================= CORE LOGIC =================
async function updateOfferStatuses() {
  try {
    const now = Timestamp.now();

    // ================= ACTIVATE SCHEDULED OFFERS =================
    const toActivate = await getDocs(
      query(
        collection(db, "offers"),
        where("status", "==", "scheduled"),
        where("startDate", "<=", now)
      )
    );

    for (const snap of toActivate.docs) {
      const offerRef = doc(db, "offers", snap.id);
      const offer = snap.data();

      await updateDoc(offerRef, {
        status: "active",
        updatedAt: Timestamp.now(),
      });

      // 🔔 OFFER LIVE NOTIFICATION (ONCE)
      if (!offer.liveNotified && offer.ownerId) {
        await notifyUser(offer.ownerId, {
          type: "OFFER_LIVE",
          title: "Offer is Live 🎉",
          message: `Your offer "${offer.title}" is now live.`,
          link: "/public/admin/Offers.html",
          targetRole: "admin",
        });

        await updateDoc(offerRef, {
          liveNotified: true,
        });
      }
    }

    // ================= EXPIRE ACTIVE OFFERS =================
    const toExpire = await getDocs(
      query(
        collection(db, "offers"),
        where("status", "==", "active"),
        where("endDate", "<", now)
      )
    );

    for (const snap of toExpire.docs) {
      const offerRef = doc(db, "offers", snap.id);
      const offer = snap.data();

      await updateDoc(offerRef, {
        status: "expired",
        updatedAt: Timestamp.now(),
      });

      // 🔔 OFFER EXPIRED NOTIFICATION (ONCE)
      if (!offer.expiredNotified && offer.ownerId) {
        await notifyUser(offer.ownerId, {
          type: "OFFER_EXPIRED",
          title: "Offer Expired ⏰",
          message: `Your offer "${offer.title}" has expired.`,
          link: "/public/admin/Offers.html",
          targetRole: "admin",
        });

        await updateDoc(offerRef, {
          expiredNotified: true,
        });
      }
    }
  } catch (err) {
    console.error("Offer auto-status updater failed:", err);
  }
}

// ================= PUBLIC API =================
export function startOfferStatusUpdater() {
  // Run immediately
  updateOfferStatuses();

  // Run periodically
  setInterval(updateOfferStatuses, CHECK_INTERVAL_MS);
}
