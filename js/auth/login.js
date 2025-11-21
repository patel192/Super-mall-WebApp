/* ========================================
   NORMAL LOGIN LOGIC (EMAIL + PASSWORD)
======================================== */
import {db,auth} from "../firebase-config.js"
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDoc,doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM Access
const loginBtn = document.getElementById("loginBtn");


loginBtn.addEventListener("click",async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

   if(!email || !password){
    alert("Please enter email and password");
    return;
   }
   try{
     const userCred = await signInWithEmailAndPassword(auth,email,password);
     const uid = userCred.user.uid;

    //  fething user role
    const userDoc = await getDoc(doc(db,"users",uid));
    if(!userDoc.exists()){
        alert("User data not found!");
        return;
    }

    const userData = userDoc.data();
    alert("Login Successful! Welcome");

    if(userData.role === "shopOwner"){
        window.location.href = "Admin-Dashboard.html";
    }else if(userData.role === "customer"){
        window.location.href = "User-Dashboard.html";
    }else{
        window.location.href = "index.html"
    }
   }catch(err){
    console.error("Login Error:",err);
    alert("Invalid email and password");
   }
});
