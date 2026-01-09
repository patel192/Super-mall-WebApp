// /js/auth/authGuard.js
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/auth.html");
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) {
    window.location.replace("/auth.html");
    return;
  }

  const { role } = userSnap.data();
  const path = window.location.pathname;

  // SUPER ADMIN
  if (role === "super_admin") {
    if (!path.startsWith("/super-admin")) {
      window.location.replace("/super-admin/Dashboard.html");
    }
    return;
  }

  // ADMIN
  if (role === "admin") {
    if (!path.startsWith("/admin")) {
      window.location.replace("/admin/Admin-Dashboard.html");
    }
    return;
  }

  // USER
  if (role === "user" || role === "merchant_pending") {
    if (!path.startsWith("/user")) {
      window.location.replace("/user/User-Dashboard.html");
    }
    return;
  }

  // Fallback
  window.location.replace("/auth.html");
});
