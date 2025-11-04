// manage-offers.js
import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadOffers() {
  const tbody = document.getElementById("offers-table-body");
  tbody.innerHTML = "<tr><td colspan='8'>Loading...</td></tr>";

  try {
    // ✅ Ensure db is valid
    console.log("Firestore instance:", db);

    // ✅ Correct collection reference
    const offersRef = collection(db, "offers");
    const snapshot = await getDocs(offersRef);

    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='8'>No offers found.</td></tr>";
      return;
    }

    tbody.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();

      const expiryDate = data.expiry?.seconds
        ? new Date(data.expiry.seconds * 1000).toLocaleDateString()
        : "N/A";

      const row = `
        <tr>
          <td>${doc.id}</td>
          <td>${data.title || "—"}</td>
          <td>${data.shopId || "—"}</td>
          <td>${data.discount || 0}%</td>
          <td>${data.startDate || "—"}</td>
          <td>${expiryDate}</td>
          <td>${data.redeemed || 0}</td>
          <td>
            <button class="btn-edit">Edit</button>
            <button class="btn-disable">Disable</button>
            <button class="btn-delete">Delete</button>
          </td>
        </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    console.error("❌ Error loading offers:", err);
    tbody.innerHTML = `<tr><td colspan='8'>Error loading offers</td></tr>`;
  }
}

document.addEventListener("DOMContentLoaded", loadOffers);
