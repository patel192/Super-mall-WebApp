// ================= FIREBASE =================
import { auth, db } from "../firebase-config.js";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ================= DOM =================
const notifBtn = document.getElementById("notifBtn");
const notifDropdown = document.getElementById("notifDropdown");
const notifList = document.getElementById("notifList");
const notifBadge = document.getElementById("notifBadge");
const markAllReadBtn = document.getElementById("markAllRead");

// ================= STATE =================
let unsubscribe = null;

// ================= UI HELPERS =================
function toggleDropdown() {
  notifDropdown.classList.toggle("hidden");
}

function closeDropdown(e) {
  if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
    notifDropdown.classList.add("hidden");
  }
}

function renderNotification(docSnap) {
  const n = docSnap.data();

  return `
    <div class="px-4 py-3 hover:bg-slate-50
                ${!n.read ? "bg-slate-50" : ""}">
      <p class="font-medium text-slate-800">
        ${n.title}
      </p>
      <p class="text-xs text-slate-500 mt-0.5">
        ${n.message}
      </p>

      ${
        n.link
          ? `
        <a href="${n.link}"
           data-id="${docSnap.id}"
           class="notif-link inline-block mt-2
                  text-xs text-primary hover:underline">
          View
        </a>
      `
          : ""
      }
    </div>
  `;
}

// ================= MARK READ =================
async function markAsRead(id) {
  await updateDoc(doc(db, "notifications", id), {
    read: true,
  });
}

// ================= INIT LISTENER =================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  // Fetch role
  const userSnap = await getDocs(
    query(collection(db, "users"), where("__name__", "==", user.uid))
  );

  if (userSnap.empty) return;

  const role = userSnap.docs[0].data().role;

  const q = query(
    collection(db, "notifications"),
    where("targetUid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  unsubscribe?.();

  unsubscribe = onSnapshot(q, (snapshot) => {
    notifList.innerHTML = "";
    let unreadCount = 0;

    if (snapshot.empty) {
      notifList.innerHTML = `
        <div class="px-4 py-6 text-center text-slate-400">
          No notifications
        </div>`;
    }

    snapshot.forEach((docSnap) => {
      const n = docSnap.data();

      if (!n.read) unreadCount++;

      notifList.insertAdjacentHTML("beforeend", renderNotification(docSnap));
    });

    if (unreadCount > 0) {
      notifBadge.textContent = unreadCount;
      notifBadge.classList.remove("hidden");
    } else {
      notifBadge.classList.add("hidden");
    }

    attachHandlers();
  });
});

// ================= HANDLERS =================
function attachHandlers() {
  document.querySelectorAll(".notif-link").forEach((link) => {
    link.onclick = async (e) => {
      const id = e.target.dataset.id;
      await markAsRead(id);
    };
  });
}

notifBtn?.addEventListener("click", toggleDropdown);
document.addEventListener("click", closeDropdown);

markAllReadBtn?.addEventListener("click", async () => {
  const snaps = await getDocs(
    query(
      collection(db, "notifications"),
      where("targetUid", "==", auth.currentUser.uid),
      where("read", "==", false)
    )
  );

  const updates = snaps.docs.map((d) => updateDoc(d.ref, { read: true }));

  await Promise.all(updates);
});
