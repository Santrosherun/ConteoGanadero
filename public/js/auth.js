// auth.js
import { app } from './firebase-config.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth(app);

// Registrar nuevo usuario (En un futuro)
// export function registrar(email, password) {
//   return createUserWithEmailAndPassword(auth, email, password);
// }

// Iniciar sesión
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Cerrar sesión
export function cerrarSesion() {
  signOut(auth)
    .then(() => {
      console.log("Sesión cerrada");
    })
    .catch((error) => {
      console.error("Error cerrando sesión:", error);
    });
}

// Escuchar cambios de sesión
export function observarUsuario(callback) {
  onAuthStateChanged(auth, callback);
}
