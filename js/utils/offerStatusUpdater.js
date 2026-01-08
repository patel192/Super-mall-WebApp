// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= CONFIG =================
const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

// ================= CORE LOGIC =================
async function updateOfferStatuses() {
  try {
    const now = Timestamp.now();

    // 1️⃣ Activate scheduled offers
    const toActivate = await getDocs(query(
      collection(db, "offers"),
      where("status", "==", "scheduled"),
      where("startDate", "<=", now)
    ));

    for (const snap of toActivate.docs) {
      await updateDoc(doc(db, "offers", snap.id), {
        status: "active",
        updatedAt: Timestamp.now()
      });
    }

    // 2️⃣ Expire active offers
    const toExpire = await getDocs(query(
      collection(db, "offers"),
      where("status", "==", "active"),
      where("endDate", "<", now)
    ));

    for (const snap of toExpire.docs) {
      await updateDoc(doc(db, "offers", snap.id), {
        status: "expired",
        updatedAt: Timestamp.now()
      });
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
