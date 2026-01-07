import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM
const loader = document.getElementById("pageLoader");
const form = document.getElementById("shopForm");

const nameInput = document.getElementById("shopName");
const categoryInput = document.getElementById("category");
const floorInput = document.getElementById("floor");
const descInput = document.getElementById("description");

let shopRef = null;

// INIT
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const q = query(
    collection(db, "shops"),
    where("ownerId", "==", user.uid)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    alert("Shop not found.");
    return;
  }

  const shopDoc = snap.docs[0];
  shopRef = shopDoc.ref;
  const shop = shopDoc.data();

  // Fill fields
  nameInput.value = shop.name || "";
  categoryInput.value = shop.category || "";
  floorInput.value = shop.floor || "";
  descInput.value = shop.description || "";

  loader.classList.add("hidden");
});

// SAVE
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!shopRef) return;

  await updateDoc(shopRef, {
    name: nameInput.value.trim(),
    category: categoryInput.value.trim(),
    floor: floorInput.value.trim(),
    description: descInput.value.trim(),
    updatedAt: serverTimestamp(),
  });

  alert("Shop profile updated successfully");
});
