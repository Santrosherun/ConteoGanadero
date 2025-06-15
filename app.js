import {
  agregarAnimal,
  obtenerAnimales,
  eliminarAnimal,
  actualizarAnimal
} from './db.js';

const form = document.getElementById('form-animal');
const lista = document.getElementById('lista-animales');

let editandoId = null;

const renderAnimales = async () => {
  const animales = await obtenerAnimales();
  lista.innerHTML = '';

  animales.forEach(animal => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${animal.nombre} (${animal.raza}) - Edad: ${animal.edad}, Peso: ${animal.peso}kg
      <button data-id="${animal.id}" class="editar">Editar</button>
      <button data-id="${animal.id}" class="eliminar">Eliminar</button>
    `;
    lista.appendChild(li);
  });

  // Asignar eventos a los botones
  document.querySelectorAll('.eliminar').forEach(btn =>
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.target.dataset.id);
      await eliminarAnimal(id);
      renderAnimales();
    })
  );

  document.querySelectorAll('.editar').forEach(btn =>
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.target.dataset.id);
      const animales = await obtenerAnimales();
      const animal = animales.find(a => a.id === id);

      if (animal) {
        document.getElementById('nombre').value = animal.nombre;
        document.getElementById('raza').value = animal.raza;
        document.getElementById('edad').value = animal.edad;
        document.getElementById('peso').value = animal.peso;
        editandoId = id;
      }
    })
  );
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nuevoAnimal = {
    nombre: document.getElementById('nombre').value,
    raza: document.getElementById('raza').value,
    edad: parseInt(document.getElementById('edad').value),
    peso: parseFloat(document.getElementById('peso').value)
  };

  if (editandoId !== null) {
    await actualizarAnimal(editandoId, nuevoAnimal);
    editandoId = null;
  } else {
    await agregarAnimal(nuevoAnimal);
  }

  form.reset();
  renderAnimales();
});

document.addEventListener('DOMContentLoaded', renderAnimales);
