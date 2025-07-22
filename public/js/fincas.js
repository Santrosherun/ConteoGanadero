// js/fincas.js

import {
  AgregarFinca,
  EditarFinca,
  EliminarFinca,
  ObservarFincas,
  establecerFincaActiva
} from './fincasService.js';

import { observarUsuario } from './auth.js';
import { mostrarFincaActiva } from './utils.js';

let usuarioActivo = null;
let fincasGuardadas = [];

export function inicializarFincas() {
  const form = document.getElementById('formFinca');
  const lista = document.getElementById('listaFincas');

  if (!form || !lista) {
    console.warn("Formulario o lista no encontrados en el DOM");
    return;
  }

  // Esperar autenticación y observar cambios en fincas
  observarUsuario(usuario => {
    if (!usuario) return;
    usuarioActivo = usuario;

    ObservarFincas(usuario.uid, fincas => {
      fincasGuardadas = fincas;
      renderizarListaFincas(fincas);
    });
  });

  // Enviar formulario
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = form.nombreFinca.value.trim();
    const idFinca = form.fincaId.value;

    if (!nombre || !usuarioActivo) return;

    // Validar nombre repetido (ignorando mayúsculas y espacios)
    const nombreNormalizado = nombre.toLowerCase();
    const nombreYaExiste = fincasGuardadas.some(f =>
      f.nombre.toLowerCase() === nombreNormalizado && f.id !== idFinca
    );

    if (nombreYaExiste) {
      alert('Ya existe una finca con ese nombre');
      return;
    }

    if (idFinca) {
      await EditarFinca(usuarioActivo.uid, idFinca, { nombre });
    } else {
      await AgregarFinca(usuarioActivo.uid, { nombre });
    }

    form.reset();
  });

  // editar y eliminar
  lista.addEventListener('click', async e => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('btn-edit')) {
      const finca = fincasGuardadas.find(f => f.id === id);
      if (!finca) return;
      form.fincaId.value = finca.id;
      form.nombreFinca.value = finca.nombre;
    }

    if (e.target.classList.contains('btn-delete')) {
      if (confirm('¿Eliminar esta finca?')) {
        await EliminarFinca(usuarioActivo.uid, id);
      }
    }

    if (e.target.classList.contains('btn-set-active')) {
      establecerFincaActiva(id, fincasGuardadas);
      renderizarListaFincas(fincasGuardadas);
      const nombreFincaActiva = localStorage.getItem('fincaActivaNombre');
      mostrarFincaActiva(nombreFincaActiva);
    }
  });
}

function renderizarListaFincas(fincas) {
  const lista = document.getElementById('listaFincas');
  lista.innerHTML = '';

  const fincaActivaId = localStorage.getItem('fincaActiva');

  fincas.forEach(({ id, nombre }) => {
    const div = document.createElement('div');
    const esActiva = id === fincaActivaId;

    div.innerHTML = `
      <p>${nombre} ${esActiva ? '<strong>(Activa)</strong>' : ''}</p>
      <button data-id="${id}" class="btn-set-active">✅</button>
      <button data-id="${id}" class="btn-edit">✏️</button>
      <button data-id="${id}" class="btn-delete">🗑️</button>
    `;
    lista.appendChild(div);
  });
}
