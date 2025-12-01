// js/admin-messages.js
import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---------------------------------------------------
   Helper: Switch visible part
--------------------------------------------------- */
function setActiveMessagesPart(key) {
  document.querySelectorAll(".messages-part").forEach((p) =>
    p.classList.remove("messages-part-active")
  );

  const active = document.querySelector(
    `.messages-part[data-messages-part="${key}"]`
  );

  if (active) active.classList.add("messages-part-active");
}

/* ---------------------------------------------------
   EXPORT: MASTER LOADER
--------------------------------------------------- */
export async function loadMessages(key = "inbox") {
  setActiveMessagesPart(key);

  if (key === "inbox") loadInboxMessages();
  if (key === "tickets") loadSupportTickets();
  if (key === "unread") loadUnreadMessages();
  if (key === "spam") loadSpamMessages();
}

/* ---------------------------------------------------
   1. INBOX
--------------------------------------------------- */
async function loadInboxMessages() {
  const container = document.getElementById("messages-inbox");
  const empty = document.getElementById("messages-empty");

  container.innerHTML = "Loading…";
  empty.style.display = "none";

  try {
    const snap = await getDocs(
      query(collection(db, "messages"), orderBy("timestamp", "desc"))
    );

    container.innerHTML = "";
    if (snap.empty) {
      empty.textContent = "Inbox empty.";
      empty.style.display = "block";
      return;
    }

    snap.forEach((doc) => {
      const m = doc.data();
      container.innerHTML += buildMessageCard(m, "inbox");
    });
  } catch (err) {
    console.error("❌ Error loading inbox:", err);
    container.innerHTML = "Failed to load inbox.";
  }
}

/* ---------------------------------------------------
   2. SUPPORT TICKETS
--------------------------------------------------- */
async function loadSupportTickets() {
  const container = document.getElementById("messages-tickets");
  const empty = document.getElementById("messages-empty");

  container.innerHTML = "Loading…";
  empty.style.display = "none";

  try {
    const snap = await getDocs(
      query(collection(db, "messages"), where("type", "==", "ticket"))
    );

    container.innerHTML = "";
    if (snap.empty) {
      empty.textContent = "No support tickets found.";
      empty.style.display = "block";
      return;
    }

    snap.forEach((doc) => {
      const m = doc.data();
      container.innerHTML += buildMessageCard(m, "tickets");
    });
  } catch (err) {
    container.innerHTML = "Error loading tickets.";
  }
}

/* ---------------------------------------------------
   3. UNREAD
--------------------------------------------------- */
async function loadUnreadMessages() {
  const container = document.getElementById("messages-unread");
  const empty = document.getElementById("messages-empty");

  container.innerHTML = "Loading…";
  empty.style.display = "none";

  try {
    const snap = await getDocs(
      query(collection(db, "messages"), where("read", "==", false))
    );

    container.innerHTML = "";
    if (snap.empty) {
      empty.textContent = "No unread messages.";
      empty.style.display = "block";
      return;
    }

    snap.forEach((doc) => {
      const m = doc.data();
      container.innerHTML += buildMessageCard(m, "unread");
    });
  } catch (err) {
    container.innerHTML = "Error loading unread messages.";
  }
}

/* ---------------------------------------------------
   4. SPAM
--------------------------------------------------- */
async function loadSpamMessages() {
  const container = document.getElementById("messages-spam");
  const empty = document.getElementById("messages-empty");

  container.innerHTML = "Loading…";
  empty.style.display = "none";

  try {
    const snap = await getDocs(
      query(collection(db, "messages"), where("spam", "==", true))
    );

    container.innerHTML = "";
    if (snap.empty) {
      empty.textContent = "No spam messages.";
      empty.style.display = "block";
      return;
    }

    snap.forEach((doc) => {
      const m = doc.data();
      container.innerHTML += buildMessageCard(m, "spam");
    });
  } catch (err) {
    container.innerHTML = "Error loading spam.";
  }
}

/* ---------------------------------------------------
   Helper: Build Message Card HTML
--------------------------------------------------- */
function buildMessageCard(m, type) {
  return `
    <div class="message-card">
      <div class="message-title">${m.subject || "No subject"}</div>
      <div class="message-meta">
        ${m.email || "Unknown"} • ${m.timestamp || ""}
      </div>
      <div class="message-body">${m.message || "No content available."}</div>
      <span class="msg-tag ${type}">${type}</span>
    </div>
  `;
}
