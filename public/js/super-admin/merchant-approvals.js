// ================= FIREBASE IMPORTS =================
import { db } from "../firebase-config.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { notifyUser, notifySuperAdmin } from "../utils/notificationService.js";
// ================= CONSTANTS =================
const ROLES = Object.freeze({
  USER: "user",
  MERCHANT_PENDING: "merchant_pending",
  ADMIN: "admin",
  REJECTED: "rejected",
});

// ================= DOM =================
const tableBody = document.getElementById("merchantTable");

// Floor modal elements
const floorModal = document.getElementById("floorModal");
const floorSelect = document.getElementById("floorSelect");
const cancelFloorBtn = document.getElementById("cancelFloorBtn");
const confirmApproveBtn = document.getElementById("confirmApproveBtn");

// State
let selectedMerchantUid = null;

// ================= HELPERS =================
function getStatusLabel(role) {
  switch (role) {
    case ROLES.MERCHANT_PENDING:
      return "Pending";
    case ROLES.ADMIN:
      return "Approved";
    case ROLES.REJECTED:
      return "Rejected";
    default:
      return "Unknown";
  }
}

function getStatusBadgeClass(role) {
  switch (role) {
    case ROLES.MERCHANT_PENDING:
      return "bg-amber-100 text-amber-700";
    case ROLES.ADMIN:
      return "bg-green-100 text-green-700";
    case ROLES.REJECTED:
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function lockButton(btn, text = "Processing...") {
  btn.disabled = true;
  btn.textContent = text;
  btn.classList.add("opacity-70", "cursor-not-allowed");
}

function unlockButton(btn, text) {
  btn.disabled = false;
  btn.textContent = text;
  btn.classList.remove("opacity-70", "cursor-not-allowed");
}

// ================= LOGGER =================
async function logEvent(type, message, targetUid) {
  await setDoc(doc(db, "logs", crypto.randomUUID()), {
    type,
    message,
    targetUid,
    timestamp: serverTimestamp(),
  });
}

// ================= LOAD FLOORS =================
async function loadFloors() {
  floorSelect.innerHTML = `<option value="">Select a floor</option>`;

  const snap = await getDocs(collection(db, "floors"));

  snap.forEach((docSnap) => {
    const floor = docSnap.data();
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = `${floor.name} (Level ${floor.level})`;
    floorSelect.appendChild(option);
  });
}

// ================= REALTIME LISTENER =================
function listenPendingMerchants() {
  const q = query(
    collection(db, "users"),
    where("role", "==", ROLES.MERCHANT_PENDING)
  );

  onSnapshot(q, (snapshot) => {
    tableBody.innerHTML = "";

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
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
            ${getStatusBadgeClass(user.role)}">
            ${getStatusLabel(user.role)}
          </span>
        </td>

        <td class="px-6 py-4 text-right space-x-2">
          <button
            data-approve="${uid}"
            class="approve-btn px-4 py-2 rounded-lg bg-green-600 text-white text-xs
                   hover:bg-green-700 transition">
            Approve
          </button>

          <button
            data-reject="${uid}"
            class="reject-btn px-4 py-2 rounded-lg bg-red-600 text-white text-xs
                   hover:bg-red-700 transition">
            Reject
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    attachActionHandlers();
  });
}

// ================= ACTION HANDLERS =================
function attachActionHandlers() {
  // APPROVE (opens floor modal)
  document.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.onclick = async () => {
      selectedMerchantUid = btn.dataset.approve;
      await loadFloors();
      floorModal.classList.remove("hidden");
      floorModal.classList.add("flex");
    };
  });

  // REJECT
  document.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.onclick = async () => {
      const uid = btn.dataset.reject;

      if (!confirm("Reject this merchant request?")) return;

      lockButton(btn);

      try {
        await updateDoc(doc(db, "users", uid), {
          role: ROLES.REJECTED,
          rejectedAt: serverTimestamp(),
        });
        await notifyUser(uid, {
          type: "MERCHANT_REJECTED",
          title: "Merchant Request Rejected",
          message: "Your merchant request was rejected by the administrator.",
        });

        await logEvent(
          "MERCHANT_REJECTED",
          "Merchant request rejected by super admin",
          uid
        );
      } catch (err) {
        unlockButton(btn, "Reject");
        alert("Rejection failed. Please try again.");
      }
    };
  });
}

// ================= MODAL ACTIONS =================
cancelFloorBtn.onclick = () => {
  floorModal.classList.add("hidden");
  floorModal.classList.remove("flex");
  selectedMerchantUid = null;
};

confirmApproveBtn.onclick = async () => {
  const floorId = floorSelect.value;

  if (!floorId) {
    alert("Please select a floor.");
    return;
  }

  confirmApproveBtn.disabled = true;
  confirmApproveBtn.textContent = "Approving...";

  try {
    // 1️⃣ Update user role
    await updateDoc(doc(db, "users", selectedMerchantUid), {
      role: ROLES.ADMIN,
      approvedAt: serverTimestamp(),
    });

    // 2️⃣ Create shop with floorId
    await setDoc(doc(collection(db, "shops")), {
      ownerId: selectedMerchantUid,
      name: "New Shop",
      status: "active",
      floorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // 🔔 Notify merchant
    await notifyUser(selectedMerchantUid, {
      type: "MERCHANT_APPROVED",
      title: "Merchant Approved",
      message:
        "Your merchant request has been approved. You can now manage your shop.",
      link: "/public/admin/Admin-Dashboard.html",
    });

    // 3️⃣ Log action
    await logEvent(
      "MERCHANT_APPROVED",
      "Merchant approved and floor assigned",
      selectedMerchantUid
    );

    floorModal.classList.add("hidden");
    floorModal.classList.remove("flex");
  } catch (err) {
    alert("Approval failed. Please try again.");
  } finally {
    confirmApproveBtn.disabled = false;
    confirmApproveBtn.textContent = "Approve & Assign";
    selectedMerchantUid = null;
  }
};

// ================= INIT =================
listenPendingMerchants();
