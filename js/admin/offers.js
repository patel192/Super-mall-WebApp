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
        ${
          status === "active" || status === "scheduled"
            ? `<button data-id="${docSnap.id}"
              class="disable text-red-600 text-sm">
              Disable
            </button>`
            : ""
        }
      </td>
    `;

    offersTable.appendChild(row);
  });

  attachDisableActions();
}

// ================= DISABLE =================
function attachDisableActions() {
  document.querySelectorAll(".disable").forEach((btn) => {
    btn.onclick = async () => {
      await updateDoc(doc(db, "offers", btn.dataset.id), {
        status: "disabled",
        updatedAt: serverTimestamp(),
      });
      loadOffers();
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

  if (!thumbInput.files[0]) {
    alert("Please upload an offer thumbnail");
    return;
  }

  // HARD RULE: 1 active/scheduled offer per product
  const existing = await getDocs(
    query(
      collection(db, "offers"),
      where("productId", "==", selectedProductId),
      where("status", "in", ["active", "scheduled"])
    )
  );

  if (!existing.empty) {
    alert("This product already has an active or scheduled offer");
    return;
  }

  let imageUrl;
  try {
    imageUrl = await uploadImageToCloudinary(thumbInput.files[0]);
  } catch (err) {
    alert("Image upload failed");
    return;
  }
  const startDate = new Date(startInput.value);
  const endDate = new Date(endInput.value);

  if (isNaN(startDate) || isNaN(endDate)) {
    alert("Please select valid start and end date & time");
    return;
  }
  if (endDate <= startDate) {
    alert("End time must be after start time");
    return;
  }
  await addDoc(collection(db, "offers"), {
    ownerId: currentUser.uid,
    productId: selectedProductId,
    title: titleInput.value.trim(),
    discountType: typeInput.value,
    discountValue: Number(valueInput.value),
    thumbnailUrl: imageUrl,
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    status: "scheduled",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

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
