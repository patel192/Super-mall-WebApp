import { db } from "../firebase-config.js";
import {
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM elements
const totalUsersEl = document.getElementById("kpiTotalUsers");
const merchantsEl = document.getElementById("kpiMerchants");
const pendingEl = document.getElementById("kpiPending");
const rejectedEl = document.getElementById("kpiRejected");

// Collection ref
const usersRef = collection(db, "users");

// ================= TOTAL USERS =================
onSnapshot(usersRef, (snapshot) => {
  totalUsersEl.textContent = snapshot.size;
});

// ================= APPROVED MERCHANTS =================
onSnapshot(
  query(usersRef, where("role", "==", "admin")),
  (snapshot) => {
    merchantsEl.textContent = snapshot.size;
  }
);

// ================= PENDING MERCHANT REQUESTS =================
onSnapshot(
  query(usersRef, where("role", "==", "merchant_pending")),
  (snapshot) => {
    pendingEl.textContent = snapshot.size;
  }
);

// ================= REJECTED MERCHANTS =================
onSnapshot(
  query(usersRef, where("role", "==", "rejected")),
  (snapshot) => {
    rejectedEl.textContent = snapshot.size;
  }
);
