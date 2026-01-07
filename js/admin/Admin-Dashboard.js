// ================= FIREBASE =================
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs
} from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");
const shopNameEl = document.getElementById("shopName");

const kpiOffers = document.getElementById("kpiOffers");
const kpiViews = document.getElementById("kpiViews");
const kpiStatus = document.getElementById("kpiStatus");
const kpiCreated = document.getElementById("kpiCreated");

// ================= HELPERS =================
function isProfileComplete(shop) {
  return Boolean(
    shop.name &&
    shop.category &&
    shop.location
  );
}

// ================= INIT =================
onAuthStateChanged(auth, async (user) => {
  try {
    if (!user) {
      window.location.href = "/auth.html";
      return;
    }

    // Fetch shop owned by admin
    const q = query(
      collection(db, "shops"),
      where("ownerId", "==", user.uid)
    );

    const snap = await getDocs(q);

    // ❌ No shop → force profile creation
    if (snap.empty) {
      window.location.href = "/admin/admin-profile.html";
      return;
    }

    const shopDoc = snap.docs[0];
    const shop = shopDoc.data();

    // 🔴 Profile incomplete → redirect
    if (!isProfileComplete(shop)) {
      window.location.href = "/admin/Shop-Profile.html";
      return;
    }

    // ✅ Profile complete → load dashboard UI
    shopNameEl.textContent = shop.name || "My Shop";

    kpiOffers.textContent = shop.offerCount ?? "0";
    kpiViews.textContent = shop.views ?? "0";
    kpiStatus.textContent = shop.status || "active";

    kpiCreated.textContent =
      shop.createdAt?.toDate
        ? shop.createdAt.toDate().toLocaleDateString()
        : "—";

  } catch (err) {
    console.error("Admin dashboard error:", err);
    alert("Failed to load dashboard");
  } finally {
    loader.classList.add("hidden");
  }
});
