// Import Firebase libraries from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {getAuth,GoogleAuthProvider} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"

const firebaseConfig = {
  apiKey: "AIzaSyDa8SYLQWIwWA6NqYHsnfNGpmlRZNcQ7B0",
  authDomain: "supermall-web-app-ee373.firebaseapp.com",
  projectId: "supermall-web-app-ee373",
  storageBucket: "supermall-web-app-ee373.firebasestorage.app",
  messagingSenderId: "503406748387",
  appId: "1:503406748387:web:f95e30db560b5edffedbd6"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth  = getAuth(app);
export const provider = new GoogleAuthProvider();
console.log("✅ Firebase connected successfully!");
