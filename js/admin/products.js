// ================= FIREBASE =================
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= CLOUDINARY =================
import { uploadImageToCloudinary } from "../utils/cloudinary.js";

// ================= DOM =================
const table = document.getElementById("productsTable");
const modal = document.getElementById("productModal");
const openBtn = document.getElementById("openCreate");
const closeBtn = document.getElementById("closeModal");
const form = document.getElementById("productForm");

const nameInput = document.getElementById("productName");
const descInput = document.getElementById("productDesc");
const priceInput = document.getElementById("productPrice");
const categoryInput = document.getElementById("productCategory");
const imageInput = document.getElementById("productImage");

let currentUser = null;
let editingId = null;
let existingImageUrl = null;

// ================= AUTH =================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  currentUser = user;
  await loadProducts();
  document.getElementById("pageLoader").classList.add("hidden");
});

// ================= LOAD =================
async function loadProducts() {
  table.innerHTML = "";

  const q = query(
    collection(db, "products"),
    where("ownerId", "==", currentUser.uid)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    table.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-slate-400">
          No products added yet
        </td>
      </tr>`;
    return;
  }

  snap.forEach((docSnap) => {
    const p = docSnap.data();

    const row = document.createElement("tr");
    row.className = "border-t";

    row.innerHTML = `
      <td class="px-6 py-4">
        <img src="${p.imageUrl || ""}"
             class="w-12 h-12 rounded-lg object-cover border"/>
      </td>
      <td class="px-6 py-4 font-medium">${p.name}</td>
      <td class="px-6 py-4">₹${p.price}</td>
      <td class="px-6 py-4">
        <span class="px-2 py-1 rounded-full text-xs
          ${p.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-600"}">
          ${p.status}
        </span>
      </td>
      <td class="px-6 py-4 text-right space-x-2">
        <button class="edit text-blue-600" data-id="${docSnap.id}">Edit</button>
        <button class="delete text-red-600" data-id="${docSnap.id}">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });

  attachActions();
}

// ================= CREATE / UPDATE =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let imageUrl = existingImageUrl;

  if (imageInput.files[0]) {
    imageUrl = await uploadImageToCloudinary(imageInput.files[0]);
  }

  const payload = {
    name: nameInput.value.trim(),
    description: descInput.value.trim(),
    price: Number(priceInput.value),
    category: categoryInput.value.trim(),
    imageUrl,
    ownerId: currentUser.uid,
    status: "active",
    updatedAt: serverTimestamp()
  };

  if (!payload.name || !payload.price) {
    alert("Name and price are required");
    return;
  }

  if (editingId) {
    await updateDoc(doc(db, "products", editingId), payload);
  } else {
    await addDoc(collection(db, "products"), {
      ...payload,
      createdAt: serverTimestamp()
    });
  }

  closeModal();
  loadProducts();
});

// ================= ACTIONS =================
function attachActions() {
  document.querySelectorAll(".edit").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.id;

      const snap = await getDocs(query(
        collection(db, "products"),
        where("__name__", "==", id)
      ));

      const p = snap.docs[0].data();

      editingId = id;
      existingImageUrl = p.imageUrl || null;

      nameInput.value = p.name;
      descInput.value = p.description;
      priceInput.value = p.price;
      categoryInput.value = p.category;

      openModal();
    };
  });

  document.querySelectorAll(".delete").forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm("Delete this product?")) return;
      await deleteDoc(doc(db, "products", btn.dataset.id));
      loadProducts();
    };
  });
}

// ================= MODAL =================
function openModal() {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  editingId = null;
  existingImageUrl = null;
  form.reset();
}

openBtn.onclick = openModal;
closeBtn.onclick = closeModal;
