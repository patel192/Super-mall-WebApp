// admin-users.js
import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function loadUsers() {
  const container = document.getElementById("users-container");
  const emptyMessage = document.getElementById("users-empty");

  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    console.log("👤 Users loaded successfully");

    container.innerHTML = "";
    emptyMessage.style.display = "none";

    if (usersSnapshot.empty) {
      emptyMessage.textContent = "No Users Found.";
      emptyMessage.style.display = "block";
      return;
    }

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "user-card fade-in";
      card.innerHTML = `
        <h3>${data.name || "Unnamed User"}</h3>
        <p class="user-email">${data.email || "No email available"}</p>
        <span class="user-role">${data.role || "User"}</span>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error loading users:", err);
    emptyMessage.textContent = "Failed to load users.";
    emptyMessage.style.display = "block";
  }
}
