// js/admin-offers.js
import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function setActiveOffersPart(key) {
  document.querySelectorAll(".offers-part").forEach(p =>
    p.classList.remove("offers-part-active")
  );

  const active = document.querySelector(
    `.offers-part[data-offers-part="${key}"]`
  );
  if (active) active.classList.add("offers-part-active");
}

/* ------------------------------
   1. LOAD ALL OFFERS
------------------------------ */
export async function loadOffers(key = "all") {
  setActiveOffersPart(key);

  if (key === "all") loadAllOffers();
  if (key === "create") loadCreateOfferForm();
  if (key === "expired") loadExpiredOffers();
  if (key === "analytics") loadOfferAnalytics();
}

/* ------------------------------
   All Offers
------------------------------ */
async function loadAllOffers() {
  const container = document.getElementById("offers-container");
  const empty = document.getElementById("offers-empty");

  container.innerHTML = "Loading...";
  empty.style.display = "none";

  try {
    const snap = await getDocs(collection(db, "offers"));
    container.innerHTML = "";

    if (snap.empty) {
      empty.textContent = "No offers available.";
      empty.style.display = "block";
      return;
    }

    snap.forEach(doc => {
      const d = doc.data();

      container.innerHTML += `
        <div class="offer-card">
          <h3>${d.title || "Untitled Offer"}</h3>
          <p>${d.description || ""}</p>
          <span class="badge">${d.discount || 0}% OFF</span>
          <span class="expiry">Expires: ${d.expiry || "N/A"}</span>
        </div>
      `;
    });
  } catch (err) {
    empty.textContent = "Failed to load offers.";
    empty.style.display = "block";
  }
}

/* ------------------------------
   Expired Offers
------------------------------ */
async function loadExpiredOffers() {
  const container = document.getElementById("expired-offers-list");
  const empty = document.getElementById("expired-offers-empty");

  container.innerHTML = "Loading...";
  empty.style.display = "none";

  try {
    const today = new Date().toISOString().split("T")[0];

    const qSnap = await getDocs(
      query(collection(db, "offers"), where("expiry", "<", today))
    );

    container.innerHTML = "";

    if (qSnap.empty) {
      empty.style.display = "block";
      return;
    }

    qSnap.forEach(doc => {
      const d = doc.data();

      container.innerHTML += `
        <div class="offer-card expired">
          <h3>${d.title}</h3>
          <p>${d.description || ""}</p>
          <span class="badge expired-badge">Expired</span>
          <span class="expiry">Expired on: ${d.expiry}</span>
        </div>
      `;
    });
  } catch (err) {
    empty.textContent = "Error loading expired offers.";
    empty.style.display = "block";
  }
}

/* ------------------------------
   Create Offer Form
------------------------------ */
function loadCreateOfferForm() {
  console.log("📝 Create offer screen ready");
}

/* ------------------------------
   Placeholder Analytics
------------------------------ */
function loadOfferAnalytics() {
  console.log("📊 Offer analytics loaded");
}
