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
      const offer = snap.data();

      await updateDoc(doc(db, "offers", snap.id), {
        status: "active",
        updatedAt: Timestamp.now(),
      });

      // 🔔 Notify admin (offer live)
      if (!offer._liveNotified) {
        await notifyUser(offer.ownerId, {
          type: "OFFER_LIVE",
          title: "Offer is Live",
          message: `Your offer "${offer.title}" is now live.`,
          link: "/admin/Offers.html",
        });

        // Mark as notified to avoid duplicates
        await updateDoc(doc(db, "offers", snap.id), {
          _liveNotified: true,
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
      const offer = snap.data();

      await updateDoc(doc(db, "offers", snap.id), {
        status: "expired",
        updatedAt: Timestamp.now(),
      });

      // 🔔 Notify admin (offer expired)
      if (!offer._expiredNotified) {
        await notifyUser(offer.ownerId, {
          type: "OFFER_EXPIRED",
          title: "Offer Expired",
          message: `Your offer "${offer.title}" has expired.`,
          link: "/admin/Offers.html",
        });

        // Mark as notified to avoid duplicates
        await updateDoc(doc(db, "offers", snap.id), {
          _expiredNotified: true,
        });
      }
    }
  } catch (err) {
    console.error("Offer auto-status updater failed:", err);
  }
}

// ================= PUBLIC API =================
export function startOfferStatusUpdater() {
  // Run once immediately
  updateOfferStatuses();

  // Run periodically
  setInterval(updateOfferStatuses, CHECK_INTERVAL_MS);
}
