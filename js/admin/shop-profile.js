import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  doc,
  getDoc
} from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { uploadImageToCloudinary } from "../utils/cloudinary.js";
import { notifyUser } from "../utils/notificationService.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");
const form = document.getElementById("shopForm");
const saveBtn = document.getElementById("saveBtn");

const nameInput = document.getElementById("shopName");
const categoryInput = document.getElementById("shopCategory");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const pincodeInput = document.getElementById("pincode");
const descInput = document.getElementById("shopDescription");
const floorDisplay = document.getElementById("floorDisplay");

const logoInput = document.getElementById("logoInput");
const logoPreview = document.getElementById("logoPreview");

// ================= STATE =================
let shopDocRef = null;
let logoUrl = "";
let wasProfileCompleted = false;

// ================= IMAGE PREVIEW =================
logoInput.addEventListener("change", () => {
  const file = logoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => (logoPreview.src = reader.result);
  reader.readAsDataURL(file);
});

// ================= LOAD EXISTING SHOP =================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const q = query(
    collection(db, "shops"),
    where("ownerId", "==", user.uid)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    alert("Shop not initialized. Please contact support.");
    return;
  }

  const docSnap = snap.docs[0];
  shopDocRef = docSnap.ref;
  const shop = docSnap.data();

  // Track previous profile state
  wasProfileCompleted = !!shop.profileCompleted;

  nameInput.value = shop.name || "";
  categoryInput.value = shop.category || "";
  cityInput.value = shop.location?.city || "";
  stateInput.value = shop.location?.state || "";
  pincodeInput.value = shop.location?.pincode || "";
  descInput.value = shop.description || "";

  if (shop.logoUrl) {
    logoUrl = shop.logoUrl;
    logoPreview.src = shop.logoUrl;
  }

  // Load floor (read-only)
  if (shop.floorId) {
    const floorSnap = await getDoc(doc(db, "floors", shop.floorId));
    if (floorSnap.exists()) {
      const f = floorSnap.data();
      floorDisplay.value = `${f.name} (Level ${f.level})`;
    }
  }

  loader.classList.add("hidden");
});

// ================= SUBMIT =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    if (logoInput.files[0]) {
      logoUrl = await uploadImageToCloudinary(logoInput.files[0], "shops");
    }

    const payload = {
      name: nameInput.value.trim(),
      category: categoryInput.value,
      description: descInput.value.trim(),
      logoUrl,
      location: {
        city: cityInput.value.trim(),
        state: stateInput.value.trim(),
        pincode: pincodeInput.value.trim(),
      },
      profileCompleted: true,
      updatedAt: serverTimestamp(),
    };

    if (!payload.name || !payload.category || !payload.location.city) {
      alert("Please complete all required fields");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save & Continue";
      return;
    }

    await updateDoc(shopDocRef, payload);

    // 🔔 Notify only on first-time profile completion
    if (!wasProfileCompleted) {
      await notifyUser(auth.currentUser.uid, {
        type: "SHOP_PROFILE_COMPLETED",
        title: "Shop Profile Completed",
        message: "Your shop profile is now complete and visible to users.",
        link: "/admin/Admin-Dashboard.html",
      });
    }

    window.location.href = "/admin/Admin-Dashboard.html";

  } catch (err) {
    console.error(err);
    alert("Failed to save shop profile");
    saveBtn.disabled = false;
    saveBtn.textContent = "Save & Continue";
  }
});
