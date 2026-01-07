// ================= FIREBASE =================
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");
const form = document.getElementById("shopForm");

const nameInput = document.getElementById("shopName");
const categoryInput = document.getElementById("shopCategory");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const pincodeInput = document.getElementById("pincode");
const descInput = document.getElementById("shopDescription");

let shopDocRef = null;

// ================= INIT =================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const q = query(
    collection(db, "shops"),
    where("ownerId", "==", user.uid)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    shopDocRef = snap.docs[0].ref;
    const shop = snap.docs[0].data();

    nameInput.value = shop.name || "";
    categoryInput.value = shop.category || "";
    cityInput.value = shop.location?.city || "";
    stateInput.value = shop.location?.state || "";
    pincodeInput.value = shop.location?.pincode || "";
    descInput.value = shop.description || "";
  }

  loader.classList.add("hidden");
});

// ================= SUBMIT =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    category: categoryInput.value,
    description: descInput.value.trim(),
    location: {
      city: cityInput.value.trim(),
      state: stateInput.value.trim(),
      pincode: pincodeInput.value.trim(),
    },
    status: "active",
    updatedAt: serverTimestamp(),
  };

  if (!payload.name || !payload.category || !payload.location.city) {
    alert("Please complete all required fields");
    return;
  }

  try {
    if (shopDocRef) {
      await updateDoc(shopDocRef, payload);
    } else {
      await addDoc(collection(db, "shops"), {
        ...payload,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
    }

    window.location.href = "/admin/Admin-Dashboard.html";
  } catch (err) {
    console.error(err);
    alert("Failed to save shop profile");
  }
});
