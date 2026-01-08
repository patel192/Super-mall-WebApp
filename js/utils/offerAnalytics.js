import { db } from "../firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function trackOfferView(offerId, ownerId) {
  const viewedKey = `offer_viewed_${offerId}`;
  if (sessionStorage.getItem(viewedKey)) return;
  sessionStorage.setItem(viewedKey, "1");

  const offerRef = doc(db, "offers", offerId);
  await updateDoc(offerRef, { views: increment(1) });

  const today = getTodayKey();
  const statsRef = doc(db, "offer_stats", `${offerId}_${today}`);

  await setDoc(
    statsRef,
    {
      offerId,
      ownerId,
      date: today,
      views: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function trackOfferClick(offerId, ownerId) {
  const clickedKey = `offer_clicked_${offerId}`;
  if (sessionStorage.getItem(clickedKey)) return;
  sessionStorage.setItem(clickedKey, "1");

  const offerRef = doc(db, "offers", offerId);
  await updateDoc(offerRef, { clicks: increment(1) });

  const today = getTodayKey();
  const statsRef = doc(db, "offer_stats", `${offerId}_${today}`);

  await setDoc(
    statsRef,
    {
      offerId,
      ownerId,
      date: today,
      clicks: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
