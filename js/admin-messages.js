// admin-messages.js

import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function loadMessages() {
  const container = document.getElementById("messages-container");
  const emptyMessage = document.getElementById("messages-empty");

  try {
    const messagesQuery = query(
      collection(db, "reviews"),
      orderBy("createdAt", "desc")
    );
    const reviewsSnap = await getDocs(messagesQuery);

    container.innerHTML = "";
    emptyMessage.style.display = "none";

    if (reviewsSnap.empty) {
      emptyMessage.textContent = "No reviews found.";
      emptyMessage.style.display = "block";
      return;
    }

    for (const docSnap of reviewsSnap.docs) {
      const review = docSnap.data();

      // Fetch related data
      const productRef = review.productId ? doc(db, review.productId) : null;
      const shopRef = review.shopId ? doc(db, review.shopId) : null;
      const userRef = review.userId ? doc(db, review.userId) : null;

      const productData = productRef ? (await getDoc(productRef)).data() : null;
      const shopData = shopRef ? (await getDoc(shopRef)).data() : null;
      const userData = userRef ? (await getDoc(userRef)).data() : null;

      const time = review.createdAt?.toDate
        ? review.createdAt.toDate().toLocaleString()
        : "Unknown time";

      const card = document.createElement("div");
      card.className = "message-card";

      card.innerHTML = `
        <p><strong>${review.comment || "No Comment"}</strong></p>
        <p class="meta">⭐ ${review.rating || 0} Rating</p>
        <p class="meta"><strong>Likes:</strong> ${review.likes || 0}</p>
        <p class="meta"><strong>Product:</strong> ${
          productData?.name || "Unknown Product"
        }</p>
        <p class="meta"><strong>Shop:</strong> ${
          shopData?.name || "Unknown Shop"
        }</p>
        <p class="meta"><strong>User:</strong> ${
          userData?.name || "Anonymous User"
        }</p>
        <p class="meta">At: ${time}</p>
        ${
          review.images?.[0]
            ? `<img src="${review.images[0]}" alt="Review Image" width="100%" style="border-radius:8px;margin-top:8px;" />`
            : ""
        }
        <span class="tag ${
          review.verifiedPurchase ? "success" : ""
        }">${review.verifiedPurchase ? "Verified Purchase" : "Unverified"}</span>
      `;

      container.appendChild(card);
    }
  } catch (err) {
    console.error("❌ Error loading reviews:", err);
    emptyMessage.textContent = "Error loading reviews.";
    emptyMessage.style.display = "block";
  }
}
