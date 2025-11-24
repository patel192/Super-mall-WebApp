// admin-offers.js
import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function loadOffers() {
  const container = document.getElementById("offers-container");
  const emptyMessage = document.getElementById("offers-empty");

  try {
    const offersSnapshot = await getDocs(collection(db, "offers"));
    console.log("📦 Offers loaded successfully");

    container.innerHTML = "";
    emptyMessage.style.display = "none";

    if (offersSnapshot.empty) {
      emptyMessage.textContent = "No Offers Found.";
      emptyMessage.style.display = "block";
      return;
    }

    offersSnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "offer-card fade-in";
      card.innerHTML = `
        <h3>${data.title || "Untitled Offer"}</h3>
        <p class="offer-meta"><strong>Shop:</strong> ${data.shopId || "N/A"}</p>
        <p class="offer-meta"><strong>Discount:</strong> ${data.discount || 0}%</p>
        <p class="offer-meta"><strong>Expires:</strong> ${
          data.expiry?.seconds
            ? new Date(data.expiry.seconds * 1000).toLocaleDateString()
            : "N/A"
        }</p>
        <span class="offer-status ${
          data.status || "active"
        }">${data.status ? data.status.toUpperCase() : "ACTIVE"}</span>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error loading offers:", err);
    emptyMessage.textContent = "Failed to load offers.";
    emptyMessage.style.display = "block";
  }
}
