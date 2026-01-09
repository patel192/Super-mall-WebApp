// ================= FIREBASE IMPORTS =================
import { db, auth, provider } from "../firebase-config.js";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= ROLE CONSTANTS =================
const ROLES = Object.freeze({
  USER: "user",                 // Customer
  MERCHANT_PENDING: "merchant_pending",
  ADMIN: "admin",               // Shop owner
  SUPER_ADMIN: "super_admin",   // Platform owner
});

// ================= DOM REFERENCES =================
const loginBtn = document.getElementById("loginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

// ================= LOGGER =================
async function logEvent(type, message, uid = null) {
  try {
    await setDoc(doc(db, "logs", crypto.randomUUID()), {
      type,
      message,
      uid,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Logging failed:", err);
  }
}

// ================= ADMIN SHOP FETCH =================
async function fetchAdminShop(uid) {
  const q = query(
    collection(db, "shops"),
    where("ownerId", "==", uid)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("Shop not found for this admin account");
  }

  const shopDoc = snap.docs[0];

  // Cache shop context for dashboard usage
  sessionStorage.setItem(
    "adminShop",
    JSON.stringify({
      shopId: shopDoc.id,
      ...shopDoc.data(),
    })
  );
}

// ================= ROLE REDIRECT =================
async function redirectByRole(role, uid) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      window.location.href = "/public/super-admin/Dashboard.html";
      break;

    case ROLES.ADMIN:
      // 🔐 Fetch shop ONLY for admin
      await fetchAdminShop(uid);
      window.location.href = "/public/admin/Admin-Dashboard.html";
      break;

    case ROLES.USER:
    case ROLES.MERCHANT_PENDING:
      window.location.href = "/public/user/User-Dashboard.html";
      break;

    default:
      console.warn("Unknown role:", role);
      window.location.href = "/public/auth.html";
  }
}

// ================= EMAIL / PASSWORD LOGIN =================
loginBtn.addEventListener("click", async () => {
  try {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      throw new Error("Please enter email and password");
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) {
      throw new Error("User profile not found");
    }

    const { role } = userSnap.data();

    if (!Object.values(ROLES).includes(role)) {
      throw new Error("Invalid user role");
    }

    await logEvent("LOGIN", "Email login successful", uid);
    await redirectByRole(role, uid);

  } catch (err) {
    await logEvent("ERROR", err.message);
    alert(err.message || "Login failed");
  }
});

// ================= GOOGLE LOGIN =================
googleLoginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db, "users", user.uid);

    const snap = await getDoc(userRef);

    // First-time Google login → create USER
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        fullName: user.displayName || "Unknown User",
        role: ROLES.USER,
        provider: "google",
        createdAt: serverTimestamp(),
      });
    }

    const finalSnap = await getDoc(userRef);
    const role = finalSnap.data().role;

    if (!Object.values(ROLES).includes(role)) {
      throw new Error("Invalid user role");
    }

    await logEvent("GOOGLE_LOGIN", "Google login successful", user.uid);
    await redirectByRole(role, user.uid);

  } catch (err) {
    await logEvent("ERROR", err.message);
    alert("Google login failed");
  }
});
