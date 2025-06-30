import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db }               from "./firebase-config.js";

export async function agregarAnimal(uid, animal) {
  const colRef = collection(db, "usuarios", uid, "animales");
  const docRef = await addDoc(colRef, animal);
  console.log("Animal agregado con ID:", docRef.id);
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
  const docRef = doc(db, "usuarios", uid, "animales", id);
  await updateDoc(docRef, cambios);
  console.log("Animal actualizado:", id);
}

export async function eliminarAnimal(uid, id) {
  const docRef = doc(db, "usuarios", uid, "animales", id);
  await deleteDoc(docRef);
  console.log("Animal eliminado:", id);
}