// ================= FIREBASE =================
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// ================= STATE =================
let currentUser = null;
let editingId = null;
let existingImageUrl = null;
let shopId = null;
let shopOwnerId = null;

// ================= LOAD SHOP CONTEXT =================
async function loadMyShopContext() {
  const snap = await getDocs(
    query(collection(db, "shops"), where("ownerId", "==", currentUser.uid))
  );

  if (snap.empty) {
    throw new Error("Shop not found for merchant");
  }

  const shopDoc = snap.docs[0];
  shopId = shopDoc.id;
  shopOwnerId = shopDoc.data().ownerId;
}

// ================= SPARKLINE =================
function drawSparkline(canvas, data) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const max = Math.max(...data, 1);
  const stepX = canvas.width / (data.length - 1);

  ctx.beginPath();
  ctx.strokeStyle = "#2563EB";
  ctx.lineWidth = 2;

  data.forEach((v, i) => {
    const x = i * stepX;
    const y = canvas.height - (v / max) * (canvas.height - 4) - 2;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
}

// ================= AUTH =================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUser = user;

  await loadMyShopContext(); // ✅ FIXED
  await loadProducts();

  document.getElementById("pageLoader")?.classList.add("hidden");
});

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  table.innerHTML = "";

  const snap = await getDocs(
    query(collection(db, "products"), where("shopId", "==", shopId))
  );

  if (snap.empty) {
    table.innerHTML = `
      <tr>
        <td colspan="9" class="px-6 py-10 text-center text-slate-400">
          No products added yet
        </td>
      </tr>`;
    return;
  }

  snap.forEach((docSnap) => {
    const p = docSnap.data();
    const views = p.views || 0;
    const clicks = p.clicks || 0;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";

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
          ${
            p.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }">
          ${p.status || "active"}
        </span>
      </td>

      <td class="px-6 py-4">${views}</td>
      <td class="px-6 py-4">${clicks}</td>

      <td class="px-6 py-4 font-medium
        ${
          ctr >= 5
            ? "text-green-600"
            : ctr >= 2
            ? "text-amber-600"
            : "text-red-600"
        }">
        ${ctr}%
      </td>

      <td class="px-6 py-4">
        <canvas class="product-trend"
          data-product-id="${docSnap.id}"
          width="90" height="28"></canvas>
      </td>

      <td class="px-6 py-4 text-right space-x-2">
        <button class="edit text-blue-600" data-id="${docSnap.id}">Edit</button>
        <button class="delete text-red-600" data-id="${
          docSnap.id
        }">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });

  await renderProductTrends();
  attachActions();
}

// ================= PRODUCT TRENDS =================
async function renderProductTrends() {
  const canvases = document.querySelectorAll(".product-trend");

  for (const canvas of canvases) {
    const productId = canvas.dataset.productId;

    const snap = await getDocs(
      query(
        collection(db, "product_stats"),
        where("productId", "==", productId)
      )
    );

    const daily = Array(7).fill(0);
    const today = new Date();

    snap.forEach((doc) => {
      const d = doc.data();
      const statDate = new Date(d.date);
      const diff = Math.floor((today - statDate) / 86400000);
      const idx = 6 - diff;
      if (idx >= 0 && idx < 7) daily[idx] += d.views || 0;
    });

    drawSparkline(canvas, daily);
  }
}

// ================= ACTIONS =================
function attachActions() {
  document.querySelectorAll(".edit").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const snap = await getDocs(
        query(collection(db, "products"), where("__name__", "==", id))
      );

      const p = snap.docs[0].data();
      editingId = id;
      existingImageUrl = p.imageUrl;

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

// ================= CREATE / UPDATE =================
form.onsubmit = async (e) => {
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
    ownerId: shopOwnerId, // ✅ FIXED
    shopId,
    status: "active",
    updatedAt: serverTimestamp(),
  };

  if (!payload.name || !payload.price) {
    alert("Name and price are required");
    return;
  }

  if (editingId) {
    await updateDoc(doc(db, "products", editingId), payload);
  } else {
    const productRef = await addDoc(collection(db, "products"), {
      ...payload,
      views: 0,
      clicks: 0,
      createdAt: serverTimestamp(),
    });

    // 🔔 PRODUCT CREATED NOTIFICATION
    await addDoc(collection(db, "notifications"), {
      type: "PRODUCT_CREATED",
      title: "Product Added",
      message: `Your product "${payload.name}" is now live.`,
      targetRole: "admin",
      targetUid: shopOwnerId,
      link: "/admin/Products.html",
      read: false,
      createdAt: serverTimestamp(),
    });
  }

  closeModal();
  loadProducts();
};

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
