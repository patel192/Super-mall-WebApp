// ================= FIREBASE =================
import { db } from "../firebase-config.js";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= CONSTANTS =================
export const NOTIFICATION_TYPES = Object.freeze({
  // Merchant / Admin
  SHOP_APPROVED: "SHOP_APPROVED",
  SHOP_SUSPENDED: "SHOP_SUSPENDED",
  PRODUCT_CREATED: "PRODUCT_CREATED",
  PRODUCT_TRENDING: "PRODUCT_TRENDING",

  OFFER_CREATED: "OFFER_CREATED",
  OFFER_ACTIVATED: "OFFER_ACTIVATED",
  OFFER_EXPIRING: "OFFER_EXPIRING",
  OFFER_EXPIRED: "OFFER_EXPIRED",
  OFFER_PAUSED: "OFFER_PAUSED",

  // User
  NEW_OFFER: "NEW_OFFER",
  PRICE_DROP: "PRICE_DROP",
  BEST_DEAL: "BEST_DEAL",

  // System
  MERCHANT_REQUESTED: "MERCHANT_REQUESTED",
  MERCHANT_APPROVED: "MERCHANT_APPROVED",
  MERCHANT_REJECTED: "MERCHANT_REJECTED",
});

// ================= CORE CREATOR =================
async function createNotification({
  targetRole,
  targetUid = null,
  type,
  title,
  message,
  link = null,
  entityType = null,
  entityId = null,
}) {
  if (!targetRole || !type || !title || !message) {
    console.warn("Invalid notification payload", {
      targetRole,
      type,
      title,
      message,
    });
    return;
  }

  try {
    await addDoc(collection(db, "notifications"), {
      targetRole,
      targetUid,           // null → role-wide
      type,

      title,
      message,
      link,

      entityType,
      entityId,

      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}

// ================= ROLE HELPERS =================

// 🔔 Notify specific user
export function notifyUser(uid, payload) {
  return createNotification({
    ...payload,
    targetRole: "user",
    targetUid: uid,
  });
}

// 🔔 Notify merchant/admin
export function notifyAdmin(uid, payload) {
  return createNotification({
    ...payload,
    targetRole: "admin",
    targetUid: uid,
  });
}

// 🔔 Notify super admin
export function notifySuperAdmin(payload) {
  return createNotification({
    ...payload,
    targetRole: "super_admin",
    targetUid: null,
  });
}

// 🔔 Broadcast to all users of a role
export function notifyRole(role, payload) {
  return createNotification({
    ...payload,
    targetRole: role,
    targetUid: null,
  });
}

// ================= PRESET EVENTS =================

// Merchant approved
export function notifyMerchantApproved(uid) {
  return notifyUser(uid, {
    type: NOTIFICATION_TYPES.MERCHANT_APPROVED,
    title: "Merchant Approved",
    message: "Your merchant request has been approved. Welcome to SuperMall!",
    link: "/admin/Admin-Dashboard.html",
  });
}

// Offer expiring soon
export function notifyOfferExpiring(adminUid, offerId, offerTitle) {
  return notifyAdmin(adminUid, {
    type: NOTIFICATION_TYPES.OFFER_EXPIRING,
    title: "Offer Expiring Soon",
    message: `Your offer "${offerTitle}" is expiring soon.`,
    link: "/admin/Offers.html",
    entityType: "offer",
    entityId: offerId,
  });
}

// New offer for users
export function notifyNewOfferToUsers(offerId, title) {
  return notifyRole("user", {
    type: NOTIFICATION_TYPES.NEW_OFFER,
    title: "New Offer Available",
    message: title,
    link: `/user/Offers.html?offer=${offerId}`,
    entityType: "offer",
    entityId: offerId,
  });
}
