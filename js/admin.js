import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// Import from your Firebase config file

// admin-tabs.js
// Handles: sidebar clicks -> show/hide content sections, update active link, support URL hash deep-linking,
// mobile sidebar toggle and close button, keyboard accessibility.
(() => {
  const links = Array.from(
    document.querySelectorAll(".sidebar-menu a[data-section]")
  );
  const sections = Array.from(document.querySelectorAll(".content-section"));
  const pageTitle = document.getElementById("page-title");
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const closeSidebar = document.getElementById("closeSidebar");

  if (!links.length || !sections.length) return; // nothing to do

  // Utility: show a section by id, hide others
  function showSection(sectionId, updateHash = true) {
    sections.forEach((sec) => {
      if (sec.id === sectionId) sec.classList.add("active-section");
      else sec.classList.remove("active-section");
    });

    links.forEach((link) => {
      const target = link.dataset.section;
      if (target === sectionId) link.classList.add("active");
      else link.classList.remove("active");
    });

    // update page title in topbar
    const activeLink = links.find((l) => l.dataset.section === sectionId);
    pageTitle.textContent = activeLink
      ? activeLink.textContent.trim()
      : document.title;

    // update URL hash without adding history entry (so back button not spammed)
    if (updateHash) {
      try {
        history.replaceState(null, "", `#${sectionId}`);
      } catch (e) {
        // fallback if history API blocked
        location.hash = `#${sectionId}`;
      }
    }

    // on small screens, hide sidebar after click for better UX
    if (window.innerWidth <= 992 && sidebar.classList.contains("show")) {
      sidebar.classList.remove("show");
    }
  }

  // Click handlers for links
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      if (!sectionId) return;
      showSection(sectionId);
    });

    // keyboard: Enter/Space activates link
    link.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        link.click();
      }
    });
  });

  // Mobile sidebar toggle
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("show");
    });
  }
  if (closeSidebar) {
    closeSidebar.addEventListener("click", () =>
      sidebar.classList.remove("show")
    );
  }

  // Respond to hashchange (deep linking / back-button)
  window.addEventListener("hashchange", () => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;
    const found = sections.some((s) => s.id === hash);
    if (found) showSection(hash, /*updateHash=*/ false);
  });

  // On page load: prefer hash -> active link -> first section
  (function init() {
    const initialHash = location.hash.replace("#", "");
    if (initialHash && sections.some((s) => s.id === initialHash)) {
      showSection(initialHash, /*updateHash=*/ false);
      return;
    }

    // if any link already has .active in markup -> show that
    const preActive = links.find((l) => l.classList.contains("active"));
    if (preActive) {
      showSection(preActive.dataset.section, /*updateHash=*/ false);
      return;
    }

    // fallback to first section
    const first = sections[0];
    if (first) showSection(first.id, /*updateHash=*/ false);
  })();

  // Optional: handle window resize to remove 'show' class if moving to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992 && sidebar.classList.contains("show")) {
      sidebar.classList.remove("show");
    }
  });

  // Select the elements where we’ll show user data
  const adminNameEl = document.getElementById("admin-name");
  const adminEmailEl = document.querySelector(".admin-email");
  const adminAvatarEl = document.querySelector(".admin-avatar");

  // Listen for auth state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Get the user's document from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("User data:", userData);

          // Fill data in header
          adminNameEl.textContent = userData.name || "Admin User";
          adminEmailEl.textContent = user.email;
          adminAvatarEl.src = user.photoURL || "https://i.pravatar.cc/40";

          // Optional: check if role is admin
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      // No user is logged in — redirect to login page
      window.location.href = "login.html";
    }
  });
})();
