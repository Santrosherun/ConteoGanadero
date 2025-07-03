import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db }               from "./firebase-config.js";

export async function agregarAnimal(uid, animal) {
  try {
    const colRef = collection(db, "usuarios", uid, "animales");
    const docRef = await addDoc(colRef, animal);
    console.log("Animal agregado con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al agregar animal:", error);
  }
}

export function obtenerAnimales(uid, callback) {
  const colRef = collection(db, "usuarios", uid, "animales");
  // onSnapshot emite en tiempo real y funciona offline
  return onSnapshot(colRef, (snapshot) => {
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(lista);
  });
}

export async function actualizarAnimal(uid, id, cambios) {
  try {
    const docRef = doc(db, "usuarios", uid, "animales", id);
    await updateDoc(docRef, cambios);
    console.log("Animal actualizado:", id);
  } catch (error) {
    console.error("Error al actualizar animal:", error);
  }
}

export async function eliminarAnimal(uid, id) {
  try {
    const docRef = doc(db, "usuarios", uid, "animales", id);
    await deleteDoc(docRef);
    console.log("Animal eliminado:", id);
  } catch (error) {
    console.error("Error al eliminar animal:", error);
  }
}