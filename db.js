const Dexie = window.Dexie;

export const db = new Dexie('ganadoDB');

db.version(1).stores({
  animales: '++id, nombre, raza, edad, peso'
});

// Funciones básicas
export const agregarAnimal = async (animal) => {
  return await db.animales.add(animal);
};

export const obtenerAnimales = async () => {
  return await db.animales.toArray();
};

export const eliminarAnimal = async (id) => {
  return await db.animales.delete(id);
};

export const actualizarAnimal = async (id, cambios) => {
  return await db.animales.update(id, cambios);
};
