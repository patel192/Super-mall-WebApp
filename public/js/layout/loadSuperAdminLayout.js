async function loadLayout(id, url) {
  const container = document.getElementById(id);
  const res = await fetch(url);
  container.innerHTML = await res.text();
}

await loadLayout("sidebar", "/public/super-admin/layout/super-admin-sidebar.html");
await loadLayout("navbar", "/public/super-admin/layout/super-admin-navbar.html");
await import("../utils/notificationBell.js");
(function activateSidebar() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll("[data-nav]");

  navLinks.forEach((link) => {
    const linkPath = new URL(link.href).pathname;

    if (currentPath === linkPath) {
      // Active background
      link.classList.add("bg-indigo-50", "text-indigo-700", "font-medium");

      // Icon highlight
      const icon = link.querySelector("i");
      if (icon) {
        icon.classList.add("text-indigo-600");
      }
    }
  });
})();
