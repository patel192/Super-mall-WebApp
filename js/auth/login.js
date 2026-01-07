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
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= ROLE CONSTANTS =================
// admin = Merchant
// user  = Customer
const ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
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

// ================= ROLE REDIRECT =================
function redirectByRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      window.location.href = "/admin/Admin-Dashboard.html";
      break;

    case ROLES.USER:
      window.location.href = "/user/User-Dashboard.html";
      break;

    default:
      window.location.href = "/index.html";
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

    const userData = userSnap.data();

    if (![ROLES.ADMIN, ROLES.USER].includes(userData.role)) {
      throw new Error("Invalid user role");
    }

    await logEvent("LOGIN", "Email login successful", uid);
    redirectByRole(userData.role);
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

    // First-time Google login → create USER (customer)
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        fullName: user.displayName || "Unknown User",
        role: ROLES.USER, // Google users are always customers
        provider: "google",
        createdAt: serverTimestamp(),
      });
    }

    const finalSnap = await getDoc(userRef);
    const role = finalSnap.data().role;

    if (![ROLES.ADMIN, ROLES.USER].includes(role)) {
      throw new Error("Invalid user role");
    }

    await logEvent("GOOGLE_LOGIN", "Google login successful", user.uid);
    redirectByRole(role);
  } catch (err) {
    await logEvent("ERROR", err.message);
    alert("Google login failed");
  }
});
