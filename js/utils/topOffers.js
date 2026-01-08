import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js";

/**
 * Get top performing offers by CTR
 */
export async function getTopPerformingOffers({
  limit = 5,
  minViews = 50
} = {}) {
  const q = query(
    collection(db, "offers"),
    where("status", "==", "active")
  );

  const snap = await getDocs(q);

  const scoredOffers = [];

  snap.forEach(docSnap => {
    const o = docSnap.data();

    const views = o.views || 0;
    const clicks = o.clicks || 0;

    if (views < minViews) return;

    const ctr = (clicks / views) * 100;
    const score = ctr * Math.log10(views + 1);

    scoredOffers.push({
      id: docSnap.id,
      ...o,
      views,
      clicks,
      ctr: Number(ctr.toFixed(2)),
      score
    });
  });

  return scoredOffers
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
