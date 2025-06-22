// js/firebase-config.js
import { initializeApp }    from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEl0DGrU5efLGEjXkA7Mx2P__ulBg_gE4",
  authDomain: "conteoganadero1.firebaseapp.com",
  projectId: "conteoganadero1",
  storageBucket: "conteoganadero1.appspot.com",
  messagingSenderId: "149645935417",
  appId: "1:149645935417:web:5db30847b4272550fb1ee8",
  measurementId: "G-6QXJXNRRCK"
};

// 1) Inicializa Firebase
const app = initializeApp(firebaseConfig);

// 2) Inicializa Firestore
export const db = getFirestore(app);

// 3) Habilita persistencia offline en múltiples pestañas
enableMultiTabIndexedDbPersistence(db)
  .catch((err) => {
    console.warn("No se pudo habilitar persistencia:", err.code);
  });
