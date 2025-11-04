import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const shopsTableBody = document.getElementById("shops-table-body");
  const filterCategory = document.getElementById("filter-category");
  const filterFloor = document.getElementById("filter-floor");
  const searchInput = document.getElementById("shop-search");
  const addShopBtn = document.getElementById("btn-add-shop");
  const modal = document.getElementById("modal-shop-form");
  const modalCloseBtns = modal.querySelectorAll(".modal-close");
  const shopForm = document.getElementById("shop-form");
  const modalTitle = document.getElementById("modal-shop-title");

  let allShops = [];

  // === Fetch & Display Shops ===
  async function loadShops() {
    shopsTableBody.innerHTML = `<tr><td colspan="8">Loading...</td></tr>`;
    try {
      const querySnapshot = await getDocs(collection(db, "shops"));
      allShops = [];
      querySnapshot.forEach((doc) => {
        allShops.push({ id: doc.id, ...doc.data() });
      });
      renderTable(allShops);
      console.log("✅ Shops loaded:", allShops.length);
    } catch (error) {
      console.error("❌ Error loading shops:", error);
      shopsTableBody.innerHTML = `<tr><td colspan="8">Error loading shops.</td></tr>`;
    }
  }

  // === Render Table ===
  function renderTable(data) {
    if (!data.length) {
      shopsTableBody.innerHTML = `<tr><td colspan="8">No shops found.</td></tr>`;
      return;
    }

    shopsTableBody.innerHTML = data
      .map(
        (shop) => `
      <tr>
        <td>${shop.id}</td>
        <td>${shop.name || "—"}</td>
        <td>${shop.owner || "—"}</td>
        <td>${shop.category || "—"}</td>
        <td>${shop.floor || "—"}</td>
        <td><span class="status ${shop.status || "pending"}">${shop.status || "Pending"}</span></td>
        <td>${shop.createdAt ? new Date(shop.createdAt.seconds * 1000).toLocaleDateString() : "—"}</td>
        <td>
          <button class="btn-edit" data-id="${shop.id}">Edit</button>
          <button class="btn-approve" data-id="${shop.id}">Approve</button>
          <button class="btn-delete" data-id="${shop.id}">Delete</button>
        </td>
      </tr>`
      )
      .join("");
  }

  // === Filter & Search ===
  function filterShops() {
    const cat = filterCategory.value.toLowerCase();
    const floor = filterFloor.value.toLowerCase();
    const search = searchInput.value.toLowerCase();

    const filtered = allShops.filter((shop) => {
      const matchesCat = !cat || shop.category?.toLowerCase() === cat;
      const matchesFloor = !floor || shop.floor?.toLowerCase() === floor;
      const matchesSearch =
        !search ||
        shop.name?.toLowerCase().includes(search) ||
        shop.owner?.toLowerCase().includes(search);
      return matchesCat && matchesFloor && matchesSearch;
    });

    renderTable(filtered);
  }

  filterCategory.addEventListener("change", filterShops);
  filterFloor.addEventListener("change", filterShops);
  searchInput.addEventListener("input", filterShops);

  // === Modal Controls ===
  addShopBtn.addEventListener("click", () => {
    modalTitle.textContent = "Add Shop";
    shopForm.reset();
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("show");
  });

  modalCloseBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      modal.setAttribute("aria-hidden", "true");
      modal.classList.remove("show");
    })
  );

  // === Add Shop ===
  shopForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(shopForm);
    const newShop = {
      name: formData.get("shopName"),
      owner: formData.get("owner"),
      category: formData.get("category"),
      floor: formData.get("floor"),
      description: formData.get("description"),
      image: formData.get("image"),
      status: "pending",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "shops"), newShop);
      alert("✅ Shop added successfully!");
      modal.setAttribute("aria-hidden", "true");
      modal.classList.remove("show");
      loadShops(); // Refresh list
    } catch (error) {
      console.error("❌ Error adding shop:", error);
      alert("Error adding shop. Check console.");
    }
  });

  // === Initialize ===
  loadShops();
});
