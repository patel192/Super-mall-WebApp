// ================= FIREBASE =================
import { auth, db } from "../firebase-config.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";

import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");
const offersTable = document.getElementById("offersTable");

const modal = document.getElementById("offerModal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

const productGrid = document.getElementById("productGrid");
const selectedProductInput = document.getElementById("selectedProductId");

const form = document.getElementById("offerForm");
const titleInput = document.getElementById("offerTitle");
const typeInput = document.getElementById("discountType");
const valueInput = document.getElementById("discountValue");
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const thumbInput = document.getElementById("thumbnailInput");
const thumbPreview = document.getElementById("thumbPreview");

let currentUser = null;
let selectedProductId = null;

// ================= AUTH =================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  currentUser = user;

  await loadProducts();
  await loadOffers();

  loader.classList.add("hidden");
});

// ================= MODAL =================
openModal.onclick = () => {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

closeModal.onclick = () => {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  resetForm();
};

// ================= THUMB PREVIEW =================
thumbInput.onchange = () => {
  const file = thumbInput.files[0];
  if (!file) return;
  thumbPreview.src = URL.createObjectURL(file);
  thumbPreview.classList.remove("hidden");
};

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  productGrid.innerHTML = "";

  const snap = await getDocs(query(
    collection(db, "products"),
    where("ownerId", "==", currentUser.uid)
  ));

  snap.forEach((docSnap) => {
    const p = docSnap.data();

    const card = document.createElement("div");
    card.className =
      "border rounded-xl p-4 flex gap-4 cursor-pointer hover:shadow";

    card.innerHTML = `
      <img src="${p.imageUrl || "https://via.placeholder.com/80"}"
           class="w-20 h-20 rounded-xl object-cover border"/>
      <div>
        <p class="font-medium">${p.name}</p>
        <p class="text-sm text-slate-500">₹${p.price}</p>
      </div>
    `;

    card.onclick = () => {
      document.querySelectorAll("#productGrid > div")
        .forEach(c => c.classList.remove("ring-2", "ring-primary"));
      card.classList.add("ring-2", "ring-primary");
      selectedProductId = docSnap.id;
      selectedProductInput.value = docSnap.id;
    };

    productGrid.appendChild(card);
  });
}

// ================= LOAD OFFERS =================
async function loadOffers() {
  offersTable.innerHTML = "";

  const snap = await getDocs(query(
    collection(db, "offers"),
    where("ownerId", "==", currentUser.uid)
  ));

  if (snap.empty) {
    offersTable.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-slate-400">
          No offers created
        </td>
      </tr>`;
    return;
  }

  snap.forEach((docSnap) => {
    const o = docSnap.data();

    const row = document.createElement("tr");
    row.className = "border-t";

    row.innerHTML = `
      <td class="px-6 py-4 flex items-center gap-3">
        <img src="${o.thumbnailUrl}" class="w-12 h-12 rounded-xl object-cover"/>
        ${o.title}
      </td>
      <td class="px-6 py-4">
        ${o.discountType === "percentage"
          ? o.discountValue + "%"
          : "₹" + o.discountValue}
      </td>
      <td class="px-6 py-4 text-sm text-slate-500">
        ${o.startDate.toDate().toLocaleDateString()} →
        ${o.endDate.toDate().toLocaleDateString()}
      </td>
      <td class="px-6 py-4">
        <span class="px-2 py-1 rounded-full text-xs
          ${o.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-600"}">
          ${o.status}
        </span>
      </td>
      <td class="px-6 py-4 text-right">
        <button data-id="${docSnap.id}"
          class="disable text-red-600 text-sm">
          Disable
        </button>
      </td>
    `;

    offersTable.appendChild(row);
  });

  document.querySelectorAll(".disable").forEach(btn => {
    btn.onclick = async () => {
      await updateDoc(doc(db, "offers", btn.dataset.id), {
        status: "disabled",
        updatedAt: serverTimestamp()
      });
      loadOffers();
    };
  });
}

// ================= CREATE OFFER =================
form.onsubmit = async (e) => {
  e.preventDefault();

  if (!selectedProductId || !thumbInput.files[0]) {
    alert("Select product and image");
    return;
  }

  const imageUrl = await uploadImageToCloudinary(thumbInput.files[0]);

  await addDoc(collection(db, "offers"), {
    ownerId: currentUser.uid,
    productId: selectedProductId,
    title: titleInput.value,
    discountType: typeInput.value,
    discountValue: Number(valueInput.value),
    thumbnailUrl: imageUrl,
    startDate: new Date(startInput.value),
    endDate: new Date(endInput.value),
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  closeModal.onclick();
  loadOffers();
};

// ================= RESET =================
function resetForm() {
  form.reset();
  selectedProductId = null;
  thumbPreview.classList.add("hidden");
}
