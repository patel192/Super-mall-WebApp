// manage-categories.js
import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM references
const grid = document.getElementById("categories-grid");

const addBtn = document.getElementById("btn-add-category");
const modal = document.getElementById("modal-category-form");
const modalCloseBtns = modal.querySelectorAll(".modal-close");
const form = document.getElementById("category-form");
const titleEl = document.getElementById("modal-category-title");

// ---- Load all categories ---- //
async function loadCategories() {
  grid.innerHTML = "<p>Loading categories...</p>";
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));

    if (querySnapshot.empty) {
      grid.innerHTML = "<p>No categories found.</p>";
      return;
    }

    grid.innerHTML = "";
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = `
        <div class="category-card">
          <img src="${data.image || "https://via.placeholder.com/200x120"}" alt="${data.name}" />
          <h4>${data.name || "Unnamed"}</h4>
          <p>${data.description || "No description available."}</p>
          <small>Shops: ${data.shopCount || 0}</small>
          <div class="card-actions">
            <button class="btn-edit">Edit</button>
            <button class="btn-delete">Delete</button>
          </div>
        </div>
      `;
      grid.insertAdjacentHTML("beforeend", card);
    });
  } catch (err) {
    console.error("❌ Error loading categories:", err);
    grid.innerHTML = `<p>Error loading categories.</p>`;
  }
}


// ---- Modal Helpers ---- //
function openModal() {
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "flex";
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  form.reset();
  titleEl.textContent = "Add Category";
}

// ---- Add new category ---- //
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const description = form.description.value.trim();
  const image = form.image.value.trim();

  if (!name) {
    alert("Please enter category name");
    return;
  }

  try {
    await addDoc(collection(db, "categories"), {
      name,
      description,
      image,
      shopCount: 0,
      createdAt: serverTimestamp(),
    });

    alert("✅ Category added successfully!");
    closeModal();
    loadCategories();
  } catch (err) {
    console.error("❌ Error adding category:", err);
    alert("Failed to add category. Check console for details.");
  }
});

// ---- Event bindings ---- //
addBtn.addEventListener("click", openModal);
modalCloseBtns.forEach((btn) => btn.addEventListener("click", closeModal));
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// ---- Initialize ---- //
document.addEventListener("DOMContentLoaded", loadCategories);
