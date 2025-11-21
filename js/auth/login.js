/* ========================================
   NORMAL LOGIN LOGIC (EMAIL + PASSWORD)
======================================== */
import { db, auth } from "../firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDoc,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { provider } from "../firebase-config.js";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// DOM Access
const loginBtn = document.getElementById("loginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");

// google login
googleLoginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log(result);
    const user = result.user;
    console.log(user);
    const userRef = doc(db, "users", user.uid);
    console.log(userRef);
    const userSnap = await getDoc(userRef);
    console.log(userSnap);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        fullName: user.displayName || "Unknown User",
        email: user.email,
        provider: "google",
        role: "customer", // default role
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
      });
    }

    alert("Logged in with google");

    const data = (await getDoc(userRef)).data();

    if (data.role === "shopOwner") {
      window.location.href = "Admin-Dashboard.html";
    } else {
      window.location.href = "User-Dashboard.html";
    }
  } catch (err) {
    console.error("Google Login error:", err);
    alert("Google login failed: " + err.message);
  }
});

// normal Login
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    //  fething user role
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      alert("User data not found!");
      return;
    }

    const userData = userDoc.data();
    alert("Login Successful! Welcome");

    if (userData.role === "shopOwner") {
      window.location.href = "Admin-Dashboard.html";
    } else if (userData.role === "customer") {
      window.location.href = "User-Dashboard.html";
    } else {
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error("Login Error:", err);
    alert("Invalid email and password");
  }
});
