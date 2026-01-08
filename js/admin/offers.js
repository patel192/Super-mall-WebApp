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
        <td colspan="8"
            class="px-6 py-10 text-center text-slate-400">
          No offers created
        </td>
      </tr>`;
    return;
  }

  const now = Date.now();

  snap.forEach((docSnap) => {
    const o = docSnap.data();

    const views = o.views || 0;
    const clicks = o.clicks || 0;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : "0.00";

    const start = o.startDate.toMillis();
    const end = o.endDate.toMillis();

    let status;
    if (o.status === "disabled") status = "disabled";
    else if (now < start) status = "scheduled";
    else if (now > end) status = "expired";
    else status = "active";

    const ctrColor =
      ctr >= 5
        ? "text-green-600"
        : ctr >= 2
        ? "text-amber-600"
        : "text-red-600";

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

      <td class="px-6 py-4">${views}</td>
      <td class="px-6 py-4">${clicks}</td>

      <td class="px-6 py-4 font-medium ${ctrColor}">
        ${ctr}%
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
              : "bg-red-100 text-red-700"
          }">
          ${status}
        </span>
      </td>

      <td class="px-6 py-4 text-right space-x-3">
        <button
          data-edit="${docSnap.id}"
          class="text-blue-600 text-sm font-medium">
          Edit
        </button>

        ${
          status === "active" || status === "scheduled"
            ? `<button
                data-disable="${docSnap.id}"
                class="text-red-600 text-sm font-medium">
                Disable
              </button>`
            : ""
        }
      </td>
    `;

    offersTable.appendChild(row);
  });

  attachOfferActions();
}

// ================= ACTIONS =================
function attachActions() {
  document.querySelectorAll("[data-disable]").forEach((btn) => {
    btn.onclick = async () => {
      await updateDoc(doc(db, "offers", btn.dataset.disable), {
        status: "disabled",
        updatedAt: serverTimestamp(),
      });
      loadOffers();
    };
  });

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.onclick = () => openEditOffer(btn.dataset.edit);
  });
  // PAUSE
  document.querySelectorAll("[data-pause]").forEach((btn) => {
    btn.onclick = async () => {
      await updateDoc(doc(db, "offers", btn.dataset.pause), {
        status: "paused",
        updatedAt: serverTimestamp(),
      });
      loadOffers();
    };
  });

  // RESUME
  document.querySelectorAll("[data-resume]").forEach((btn) => {
    btn.onclick = async () => {
      const snap = await getDocs(
        query(
          collection(db, "offers"),
          where("__name__", "==", btn.dataset.resume)
        )
      );

      if (snap.empty) return;

      const offer = snap.docs[0].data();
      const now = Date.now();

      let newStatus = "scheduled";
      if (
        now >= offer.startDate.toMillis() &&
        now <= offer.endDate.toMillis()
      ) {
        newStatus = "active";
      }

      await updateDoc(doc(db, "offers", btn.dataset.resume), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      loadOffers();
    };
  });
}

// ================= EDIT =================
async function openEditOffer(id) {
  const snap = await getDocs(
    query(collection(db, "offers"), where("__name__", "==", id))
  );

  if (snap.empty) return;

  const o = snap.docs[0].data();

  editingOfferId = id;
  editingOfferData = o;

  titleInput.value = o.title;
  typeInput.value = o.discountType;
  valueInput.value = o.discountValue;
  startInput.value = o.startDate.toDate().toISOString().slice(0, 16);
  endInput.value = o.endDate.toDate().toISOString().slice(0, 16);

  thumbPreview.src = o.thumbnailUrl;
  thumbPreview.classList.remove("hidden");

  selectedProductId = o.productId;
  selectedProductInput.value = o.productId;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// ================= SUBMIT =================
form.onsubmit = async (e) => {
  e.preventDefault();

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
    await updateDoc(doc(db, "offers", editingOfferId), payload);
  } else {
    await addDoc(collection(db, "offers"), {
      ...payload,
      ownerId: currentUser.uid,
      productId: selectedProductId,
      status: "scheduled",
      views: 0,
      clicks: 0,
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
  editingOfferId = null;
  editingOfferData = null;
  thumbPreview.classList.add("hidden");
}

setInterval(loadOffers, 60_000);
