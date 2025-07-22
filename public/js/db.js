import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db }               from "./firebase-config.js";

export async function agregarAnimal(uid, fincaId, animal) {
  try {
    const colRef = collection(db, "usuarios", uid, "fincas", fincaId, "animales");
    const docRef = await addDoc(colRef, animal);
    console.log("Animal agregado con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al agregar animal:", error);
  }
}

export function obtenerAnimales(uid, fincaId, callback) {
  const colRef = collection(db, "usuarios", uid, "fincas", fincaId, "animales");
  return onSnapshot(colRef, (snapshot) => {
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(lista);
  }, (error) => {
    console.error("Error observando animales:", error);
  });
}

export async function actualizarAnimal(uid, fincaId, idAnimal, cambios) {
  try {
    const docRef = doc(db, "usuarios", uid, "fincas", fincaId, "animales", idAnimal);
    await updateDoc(docRef, cambios);
    console.log("Animal actualizado:", idAnimal);
  } catch (error) {
    console.error("Error al actualizar animal:", error);
  }
}

export async function eliminarAnimal(uid, fincaId, idAnimal) {
  try {
    const docRef = doc(db, "usuarios", uid, "fincas", fincaId, "animales", idAnimal);
    await deleteDoc(docRef);
    console.log("Animal eliminado:", idAnimal);
  } catch (error) {
    console.error("Error al eliminar animal:", error);
  }
}