// ================= FIREBASE =================
import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= DOM =================
const form = document.getElementById("floorForm");
const table = document.getElementById("floorsTable");

const floorIdInput = document.getElementById("floorId");
const nameInput = document.getElementById("floorName");
const levelInput = document.getElementById("floorLevel");
const descInput = document.getElementById("floorDesc");
const formTitle = document.getElementById("formTitle");

// ================= LOAD FLOORS =================
async function loadFloors() {
  table.innerHTML = "";

  const snap = await getDocs(collection(db, "floors"));

  if (snap.empty) {
    table.innerHTML = `
      <tr>
        <td colspan="4"
            class="px-6 py-10 text-center text-slate-400">
          No floors created
        </td>
      </tr>`;
    return;
  }

  snap.forEach((docSnap) => {
    const floor = docSnap.data();

    const row = document.createElement("tr");
    row.className = "border-t";

    row.innerHTML = `
      <td class="px-6 py-4">${floor.name}</td>
      <td class="px-6 py-4">${floor.level}</td>
      <td class="px-6 py-4">${floor.description || "—"}</td>
      <td class="px-6 py-4 text-right space-x-3">
        <button
          data-edit="${docSnap.id}"
          class="text-blue-600 font-medium">
          Edit
        </button>
        <button
          data-delete="${docSnap.id}"
          class="text-red-600 font-medium">
          Delete
        </button>
      </td>
    `;

    table.appendChild(row);
  });

  attachActions();
}

// ================= CREATE / UPDATE =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    level: Number(levelInput.value),
    description: descInput.value.trim(),
    updatedAt: serverTimestamp()
  };

  if (!payload.name) return;

  if (floorIdInput.value) {
    await updateDoc(
      doc(db, "floors", floorIdInput.value),
      payload
    );
  } else {
    await addDoc(collection(db, "floors"), {
      ...payload,
      createdAt: serverTimestamp()
    });
  }

  resetForm();
  loadFloors();
});

// ================= ACTIONS =================
function attachActions() {
  document.querySelectorAll("[data-edit]").forEach(btn => {
    btn.onclick = () => editFloor(btn.dataset.edit);
  });

  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.onclick = () => deleteFloor(btn.dataset.delete);
  });
}

// ================= EDIT =================
async function editFloor(id) {
  const snap = await getDocs(collection(db, "floors"));

  snap.forEach(docSnap => {
    if (docSnap.id === id) {
      const f = docSnap.data();
      floorIdInput.value = id;
      nameInput.value = f.name;
      levelInput.value = f.level;
      descInput.value = f.description || "";
      formTitle.textContent = "Edit Floor";
    }
  });
}

// ================= DELETE =================
async function deleteFloor(id) {
  if (!confirm("Delete this floor? Shops linked to it may break.")) return;
  await deleteDoc(doc(db, "floors", id));
  loadFloors();
}

// ================= HELPERS =================
function resetForm() {
  form.reset();
  floorIdInput.value = "";
  formTitle.textContent = "Create Floor";
}

// ================= INIT =================
loadFloors();
