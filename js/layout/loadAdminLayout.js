import { auth } from "/js/firebase-config.js";
import { signOut } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Mount layout partials
async function loadLayout() {
  const [sidebar, navbar] = await Promise.all([
    fetch("/admin/layout/admin-sidebar.html").then(r => r.text()),
    fetch("/admin/layout/admin-navbar.html").then(r => r.text())
  ]);

  document.getElementById("sidebarMount").innerHTML = sidebar;
  document.getElementById("navbarMount").innerHTML = navbar;

  initLayout();
}

// Init interactions
function initLayout() {
  const sidebar = document.getElementById("adminSidebar");
  const menuBtn = document.getElementById("menuBtn");
  const loader = document.getElementById("pageLoader");

  menuBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });

  // Active link highlight
  document.querySelectorAll(".admin-link").forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add("bg-primary", "text-white", "font-medium");
    } else {
      link.classList.add("text-slate-600", "hover:bg-slate-100");
    }
  });

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/auth.html?mode=login";
  });

  // Hide loader
  setTimeout(() => {
    loader.classList.add("opacity-0");
    setTimeout(() => loader.remove(), 300);
  }, 300);
}

loadLayout();
