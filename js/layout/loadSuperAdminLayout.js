async function loadLayout(id, url) {
  const container = document.getElementById(id);
  const res = await fetch(url);
  container.innerHTML = await res.text();
}

await loadLayout("sidebar", "/super-admin/layout/super-admin-sidebar.html");
await loadLayout("navbar", "/super-admin/layout/super-admin-navbar.html");