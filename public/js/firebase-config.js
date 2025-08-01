// js/firebase-config.js
import { initializeApp }    from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence, 
  collection,
  getDocs,
  query,    
  where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmOSlmqXktW80H6SjNOmHs9zNnWayRm44",
  authDomain: "conteoganadero1.firebaseapp.com",
  projectId: "conteoganadero1",
  storageBucket: "conteoganadero1.appspot.com",
  messagingSenderId: "149645935417",
  appId: "1:149645935417:web:5db30847b4272550fb1ee8",
  measurementId: "G-6QXJXNRRCK"
};

// 1) Inicializa Firebase
export const app = initializeApp(firebaseConfig);

// 2) Inicializa Firestore
export const db = getFirestore(app);

export async function codigoExisteEnFirebase(uid, fincaId, codigo) {
  try {
    const colRef = collection(db, 'usuarios', uid, 'fincas', fincaId, 'animales');
    const q = query(colRef, where('codigo', '==', codigo));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error verificando código en Firebase:", error);
    return false; // o puedes lanzar el error si prefieres manejarlo externamente
  }
}

// 3) Habilita persistencia offline en múltiples pestañas
enableMultiTabIndexedDbPersistence(db)
  .catch((err) => {
    console.warn("No se pudo habilitar persistencia:", err.code);
  });
