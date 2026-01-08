import { auth } from "/js/firebase-config.js";
import { signOut } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

async function loadHTML(selector, path) {
  const res = await fetch(path);
  document.querySelector(selector).innerHTML = await res.text();
}

async function initUserLayout() {
  await loadHTML("#sidebarMount", "/user/layout/user-sidebar.html");
  await loadHTML("#navbarMount", "/user/layout/user-navbar.html");

  // Sidebar toggle
  document.getElementById("menuBtn")?.addEventListener("click", () => {
    document.getElementById("sidebar")
      .classList.toggle("-translate-x-full");
  });

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/auth.html";
  });

  // Active link highlight
  const currentPath = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("bg-primary", "text-white");
    }
  });
}

initUserLayout();
