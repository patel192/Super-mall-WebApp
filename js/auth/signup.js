
// ----------FIREBASE INTEGRATION FOR SIGNUP LOGIC----------
import { db, auth } from "../firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* -----------------------------
EXISTING SIGNUP STEP LOGIC
------------------------------ */

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

let currentStep = 0;

function showStep(index) {
  steps.forEach((step) => step.classList.remove("active-step"));
  dots.forEach((dot) => dot.classList.remove("active"));

  steps[index].classList.add("active-step");
  dots[index].classList.add("active");

  currentStep = index;
}

document.getElementById("next1").onclick = () => showStep(1);
document.getElementById("next2").onclick = () => showStep(2);
document.getElementById("back1").onclick = () => showStep(0);
document.getElementById("back2").onclick = () => showStep(1);

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showStep(parseInt(dot.getAttribute("data-step")));
  });
});


//    Signup Logic
const finishBtn = document.getElementById("finish");

finishBtn.addEventListener("click", async () => {
  //   Dom Elements Access
  // STEP 1
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirmPassword")
    .value.trim();
  // STEP 2
  const phoneNumber = document.getElementById("phone").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const pincode = document.getElementById("pincode").value.trim();
  const streetAddress = document.getElementById("street").value.trim();
  // STEP 3
  const role = document.getElementById("role").value.trim();
  const terms = document.getElementById("terms").checked;

  // validation
  if (!fullName || !email || !password || !confirmPassword) {
    alert("Please fill all personal details.");
    return;
  }
  if (password.length < 6) {
    alert("Password must be at least 6 characters Long.");
    return;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }
  if (!phoneNumber || !city || !state || !pincode || !streetAddress) {
    alert("Please fill all address details.");
    return;
  }
  if (!role) {
    alert("Please select a role.");
    return;
  }
  if (!terms) {
    alert("You must agree the terms and conditions.");
    return;
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const userData = {
      fullName,
      email,
      password,
      phoneNumber,
      address: {
        city,
        state,
        pincode,
        streetAddress,
      },
      role,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", uid), userData);
    alert("Account created Successfully");
  } catch (err) {
    alert("Error creating account: " + err.message);
  }
});

/* --------------------------------------
        NEW: SIGNUP <-> LOGIN SLIDE SWITCH
    --------------------------------------- */

const wrapper = document.getElementById("authWrapper");
const toggleAuth = document.getElementById("toggleAuth");
const sub = document.querySelector(".sub");
const signupContainer = document.getElementById("signupContainer");
const loginContainer = document.getElementById("loginContainer");

const authTitle = document.getElementById("authTitle");
const body = document.body;

toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();

  const isLogin = wrapper.classList.toggle("login-mode");

  if (isLogin) {
    signupContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
    toggleAuth.textContent = "Signup";
    authTitle.textContent = "Welcome Back!";
    sub.style.marginLeft = "30px";
    body.style.background = "linear-gradient(170deg, #ffffff, #1b245d)";
  } else {
    signupContainer.classList.remove("hidden");
    loginContainer.classList.add("hidden");
    toggleAuth.textContent = "Login";
    authTitle.textContent = "Create Your Account";
    sub.style.marginLeft = "25px";
    body.style.background = "linear-gradient(170deg, #ffffff, #2d2e41)";
  }
});
