// ================= FIREBASE IMPORTS =================
import { db } from "../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= CONSTANTS =================
const ROLES = Object.freeze({
  USER: "user",
  MERCHANT_PENDING: "merchant_pending",
  ADMIN: "admin",
});

// ================= DOM =================
const tableBody = document.getElementById("merchantTable");

// ================= LOGGER =================
async function logEvent(type, message, targetUid) {
  await setDoc(doc(db, "logs", crypto.randomUUID()), {
    type,
    message,
    targetUid,
    timestamp: serverTimestamp(),
  });
}

// ================= LOAD MERCHANT REQUESTS =================
async function loadPendingMerchants() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="px-6 py-10 text-center text-slate-400">
        Loading merchant requests…
      </td>
    </tr>
  `;

  const q = query(
    collection(db, "users"),
    where("role", "==", ROLES.MERCHANT_PENDING)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-slate-400">
          No pending merchant requests
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const user = docSnap.data();
    const uid = docSnap.id;

    const row = document.createElement("tr");
    row.className = "border-t";

    row.innerHTML = `
      <td class="px-6 py-4 font-medium text-slate-900">
        ${user.fullName || "—"}
      </td>
      <td class="px-6 py-4">
        ${user.email}
      </td>
      <td class="px-6 py-4">
        ${user.phone || "—"}
      </td>
      <td class="px-6 py-4">
        ${user.createdAt?.toDate
          ? user.createdAt.toDate().toLocaleDateString()
          : "—"}
      </td>
      <td class="px-6 py-4 text-right space-x-2">
        <button
          data-approve="${uid}"
          class="px-4 py-2 rounded-lg bg-green-600 text-white text-xs
                 hover:bg-green-700 transition">
          Approve
        </button>
        <button
          data-reject="${uid}"
          class="px-4 py-2 rounded-lg bg-red-600 text-white text-xs
                 hover:bg-red-700 transition">
          Reject
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachActionHandlers();
}

// ================= ACTION HANDLERS =================
function attachActionHandlers() {
  // Approve
  document.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const uid = btn.dataset.approve;

      if (!confirm("Approve this merchant request?")) return;

      await updateDoc(doc(db, "users", uid), {
        role: ROLES.ADMIN,
        approvedAt: serverTimestamp(),
      });

      await logEvent(
        "MERCHANT_APPROVED",
        "Merchant approved by super admin",
        uid
      );

      loadPendingMerchants();
    });
  });

  // Reject
  document.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const uid = btn.dataset.reject;

      if (!confirm("Reject this merchant request?")) return;

      await updateDoc(doc(db, "users", uid), {
        role: ROLES.USER,
        rejectedAt: serverTimestamp(),
      });

      await logEvent(
        "MERCHANT_REJECTED",
        "Merchant request rejected by super admin",
        uid
      );

      loadPendingMerchants();
    });
  });
}

// ================= INIT =================
loadPendingMerchants();
