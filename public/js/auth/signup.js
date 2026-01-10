// ================= FIREBASE IMPORTS =================
import { db, auth, provider } from "../firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= ROLES =================
const ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

// ================= DOM =================
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

// buttons
document.getElementById("next1").onclick = () => goToStep(2);
document.getElementById("next2").onclick = () => goToStep(3);
document.getElementById("back1").onclick = () => goToStep(1);
document.getElementById("back2").onclick = () => goToStep(2);

// ================= STEP CONTROL =================
function goToStep(step) {
  [step1, step2, step3].forEach((s) => s.classList.add("hidden"));

  if (step === 1) step1.classList.remove("hidden");
  if (step === 2) step2.classList.remove("hidden");
  if (step === 3) step3.classList.remove("hidden");
}

// ================= FORM INPUTS =================
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const phone = document.getElementById("phone");
const city = document.getElementById("city");
const state = document.getElementById("state");
const pincode = document.getElementById("pincode");
const street = document.getElementById("street");

const role = document.getElementById("role");
const terms = document.getElementById("terms");

// ================= EMAIL SIGNUP =================
document.getElementById("finish").addEventListener("click", async () => {
  try {
    // Step 1 validation
    if (!fullName.value || !email.value || password.value.length < 6) {
      throw new Error("Invalid personal details");
    }
    if (password.value !== confirmPassword.value) {
      throw new Error("Passwords do not match");
    }

    // Step 2 validation
    if (!phone.value || !city.value || !state.value || !pincode.value || !street.value) {
      throw new Error("Invalid address details");
    }

    // Step 3 validation
    if (![ROLES.USER, ROLES.ADMIN].includes(role.value)) {
      throw new Error("Invalid role selection");
    }
    if (!terms.checked) {
      throw new Error("Accept terms & conditions");
    }

    const cred = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    await setDoc(doc(db, "users", cred.user.uid), {
      fullName: fullName.value,
      email: email.value,
      role: role.value,
      phone: phone.value,
      address: {
        city: city.value,
        state: state.value,
        pincode: pincode.value,
        street: street.value,
      },
      provider: "email",
      createdAt: serverTimestamp(),
    });

    alert("Account created successfully");
    window.location.href = "/auth.html?mode=login";

  } catch (err) {
    alert(err.message);
  }
});

// ================= GOOGLE SIGNUP =================
document.getElementById("googleBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);

    await setDoc(
      doc(db, "users", result.user.uid),
      {
        fullName: result.user.displayName,
        email: result.user.email,
        role: ROLES.USER,
        provider: "google",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    window.location.href = "/auth.html?mode=login";
  } catch {
    alert("Google signup failed");
  }
});
