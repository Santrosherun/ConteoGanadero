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
export async function login(email, password) {
    try {
        const credenciales = await signInWithEmailAndPassword(auth, email, password);
        console.log("Sesión iniciada:", credenciales.user.uid);
        return credenciales.user;
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
    }
}

// Cerrar sesión
export async function cerrarSesion() {
    try {
        await signOut(auth);
        console.log("Sesión cerrada");
    } catch (error) {
        console.error("Error cerrando sesión:", error);
    }
}

// Escuchar cambios de sesión
export function observarUsuario(callback, onError = console.error) {
    try {
        onAuthStateChanged(auth, callback, onError);
    } catch (error) {
        console.error("Error observando sesión:", error);
        onError("No se pudo observar el estado de sesión.");
    }
}
