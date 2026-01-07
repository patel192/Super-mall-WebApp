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

// ================= ROLE CONSTANTS =================
// admin = Merchant
// user  = Customer
const ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});

// ================= LOGGER =================
async function logEvent(type, message, uid = null) {
  try {
    await setDoc(doc(db, "logs", crypto.randomUUID()), {
      type,
      message,
      uid,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Logging failed:", err);
  }
}

// ================= STEP LOGIC =================
const steps = ["step1", "step2", "step3"].map((id) =>
  document.getElementById(id)
);
const dots = ["dot1", "dot2", "dot3"].map((id) => document.getElementById(id));

function showStep(index) {
  steps.forEach((s) => s.classList.remove("active-step"));
  dots.forEach((d) => d.classList.remove("active"));
  steps[index].classList.add("active-step");
  dots[index].classList.add("active");
}

document.getElementById("next1").onclick = () => showStep(1);
document.getElementById("next2").onclick = () => showStep(2);
document.getElementById("back1").onclick = () => showStep(0);
document.getElementById("back2").onclick = () => showStep(1);

// ================= DOM REFERENCES =================
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const phoneInput = document.getElementById("phone");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const pincodeInput = document.getElementById("pincode");
const streetInput = document.getElementById("street");

const roleSelect = document.getElementById("role");
const termsCheckbox = document.getElementById("terms");

// ================= EMAIL SIGNUP =================
document.getElementById("finish").addEventListener("click", async () => {
  try {
    // -------- Step 1 --------
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!fullName || !email || !password || !confirmPassword) {
      throw new Error("Please fill all personal details");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // -------- Step 2 --------
    const phone = phoneInput.value.trim();
    const city = cityInput.value.trim();
    const state = stateInput.value.trim();
    const pincode = pincodeInput.value.trim();
    const street = streetInput.value.trim();

    if (!phone || !city || !state || !pincode || !street) {
      throw new Error("Please fill all address details");
    }

    // -------- Step 3 --------
    const selectedRole = roleSelect.value;

    if (![ROLES.ADMIN, ROLES.USER].includes(selectedRole)) {
      throw new Error("Invalid role selected");
    }

    if (!termsCheckbox.checked) {
      throw new Error("You must accept terms & conditions");
    }

    // -------- Firebase Auth --------
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // -------- Firestore User --------
    await setDoc(doc(db, "users", uid), {
      fullName,
      email,
      role: selectedRole, // admin | user
      phone,
      address: {
        city,
        state,
        pincode,
        street,
      },
      provider: "email",
      createdAt: serverTimestamp(),
    });

    await logEvent("SIGNUP", "Email signup successful", uid);

    alert("Account created successfully!");
    switchToLogin();
  } catch (err) {
    await logEvent("ERROR", err.message);
    alert(err.message);
  }
});

// ================= GOOGLE SIGNUP =================
document.getElementById("googleBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Google users are ALWAYS customers by default
    await setDoc(
      doc(db, "users", user.uid),
      {
        fullName: user.displayName || "Unknown User",
        email: user.email,
        provider: "google",
        role: ROLES.USER,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    await logEvent("GOOGLE_SIGNUP", "Google signup successful", user.uid);

    alert("Google signup successful!");
    switchToLogin();
  } catch (err) {
    await logEvent("ERROR", err.message);
    alert("Google signup failed");
  }
});
// ================= AUTH TOGGLE LOGIC =================
const wrapper = document.getElementById("authWrapper");
const toggleAuth = document.getElementById("toggleAuth");
const signupContainer = document.getElementById("signupContainer");
const loginContainer = document.getElementById("loginContainer");
const authTitle = document.getElementById("authTitle");

// switch to LOGIN view
function switchToLogin() {
  wrapper.classList.add("login-mode");
  signupContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");

  authTitle.textContent = "Welcome Back!";
  toggleAuth.textContent = "Signup";
}

// switch to SIGNUP view
function switchToSignup() {
  wrapper.classList.remove("login-mode");
  signupContainer.classList.remove("hidden");
  loginContainer.classList.add("hidden");

  authTitle.textContent = "Create Your Account";
  toggleAuth.textContent = "Login";
}

// toggle click
toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();

  const isLoginMode = wrapper.classList.contains("login-mode");
  isLoginMode ? switchToSignup() : switchToLogin();
});

// optional: URL support (?mode=login)
const params = new URLSearchParams(window.location.search);
if (params.get("mode") === "login") {
  switchToLogin();
}
