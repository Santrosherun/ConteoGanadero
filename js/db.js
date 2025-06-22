// const Dexie = window.Dexie;

// export const db = new Dexie('ganadoDB');

// db.version(1).stores({
//   animales: '++id, codigo, tipo, fechaNacimiento, edadEnMeses, esTernero, tiempoAmamantado, numeroDePartos, intervaloParto'
// });

// // Funciones básicas
// export const agregarAnimal = async (animal) => {
//     try {
//         return await db.animales.add(animal);
//     } catch (error) {
//         console.error('Error (AGREGAR):', error);
//         throw error;
//     }
// };

// export const obtenerAnimales = async () => {
//     try {
//         return await db.animales.toArray();
//     } catch (error) {
//         console.error('Error (OBTENER):', error);
//         throw error;
//     }
// };

// export const eliminarAnimal = async (id) => {
//     try {
//         return await db.animales.delete(id);
//     } catch (error) {
//         console.error('Error (ELIMINAR):', error);
//         throw error;
//     }
// };

// export const actualizarAnimal = async (id, cambios) => {
//     try {
//         return await db.animales.update(id, cambios);
//     } catch (error) {
//         console.error('Error (ACTUALIZAR):', error);
//         throw error;
//     }
// };

import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db }               from "./firebase-config.js";

export async function agregarAnimal(animal) {
  const colRef = collection(db, "animales");
  const docRef = await addDoc(colRef, animal);
  console.log("Animal agregado con ID:", docRef.id);
}

export function obtenerAnimales(callback) {
  const colRef = collection(db, "animales");
  // onSnapshot emite en tiempo real y funciona offline
  return onSnapshot(colRef, (snapshot) => {
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(lista);
  });
}

export async function actualizarAnimal(id, cambios) {
  const docRef = doc(db, "animales", id);
  await updateDoc(docRef, cambios);
  console.log("Animal actualizado:", id);
}

export async function eliminarAnimal(id) {
  const docRef = doc(db, "animales", id);
  await deleteDoc(docRef);
  console.log("Animal eliminado:", id);
}