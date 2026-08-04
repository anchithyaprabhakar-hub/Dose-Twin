import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0rzSDoSaQ5PtciiylwTIc7hOpdHE1yf4",
  authDomain: "dosetwin.firebaseapp.com",
  projectId: "dosetwin",
  storageBucket: "dosetwin.firebasestorage.app",
  messagingSenderId: "547350072591",
  appId: "1:547350072591:web:91b4895cdbe52e2c2d427a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;