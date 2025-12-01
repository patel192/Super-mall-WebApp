import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function setActiveUsersPart(part) {
  document
    .querySelectorAll(".users-part")
    .forEach((p) => p.classList.remove("users-part-active"));

  const active = document.querySelector(
    `.users-part[data-users-part="${part}"]`
  );

  if (active) active.classList.add("users-part-active");
}

/* ------------------------------
   MAIN ENTRY POINT
------------------------------ */
export async function loadUsers(part = "all") {
  setActiveUsersPart(part);

  if (part === "all") loadAllUsers();
  if (part === "roles") loadUserRoles();
  if (part === "active") loadActiveUsers();
  if (part === "verification") loadVerificationRequests();
}

// ======================================================================
// 1.All Users
// ======================================================================

async function loadAllUsers() {
  const container = document.getElementById("users-container");
  const empty = document.getElementById("users-empty");

  container.innerHTML = "Loading...";
  empty.style.display = "none";

  try {
    const userSnapshot = await getDocs(collection(db, "users"));
    container.innerHTML = "";
    if (userSnapshot.empty) {
      empty.textContent = "No Users Found";
      empty.style.display = "block";
      return;
    }
    userSnapshot.forEach((doc) => {
      const u = doc.data();
      container.innerHTML += `
        <div class="user-card">
          <img src="${
            u.photoURL || "https://i.pravatar.cc/150"
          }" class="user-img">
          <div class="user-content">
            <h3>${u.name || u.displayName || "Unnamed User"}</h3>
            <p class="meta">${u.email || "No email"}</p>
            <span class="badge role">${u.role || "User"}</span>
          </div>
        </div>
        `;
    });
  } catch (err) {
    empty.textContent = "Failed to load Users";
    empty.style.display = "block";
  }
}

// =========================================================================
// 2.User Roles
// =========================================================================

async function loadUserRoles() {
  const table = document.getElementById("roles-table");
  table.innerHTML = "<tr><td colspan=`4`>Loading....</td></tr>";

  try {
    const rolesSnapshot = await getDocs(collection(db, "users"));
    table.innerHTML = "";
    rolesSnapshot.forEach((doc) => {
      const u = doc.data();
      table.innerHTML += `        <tr>
          <td>${u.name || "Unnamed User"}</td>
          <td>${u.email || "No email"}</td>
          <td>${u.role || "User"}</td>
          <td>
            <select class="role-select">
              <option>User</option>
              <option>Moderator</option>
              <option>Admin</option>
            </select>
          </td>
        </tr>
       `;
    });
  } catch (err) {
    table.innerHTML = "<tr><td colspan=`4`>Error Loading Roles</td></tr>";
  }
}

// ==========================================================================
// 3.Active Users
// ==========================================================================

async function loadActiveUsers() {
  const list = document.getElementById("active-users-list");
  const empty = document.getElementById("active-users-empty");

  container.innerHTML = "Loading....";
  empty.style.display = "none";

  try {
    const snap = await getDocs(
      query(collection(db, "users"), where("active", "==", "true"))
    );
    container.innerHTML = "";
    if (snap.empty) {
      empty.textContent = "No Active Users Found";
      empty.style.display = "block";
      return;
    }

    snap.forEach((doc) => {
      const u = doc.data();
      container.innerHTML += `
     <div class="user-card">
          <img src="${
            u.photoURL || "https://i.pravatar.cc/150"
          }" class="user-img">
          <div class="user-content">
            <h3>${u.name}</h3>
            <p class="meta">${u.email}</p>
            <span class="badge active">Active now</span>
          </div>
        </div>
     `;
    });
  } catch (err) {
    empty.textContent = "Failed to load active Users";
    empty.style.display = "block";
  }
}

// =============================================================================
// 4.verification Requests
// =============================================================================

async function loadVerificationRequests() {
  const container = document.getElementById("verification-list");
  const empty = document.getElementById("verification-empty");
  container.innerHTML = "Loading....";
  empty.style.display = "none";
  try {
    const snap = await getDocs(
      query(
        collection(db, "users"),
        where("verificationRequested", "==", "true")
      )
    );
    container.innerHTML = "";
    if (snap.empty) {
      empty.textContent = "No Verification Requests Found";
      empty.style.display = "block";
      return;
    }

    snap.forEach((doc) => {
      const u = doc.data();
      container.innerHTML += `
     <div class="user-card verify">
          <img src="${
            u.photoURL || "https://i.pravatar.cc/150"
          }" class="user-img">
          <div class="user-content">
            <h3>${u.name}</h3>
            <p class="meta">${u.email}</p>
            <button class="btn-primary small">Approve</button>
            <button class="btn-delete small">Reject</button>
          </div>
        </div>
     `;
    });
  } catch (err) {
    empty.textContent = "Failed to Load Verification Requests";
    empty.style.display = "block";
  }
}
