// js/admin-myshops.js
import { db } from "../firebase-config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ------------------------------
   Helper: Switch MyShop Sub-Panels
------------------------------ */
function setActiveMyShopPart(key) {
  document
    .querySelectorAll(".myshop-part")
    .forEach((p) => p.classList.remove("myshop-part-active"));

  const active = document.querySelector(
    `.myshop-part[data-myshop-part="${key}"]`
  );
  if (active) active.classList.add("myshop-part-active");
}

/* ------------------------------
   MAIN DISPATCH (like others)
------------------------------ */
export async function loadMyShop(key = "overview") {
  setActiveMyShopPart(key);

  if (key === "overview") loadMyShopOverview();
  if (key === "products") loadMyShopProducts();
}

/* ------------------------------
   1️⃣ LOAD SHOP OVERVIEW
------------------------------ */
async function loadMyShopOverview() {
  try {
    // Assuming logged-in admin shop ID stored in localStorage (example)
    const shopId = localStorage.getItem("myShopId");

    if (!shopId) {
      document.getElementById("shop-name").textContent = "No shop assigned!";
      return;
    }

    const snap = await getDoc(doc(db, "shops", shopId));

    if (!snap.exists()) {
      document.getElementById("shop-name").textContent = "Shop Not Found.";
      return;
    }

    const d = snap.data();

    document.getElementById("shop-image").src =
      d.image || "https://via.placeholder.com/150x100?text=Shop+Image";

    document.getElementById("shop-name").textContent = d.name || "Unnamed Shop";
    document.getElementById("shop-category").textContent =
      "Category: " + (d.category || "N/A");
    document.getElementById("shop-floor").textContent =
      "Floor: " + (d.floor || "N/A");

    const statusEl = document.getElementById("shop-status");
    statusEl.textContent = "Status: " + (d.status || "pending");
    statusEl.className = `shop-detail status-${d.status}`;

    console.log("✅ MyShop Overview Loaded");
  } catch (err) {
    console.error("❌ Error loading my shop overview:", err);
  }
}

/* ------------------------------
   2️⃣ LOAD PRODUCTS
------------------------------ */
async function loadMyShopProducts() {
  const tableBody = document.getElementById("products-table-body");
  const empty = document.getElementById("no-products-message");

  tableBody.innerHTML = "Loading...";
  empty.style.display = "none";

  try {
    const shopId = localStorage.getItem("myShopId");
    if (!shopId) {
      tableBody.innerHTML = "";
      empty.textContent = "No shop found!";
      empty.style.display = "block";
      return;
    }

    const qSnap = await getDocs(
      query(collection(db, "products"), where("shopId", "==", shopId))
    );

    tableBody.innerHTML = "";

    if (qSnap.empty) {
      empty.style.display = "block";
      return;
    }

    qSnap.forEach((doc) => {
      const p = doc.data();

      tableBody.innerHTML += `
        <tr>
          <td>${p.name}</td>
          <td>₹${p.price}</td>
          <td>${p.stock}</td>
          <td>⭐ ${p.rating || "0"}</td>
          <td>
            <button class="btn-secondary">Edit</button>
            <button class="btn-delete">Delete</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    empty.textContent = "Error loading products.";
    empty.style.display = "block";
  }
}
