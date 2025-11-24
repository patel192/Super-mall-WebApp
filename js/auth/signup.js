// ---------- FIREBASE IMPORTS ----------
import { db, auth, provider } from "../firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ======================================================
// SIGNUP STEPS LOGIC
// ======================================================
const steps = [
  document.getElementById("step1"),
  document.getElementById("step2"),
  document.getElementById("step3"),
];

const dots = [
  document.getElementById("dot1"),
  document.getElementById("dot2"),
  document.getElementById("dot3"),
];

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

dots.forEach((dot) => {
  dot.addEventListener("click", () => showStep(parseInt(dot.dataset.step)));
});

// ======================================================
// EMAIL/PASSWORD SIGNUP
// ======================================================

const finishBtn = document.getElementById("finish");

finishBtn.addEventListener("click", async () => {
  // Step 1
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirmPassword")
    .value.trim();

  // Step 2
  const phoneNumber = document.getElementById("phone").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const pincode = document.getElementById("pincode").value.trim();
  const streetAddress = document.getElementById("street").value.trim();

  // Step 3
  const role = document.getElementById("role").value.trim();
  const terms = document.getElementById("terms").checked;

  // Validations
  if (!fullName || !email || !password || !confirmPassword)
    return alert("Fill all personal details.");

  if (password.length < 6)
    return alert("Password must be minimum 6 characters.");

  if (password !== confirmPassword) return alert("Passwords do not match.");

  if (!phoneNumber || !city || !state || !pincode || !streetAddress)
    return alert("Fill all address details.");

  if (!role) return alert("Select your role.");

  if (!terms) return alert("You must agree to terms & conditions.");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    const userData = {
      fullName,
      email,
      phoneNumber,
      role,
      address: {
        city,
        state,
        pincode,
        streetAddress,
      },
      createdAt: new Date().toISOString(),
      provider: "email",
    };

    await setDoc(doc(db, "users", uid), userData);

    alert("Account created successfully!");
    switchToLogin();
  } catch (err) {
    alert("Signup Error: " + err.message);
  }
});

// ======================================================
// GOOGLE SIGNUP 
// ======================================================

const googleBtn = document.querySelectorAll("#googleBtn");

googleBtn.forEach((btn) => {
  btn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          fullName: user.displayName || "Unknown User",
          email: user.email,
          photoURL: user.photoURL || "",
          provider: "google",
          role: "customer",
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      alert("Google Signup successful!");
      switchToLogin();
    } catch (err) {
      alert("Google Signup Error: " + err.message);
    }
  });
});

// ======================================================
// SIGNUP <-> LOGIN MODE SWITCH
// ======================================================

const wrapper = document.getElementById("authWrapper");
const toggleAuth = document.getElementById("toggleAuth");
const sub = document.querySelector(".sub");
const signupContainer = document.getElementById("signupContainer");
const loginContainer = document.getElementById("loginContainer");
const authTitle = document.getElementById("authTitle");
const body = document.body;


function switchToLogin() {
  wrapper.classList.add("login-mode");
  signupContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");

  authTitle.textContent = "Welcome Back!";
  toggleAuth.textContent = "Signup";
  sub.style.marginLeft = "40px";

  // FIXED
  body.style.background = "linear-gradient(170deg, #ffffff, #141c4c)";
}

function switchToSignup() {
  wrapper.classList.remove("login-mode");
  signupContainer.classList.remove("hidden");
  loginContainer.classList.add("hidden");

  authTitle.textContent = "Create Your Account!";
  toggleAuth.textContent = "Login";
  body.style.background = "linear-gradient(170deg, #ffffff, #671ae3)";
}

toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();
  const isLogin = wrapper.classList.contains("login-mode");
  isLogin ? switchToSignup() : switchToLogin();
});

// ======================================================
// AUTO SWITCH IF URL CONTAINS ?mode=login
// ======================================================

const params = new URLSearchParams(window.location.search);
if (params.get("mode") === "login") {
  switchToLogin();
}
