// js/admin-shops.js
import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ======================================================
    HELPER: Activate correct part
====================================================== */
function setActiveShopPart(partKey) {
  const parts = document.querySelectorAll(".shops-part");
  parts.forEach((p) => p.classList.remove("shops-part-active"));

  const active = document.querySelector(`.shops-part[data-shops-part="${partKey}"]`);
  if (active) active.classList.add("shops-part-active");
}

/* ======================================================
    1. LOAD ALL SHOPS
====================================================== */
export async function loadAllShops() {
  const container = document.getElementById("shops-container");
  const emptyMessage = document.getElementById("shops-empty");

  try {
    const shopsSnapshot = await getDocs(collection(db, "shops"));
    console.log("📦 All shops loaded");

    container.innerHTML = "";
    emptyMessage.style.display = "none";

    if (shopsSnapshot.empty) {
      emptyMessage.textContent = "No Shops Found.";
      emptyMessage.style.display = "block";
      return;
    }

    shopsSnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "shop-card fade-in";

      card.innerHTML = `
        <img src="${data.image || "https://via.placeholder.com/400x200?text=Shop"}" alt="${data.name}">
        <div class="shop-content">
          <h3>${data.name || "Unnamed Shop"}</h3>
          <p class="meta"><strong>Owner:</strong> ${data.ownerName || data.ownerId || "Unknown"}</p>
          <p class="meta"><strong>Floor:</strong> ${data.floor || "N/A"}</p>
          <p class="meta"><strong>Category:</strong> ${data.category || "N/A"}</p>
          <span class="shop-status ${data.status || "pending"}">
            ${data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : "Pending"}
          </span>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error loading shops:", err);
    emptyMessage.textContent = "Failed to load shops.";
    emptyMessage.style.display = "block";
  }
}

/* ======================================================
    2. ADD NEW SHOP
====================================================== */
export function setupAddShopForm() {
  const form = document.getElementById("add-shop-form");
  if (!form) return;

  form.reset();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("shop-name-input").value;
    const category = document.getElementById("shop-category-input").value;
    const floor = document.getElementById("shop-floor-input").value;

    if (!name || !category) {
      alert("Name & Category required");
      return;
    }

    try {
      await addDoc(collection(db, "shops"), {
        name,
        category,
        floor,
        status: "pending",
        createdAt: new Date(),
      });

      alert("Shop Added Successfully!");
      form.reset();
    } catch (err) {
      console.error("❌ Error adding shop:", err);
      alert("Failed to add shop");
    }
  });
}

/* ======================================================
    3. PENDING APPROVALS
====================================================== */
export async function loadPendingShops() {
  const list = document.getElementById("pending-shops-list");

  try {
    const qPending = query(collection(db, "shops"), where("status", "==", "pending"));
    const snap = await getDocs(qPending);

    list.innerHTML = "";

    if (snap.empty) {
      list.innerHTML = "<p class='placeholder'>No pending shops.</p>";
      return;
    }

    snap.forEach((doc) => {
      const d = doc.data();
      list.insertAdjacentHTML(
        "beforeend",
        `
        <div class="shop-card small">
          <h3>${d.name}</h3>
          <p>${d.category} | Floor ${d.floor || "-"}</p>
          <button class="btn-primary approve-btn" data-id="${doc.id}">Approve</button>
        </div>
      `
      );
    });
  } catch (err) {
    console.error("❌ Error loading pending:", err);
    list.innerHTML = "Failed to load.";
  }
}

/* ======================================================
    4. SHOP CATEGORIES
====================================================== */
export async function loadShopCategories() {
  const list = document.getElementById("categories-list");
  list.innerHTML = "<p class='placeholder'>Loading...</p>";

  try {
    const snap = await getDocs(collection(db, "shops"));
    const categories = {};

    snap.forEach((s) => {
      const c = s.data().category || "Unknown";
      categories[c] = (categories[c] || 0) + 1;
    });

    list.innerHTML = "";

    Object.entries(categories).forEach(([cat, count]) => {
      list.innerHTML += `
        <div class="category-card">
          <h3>${cat}</h3>
          <p>${count} shops</p>
        </div>`;
    });
  } catch (err) {
    console.error("❌ Error loading categories:", err);
    list.innerHTML = "Failed to load categories.";
  }
}

/* ======================================================
    5. SHOPS ANALYTICS
====================================================== */
export async function loadShopsAnalytics() {
  console.log("📊 Shops analytics coming soon...");
  // You can plug Chart.js here
}

/* ======================================================
    MASTER DISPATCHER (called by admin.js)
====================================================== */
export function loadShops(part = "all") {
  setActiveShopPart(part);

  switch (part) {
    case "all":
      loadAllShops();
      break;

    case "add":
      setupAddShopForm();
      break;

    case "pending":
      loadPendingShops();
      break;

    case "categories":
      loadShopCategories();
      break;

    case "analytics":
      loadShopsAnalytics();
      break;

    default:
      loadAllShops();
  }
}
