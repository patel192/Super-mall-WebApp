// ================= FIREBASE =================
import { auth, db } from "/js/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= HTML LOADER =================
async function loadHTML(selector, path) {
  const res = await fetch(path);
  document.querySelector(selector).innerHTML = await res.text();
}

// ================= PROFILE IN NAVBAR =================
async function loadUserProfile(user) {
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;

    const data = snap.data();

    const avatarImg = document.getElementById("navAvatar");
    const avatarInitial = document.getElementById("navAvatarInitial");
    const nameEl = document.getElementById("navUserName");

    // Name
    if (nameEl && data.fullName) {
      nameEl.textContent = data.fullName.split(" ")[0];
    }

    // Avatar
    if (avatarImg && data.profileImageUrl) {
      avatarImg.src = data.profileImageUrl;
      avatarImg.classList.remove("hidden");
      avatarInitial.classList.add("hidden");
    } else if (avatarInitial) {
      avatarInitial.textContent = (data.fullName || "U")
        .charAt(0)
        .toUpperCase();
    }
  } catch (err) {
    console.warn("Navbar profile load failed:", err);
  }
}

// ================= INIT =================
async function initUserLayout() {
  await loadHTML("#sidebarMount", "/user/layout/user-sidebar.html");
  await loadHTML("#navbarMount", "/user/layout/user-navbar.html");

  // Sidebar toggle
  document.getElementById("menuBtn")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("-translate-x-full");
  });

  // 🔐 Logout (dropdown)
  document
    .getElementById("navLogoutBtn")
    ?.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "/auth.html";
    });

  // 👤 Avatar dropdown toggle
  const profileBtn = document.getElementById("navProfileBtn");
  const profileMenu = document.getElementById("navProfileMenu");

  profileBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle("hidden");
  });

  // ❌ Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!profileMenu.contains(e.target)) {
      profileMenu.classList.add("hidden");
    }
  });

  // Active link highlight
  const currentPath = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("bg-primary", "text-white");
    }
  });
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadUserProfile(user);
    }
  });
}

initUserLayout();
