// ================= FIREBASE =================
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { uploadImageToCloudinary } from "../utils/cloudinary.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");
const form = document.getElementById("profileForm");

const nameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const roleInput = document.getElementById("role");

const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

// ================= STATE =================
let profileImageUrl = "";

// ================= IMAGE PREVIEW =================
avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => avatarPreview.src = reader.result;
  reader.readAsDataURL(file);
});

// ================= LOAD PROFILE =================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("User profile not found");
      return;
    }

    const u = snap.data();

    nameInput.value = u.fullName || "";
    emailInput.value = u.email || user.email;
    phoneInput.value = u.phone || "";
    roleInput.value = u.role || "user";

    if (u.profileImageUrl) {
      profileImageUrl = u.profileImageUrl;
      avatarPreview.src = u.profileImageUrl;
    }

  } catch (err) {
    console.error("Profile load failed:", err);
    alert("Failed to load profile");
  } finally {
    loader.classList.add("hidden");
  }
});

// ================= UPDATE PROFILE =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    if (avatarInput.files[0]) {
      profileImageUrl = await uploadImageToCloudinary(
        avatarInput.files[0],
        "users"
      );
    }

    await updateDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        fullName: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        profileImageUrl,
        updatedAt: serverTimestamp()
      }
    );

    alert("Profile updated successfully");

  } catch (err) {
    console.error("Profile update failed:", err);
    alert("Failed to update profile");
  }
});
