// js/fincasService.js
import { db } from './firebase-config.js';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let fincaActivaId = null;

export function establecerFincaActiva(id, fincas) {
  fincaActivaId = id;
  localStorage.setItem('fincaActiva', id);
  console.log("Finca activa establecida:", fincaActivaId);

  const finca = fincas.find(f => f.id === id);
  if (finca) {
    localStorage.setItem('fincaActivaNombre', finca.nombre);
  }
}

export function obtenerFincaActiva() {
    return localStorage.getItem('fincaActiva');
}

export async function AgregarFinca(uid, finca) {
  try {
    const colRef = collection(db, 'usuarios', uid, 'fincas');
    const docRef = await addDoc(colRef, finca);
    console.log('Finca agregada con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar finca:', error);
    throw error;
  }
}

export async function ObtenerFincas(uid) {
  try {
    const colRef = collection(db, 'usuarios', uid, 'fincas');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (error) {
    console.error('Error al obtener fincas:', error);
    throw error;
  }
}

export async function EditarFinca(uid, idFinca, datosActualizados) {
  try {
    const docRef = doc(db, 'usuarios', uid, 'fincas', idFinca);
    await setDoc(docRef, datosActualizados, { merge: true });
    console.log('Finca editada:', idFinca);
  } catch (error) {
    console.error('Error al editar finca:', error);
    throw error;
  }
}

export async function EliminarFinca(uid, idFinca) {
  try {
    const docRef = doc(db, 'usuarios', uid, 'fincas', idFinca);
    await deleteDoc(docRef);
    console.log('Finca eliminada:', idFinca);
  } catch (error) {
    console.error('Error al eliminar finca:', error);
    throw error;
  }
}

export function ObservarFincas(uid, callback) {
  const colRef = collection(db, 'usuarios', uid, 'fincas');
  return onSnapshot(colRef, snapshot => {
    const fincas = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    callback(fincas);
  }, error => console.error('Error observando fincas:', error));
}
