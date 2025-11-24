// js/admin-shops.js
import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function loadShops() {
  const container = document.getElementById("shops-container");
  const emptyMessage = document.getElementById("shops-empty");

  try {
    const shopsSnapshot = await getDocs(collection(db, "shops"));
    console.log("📦 Shops loaded successfully");

    container.innerHTML = "";
    emptyMessage.style.display = "none";

    if (shopsSnapshot.empty) {
      emptyMessage.textContent = "No Shops Found.";
      emptyMessage.style.display = "block";
      return;
    }

    shopsSnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "shop-card fade-in";
      card.innerHTML = `
        <img src="${data.image || "https://via.placeholder.com/400x200?text=Shop"}" alt="${data.name}">
        <div class="shop-content">
          <h3>${data.name || "Unnamed Shop"}</h3>
          <p class="meta"><strong>Owner:</strong> ${data.ownerName || data.ownerId || "Unknown"}</p>
          <p class="meta"><strong>Floor:</strong> ${data.floor || "N/A"}</p>
          <p class="meta"><strong>Category:</strong> ${data.category || "N/A"}</p>
          <span class="shop-status ${data.status || "pending"}">
            ${data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : "Pending"}
          </span>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error loading shops:", err);
    emptyMessage.textContent = "Failed to load shops.";
    emptyMessage.style.display = "block";
  }
}
