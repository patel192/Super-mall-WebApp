// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const loader = document.getElementById("pageLoader");

const selectA = document.getElementById("productA");
const selectB = document.getElementById("productB");
const compareBtn = document.getElementById("compareBtn");

const compareSection = document.getElementById("compareSection");
const compareTable = document.getElementById("compareTable");

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  const snap = await getDocs(collection(db, "products"));

  snap.forEach((docSnap) => {
    const p = docSnap.data();

    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = p.name;

    selectA.appendChild(option.cloneNode(true));
    selectB.appendChild(option);
  });
}

// ================= OFFER HELPERS =================
async function getActiveOffer(productId) {
  const snap = await getDocs(
    query(
      collection(db, "offers"),
      where("productId", "==", productId),
      where("status", "==", "active")
    )
  );

  return snap.empty ? null : snap.docs[0].data();
}

function getEffectivePrice(price, offer) {
  if (!offer) return price;

  if (offer.discountType === "percentage") {
    return price - (price * offer.discountValue) / 100;
  }

  return Math.max(0, price - offer.discountValue);
}

// ================= UI HELPERS =================
function renderRow(label, valA, valB, highlightA = false, highlightB = false) {
  return `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-5 font-medium text-slate-700">
        ${label}
      </td>

      <td class="px-6 py-5 text-center ${
        highlightA ? "bg-green-50 text-green-700 font-semibold rounded-xl" : ""
      }">
        ${valA || "—"}
      </td>

      <td class="px-6 py-5 text-center ${
        highlightB ? "bg-green-50 text-green-700 font-semibold rounded-xl" : ""
      }">
        ${valB || "—"}
      </td>
    </tr>
  `;
}

// ================= COMPARE =================
async function compareProducts() {
  const idA = selectA.value;
  const idB = selectB.value;

  if (!idA || !idB || idA === idB) {
    alert("Please select two different products");
    return;
  }

  const [snapA, snapB] = await Promise.all([
    getDoc(doc(db, "products", idA)),
    getDoc(doc(db, "products", idB)),
  ]);

  if (!snapA.exists() || !snapB.exists()) {
    alert("Product not found");
    return;
  }

  const A = snapA.data();
  const B = snapB.data();

  // ===== OFFERS =====
  const [offerA, offerB] = await Promise.all([
    getActiveOffer(idA),
    getActiveOffer(idB),
  ]);

  const effPriceA = getEffectivePrice(A.price, offerA);
  const effPriceB = getEffectivePrice(B.price, offerB);

  // ===== COMPARISONS =====
  const cheaperA = effPriceA < effPriceB;
  const cheaperB = effPriceB < effPriceA;

  const priceDiff = Math.abs(effPriceA - effPriceB).toFixed(2);

  // ===== RENDER =====
  compareTable.innerHTML = `
    ${renderRow(
      "Image",
      `<img src="${A.imageUrl}" class="w-20 h-20 object-cover rounded-xl"/>`,
      `<img src="${B.imageUrl}" class="w-20 h-20 object-cover rounded-xl"/>`
    )}

    ${renderRow("Name", A.name, B.name)}
    ${renderRow("Category", A.category, B.category)}
    ${renderRow("Original Price", `₹${A.price}`, `₹${B.price}`)}
    ${renderRow(
      "Effective Price",
      `₹${effPriceA.toFixed(2)}`,
      `₹${effPriceB.toFixed(2)}`,
      cheaperA,
      cheaperB
    )}

    ${renderRow(
      "Offer",
      offerA
        ? `${offerA.discountValue}${
            offerA.discountType === "percentage" ? "%" : "₹"
          } OFF`
        : "—",
      offerB
        ? `${offerB.discountValue}${
            offerB.discountType === "percentage" ? "%" : "₹"
          } OFF`
        : "—"
    )}

    ${renderRow(
      "Price Difference",
      cheaperA ? `Cheaper by ₹${priceDiff}` : "—",
      cheaperB ? `Cheaper by ₹${priceDiff}` : "—",
      cheaperA,
      cheaperB
    )}

    ${renderRow(
      "Best Choice",
      cheaperA ? "✅ Best Value" : "",
      cheaperB ? "✅ Best Value" : ""
    )}
  `;

  compareSection.classList.remove("hidden");
}

// ================= INIT =================
(async function init() {
  try {
    await loadProducts();
  } catch (err) {
    console.error("Failed to load products:", err);
  } finally {
    loader.classList.add("hidden");
  }
})();

compareBtn.onclick = compareProducts;
