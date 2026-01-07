// ================= FIREBASE IMPORTS =================
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= ROLE CONSTANTS =================
// admin = Merchant
// user  = Customer
const ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});

// ================= CONFIG =================
// Define which role is allowed on this page
// Example usage:
//   data-required-role="admin"
//   data-required-role="user"
const requiredRole = document.body.dataset.requiredRole;

// ================= GUARD LOGIC =================
onAuthStateChanged(auth, async (user) => {
  try {
    // 1️⃣ Not logged in → redirect to auth
    if (!user) {
      window.location.href = "/signup-login.html?mode=login";
      return;
    }

    // 2️⃣ Fetch user profile
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User profile missing");
      await auth.signOut();
      window.location.href = "/signup-login.html?mode=login";
      return;
    }

    const { role } = userSnap.data();

    // 3️⃣ Validate role
    if (![ROLES.ADMIN, ROLES.USER].includes(role)) {
      console.error("Invalid role:", role);
      await auth.signOut();
      window.location.href = "/signup-login.html?mode=login";
      return;
    }

    // 4️⃣ Check page permission
    if (requiredRole && role !== requiredRole) {
      console.warn(`Access denied. Required: ${requiredRole}, Found: ${role}`);

      // Redirect to correct dashboard
      if (role === ROLES.ADMIN) {
        window.location.href = "/html/admin/Admin-Dashboard.html";
      } else {
        window.location.href = "/html/user/User-Dashboard.html";
      }

      return;
    }

    // ✅ Access allowed
    console.log("AuthGuard passed:", role);
  } catch (err) {
    console.error("AuthGuard error:", err);
    await auth.signOut();
    window.location.href = "/signup-login.html?mode=login";
  }
});
