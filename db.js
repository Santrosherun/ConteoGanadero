const Dexie = window.Dexie;

export const db = new Dexie('ganadoDB');

db.version(1).stores({
  animales: '++id, codigo, tipo, fechaNacimiento, edadEnMeses, esTernero, tiempoAmamantado, numeroDePartos, intervaloParto'
});

// Funciones básicas
export const agregarAnimal = async (animal) => {
    try {
        return await db.animales.add(animal);
    } catch (error) {
        console.error('Error (AGREGAR):', error)
    }
};

export const obtenerAnimales = async () => {
    try {
        return await db.animales.toArray();
    } catch (error) {
        console.error('Error (OBTENER):', error)
    }
};

export const eliminarAnimal = async (id) => {
    try {
        return await db.animales.delete(id);
    } catch (error) {
        console.error('Error (ELIMINAR):', error)
    }
};

export const actualizarAnimal = async (id, cambios) => {
    try {
        return await db.animales.update(id, cambios);
    } catch (error) {
        console.error('Error (ACTUALIZAR):', error)
    }
};
