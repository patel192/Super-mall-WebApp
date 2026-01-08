// ================= FIREBASE =================
import { auth, db } from "../firebase-config.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { startOfferStatusUpdater } from "../utils/offerStatusUpdater.js";
// ================= DOM =================
const loader = document.getElementById("pageLoader");
const offersTable = document.getElementById("offersTable");

const modal = document.getElementById("offerModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");

const productGrid = document.getElementById("productGrid");
const selectedProductInput = document.getElementById("selectedProductId");

const form = document.getElementById("offerForm");
const titleInput = document.getElementById("offerTitle");
const typeInput = document.getElementById("discountType");
const valueInput = document.getElementById("discountValue");
const startInput = document.getElementById("startDateTime");
const endInput = document.getElementById("endDateTime");
const thumbInput = document.getElementById("thumbnailInput");
const thumbPreview = document.getElementById("thumbPreview");

let currentUser = null;
let selectedProductId = null;
let editingOfferId = null;
let editingOfferData = null;

// ================= AUTH =================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  currentUser = user;
  startOfferStatusUpdater();
  await loadProducts();
  await loadOffers();

  loader.classList.add("hidden");
});

// ================= MODAL =================
openModalBtn.onclick = () => {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

closeModalBtn.onclick = closeModal;

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  resetForm();
}

// ================= IMAGE PREVIEW =================
thumbInput.onchange = () => {
  const file = thumbInput.files[0];
  if (!file) return;

  thumbPreview.src = URL.createObjectURL(file);
  thumbPreview.classList.remove("hidden");
};

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  productGrid.innerHTML = "";

  const snap = await getDocs(
    query(collection(db, "products"), where("ownerId", "==", currentUser.uid))
  );

  if (snap.empty) {
    productGrid.innerHTML = `
      <p class="text-sm text-slate-400">
        No products found. Create a product first.
      </p>`;
    return;
  }

  snap.forEach((docSnap) => {
    const p = docSnap.data();

    const card = document.createElement("div");
    card.className =
      "border rounded-xl p-4 flex gap-4 cursor-pointer hover:shadow transition";

    card.innerHTML = `
      <img src="${p.imageUrl || "https://via.placeholder.com/80"}"
           class="w-20 h-20 rounded-xl object-cover border"/>
      <div>
        <p class="font-medium text-slate-900">${p.name}</p>
        <p class="text-sm text-slate-500">₹${p.price}</p>
      </div>
    `;

    card.onclick = () => {
      document
        .querySelectorAll("#productGrid > div")
        .forEach((c) => c.classList.remove("ring-2", "ring-primary"));

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

  const snap = await getDocs(
    query(collection(db, "offers"), where("ownerId", "==", currentUser.uid))
  );

  if (snap.empty) {
    offersTable.innerHTML = `
      <tr>
        <td colspan="5"
            class="px-6 py-10 text-center text-slate-400">
          No offers created
        </td>
      </tr>`;
    return;
  }

  snap.forEach((docSnap) => {
    const o = docSnap.data();

    const now = Date.now();
    const start = o.startDate.toMillis();
    const end = o.endDate.toMillis();

    let status;

    // 🔒 MANUAL OVERRIDE HAS HIGHEST PRIORITY
    if (o.status === "disabled") {
      status = "disabled";
    } else if (now < start) {
      status = "scheduled";
    } else if (now > end) {
      status = "expired";
    } else {
      status = "active";
    }

    const row = document.createElement("tr");
    row.className = "border-t";

    row.innerHTML = `
      <td class="px-6 py-4 flex items-center gap-3">
        <img src="${o.thumbnailUrl}"
             class="w-12 h-12 rounded-xl object-cover border"/>
        <span class="font-medium">${o.title}</span>
      </td>

      <td class="px-6 py-4">
        ${
          o.discountType === "percentage"
            ? o.discountValue + "%"
            : "₹" + o.discountValue
        }
      </td>

      <td class="px-6 py-4 text-sm text-slate-500">
        ${o.startDate.toDate().toLocaleDateString()}
        →
        ${o.endDate.toDate().toLocaleDateString()}
      </td>

      <td class="px-6 py-4">
        <span class="px-2 py-1 rounded-full text-xs
         ${
           status === "active"
             ? "bg-green-100 text-green-700"
             : status === "scheduled"
             ? "bg-amber-100 text-amber-700"
             : status === "expired"
             ? "bg-slate-200 text-slate-600"
             : "bg-red-100 text-red-700" // disabled
         }
">
          ${status}
        </span>
      </td>

      <td class="px-6 py-4 text-right">
       <td class="px-6 py-4 text-right space-x-3">
  <button
    data-edit="${docSnap.id}"
    class="edit text-blue-600 text-sm font-medium">
    Edit
  </button>

  ${
    status === "active" || status === "scheduled"
      ? `<button
          data-disable="${docSnap.id}"
          class="disable text-red-600 text-sm font-medium">
          Disable
        </button>`
      : ""
  }
</td>

      </td>
    `;

    offersTable.appendChild(row);
  });

  attachOfferActions();
}
async function openEditOffer(offerId) {
  const snap = await getDocs(
    query(collection(db, "offers"), where("__name__", "==", offerId))
  );

  if (snap.empty) return;

  const offer = snap.docs[0].data();

  editingOfferId = offerId;
  editingOfferData = offer;

  // Fill form
  titleInput.value = offer.title;
  typeInput.value = offer.discountType;
  valueInput.value = offer.discountValue;

  startInput.value = offer.startDate.toDate().toISOString().slice(0, 16);

  endInput.value = offer.endDate.toDate().toISOString().slice(0, 16);

  thumbPreview.src = offer.thumbnailUrl;
  thumbPreview.classList.remove("hidden");

  // Disable product selection (BUSINESS RULE)
  selectedProductId = offer.productId;
  selectedProductInput.value = offer.productId;

  document.querySelectorAll("#productGrid > div").forEach((c) => {
    c.classList.add("opacity-50", "pointer-events-none");
  });

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// ================= DISABLE =================
function attachOfferActions() {
  // DISABLE
  document.querySelectorAll("[data-disable]").forEach((btn) => {
    btn.onclick = async () => {
      await updateDoc(doc(db, "offers", btn.dataset.disable), {
        status: "disabled",
        updatedAt: serverTimestamp(),
      });
      loadOffers();
    };
  });

  // EDIT
  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.onclick = () => {
      const offerId = btn.dataset.edit;
      openEditOffer(offerId);
    };
  });
}

// ================= CREATE OFFER =================
form.onsubmit = async (e) => {
  e.preventDefault();

  if (!selectedProductId) {
    alert("Please select a product");
    return;
  }

  const startDate = new Date(startInput.value);
  const endDate = new Date(endInput.value);

  if (endDate <= startDate) {
    alert("End time must be after start time");
    return;
  }

  let thumbnailUrl = editingOfferData?.thumbnailUrl;

  if (thumbInput.files[0]) {
    thumbnailUrl = await uploadImageToCloudinary(thumbInput.files[0]);
  }

  const payload = {
    title: titleInput.value.trim(),
    discountType: typeInput.value,
    discountValue: Number(valueInput.value),
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    thumbnailUrl,
    updatedAt: serverTimestamp(),
  };

  if (editingOfferId) {
    // UPDATE
    await updateDoc(doc(db, "offers", editingOfferId), payload);
  } else {
    // CREATE
    await addDoc(collection(db, "offers"), {
      ...payload,
      ownerId: currentUser.uid,
      productId: selectedProductId,
      status: "scheduled",
      createdAt: serverTimestamp(),
    });
  }

  closeModal();
  loadOffers();
};

// ================= RESET =================
function resetForm() {
  form.reset();
  selectedProductId = null;
  thumbPreview.classList.add("hidden");
}
setInterval(loadOffers, 60_000);
