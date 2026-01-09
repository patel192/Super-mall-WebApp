// ================= FIREBASE IMPORTS =================
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= ROLE CONSTANTS =================
const ROLES = Object.freeze({
  USER: "user",                     // Customer
  MERCHANT_PENDING: "merchant_pending",
  ADMIN: "admin",                   // Shop owner
  SUPER_ADMIN: "super_admin",       // Platform owner
});

// ================= CONFIG =================
const requiredRole = document.body.dataset.requiredRole;

// ================= REDIRECT HELPERS =================
function redirectByRole(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      window.location.href = "/super-admin/Dashboard.html";
      break;

    case ROLES.ADMIN:
      window.location.href = "/admin/Admin-Dashboard.html";
      break;

    case ROLES.USER:
    case ROLES.MERCHANT_PENDING:
      window.location.href = "/user/User-Dashboard.html";
      break;

    default:
      window.location.href = "/auth.html?mode=login";
  }
}

// ================= AUTH GUARD =================
onAuthStateChanged(auth, async (user) => {
  try {
    // 1️⃣ Not logged in
    if (!user) {
      window.location.href = "/auth.html?mode=login";
      return;
    }

    // 2️⃣ Fetch profile
    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) {
      await signOut(auth);
      window.location.href = "/auth.html?mode=login";
      return;
    }

    const { role } = snap.data();

    // 3️⃣ Validate role
    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role)) {
      console.error("Invalid role:", role);
      await signOut(auth);
      window.location.href = "/auth.html?mode=login";
      return;
    }

    // 4️⃣ Page-level access control
    if (requiredRole && role !== requiredRole) {
      console.warn(`Access denied → required: ${requiredRole}, found: ${role}`);
      redirectByRole(role);
      return;
    }

    // ✅ Access allowed
    console.log("AuthGuard passed:", role);
  } catch (err) {
    console.error("AuthGuard error:", err);
    await signOut(auth);
    window.location.href = "/auth.html?mode=login";
  }
});
