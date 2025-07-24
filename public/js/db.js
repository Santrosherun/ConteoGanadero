import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

export async function actualizarEstadoAnimal(uid, fincaId, codigo, nuevoEstado) {
  const colRef = collection(db, 'usuarios', uid, 'fincas', fincaId, 'animales');
  const q = query(colRef, where('codigo', '==', codigo));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const docRef = snapshot.docs[0].ref;

  await updateDoc(docRef, {
    estado: nuevoEstado,
    fechaCambioEstado: new Date().toISOString().split('T')[0]
  });
}

export async function obtenerTodosLosAnimales(uid) {
    const fincasSnapshot = await getDocs(collection(db, 'usuarios', uid, 'fincas'));
    const animalesTotales = [];

    for (const fincaDoc of fincasSnapshot.docs) {
        const fincaId = fincaDoc.id;
        const animalesRef = collection(db, 'usuarios', uid, 'fincas', fincaId, 'animales');
        const animalesSnapshot = await getDocs(animalesRef);

        animalesSnapshot.forEach(doc => {
            const animal = doc.data();
            animal.id = doc.id;
            animal.fincaId = fincaId; 
            animalesTotales.push(animal);
        });
    }

    return animalesTotales;
}
