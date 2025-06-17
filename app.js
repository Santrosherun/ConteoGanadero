import {
    agregarAnimal,
    obtenerAnimales,
    eliminarAnimal,
    actualizarAnimal
} from './db.js';

const form = document.getElementById('form-animal');
const lista = document.getElementById('lista-animales');
let editandoId = null;

// Calcula edad en meses a partir de fecha ISO
const calcularEdadEnMeses = fechaISO => {
    const n = new Date(fechaISO), h = new Date();
    const años  = h.getFullYear() - n.getFullYear();
    const meses = h.getMonth() - n.getMonth();
    return años * 12 + meses;
};

const renderAnimales = async () => {
    const animales = await obtenerAnimales();
    lista.innerHTML = '';

    animales.forEach(animal => {
        const li = document.createElement('li');
        li.innerHTML = `
        <strong>${animal.codigo}</strong> (ID interno: ${animal.id}) — ${animal.tipo} — ${animal.edadEnMeses} meses
        ${animal.esTernero
            ? `(Amamantado: ${animal.tiempoAmamantado} meses)`
            : `(Partos: ${animal.numeroDePartos}, intervalos: ${animal.intervaloParto || []})`
        }
        <button data-id="${animal.id}" class="editar">Editar</button>
        <button data-id="${animal.id}" class="eliminar">Eliminar</button>
        `;
        lista.appendChild(li);
    });

    // Asignar eventos a los botones
    //ELIMINAR
    lista.querySelectorAll('.eliminar').forEach(btn =>
    btn.addEventListener('click', async (e) => {
        const id = parseInt(e.target.dataset.id);
        await eliminarAnimal(id);
        renderAnimales();
        })
    );
    //EDITAR
    document.querySelectorAll('.editar').forEach(btn =>
    btn.addEventListener('click', async (e) => {
        const id = parseInt(e.target.dataset.id);
        const animales = await obtenerAnimales();
        const animal = animales.find(a => a.id === id);
        if (!animal) return;
        // Llenar el form
        document.getElementById('codigo').value = animal.codigo;
        document.getElementById('tipo').value = animal.tipo;
        document.getElementById('fechaNacimiento').value = animal.fechaNacimiento;
        if (animal.esTernero) {
            document.getElementById('tiempoAmamantado').value = animal.tiempoAmamantado;
        } else if (animal.tipo === 'hembra') {
            document.getElementById('numeroPartos').value     = animal.numeroDePartos;
            document.getElementById('intervalosParto').value  = (animal.intervaloParto || []).join(', ');
        }
        editandoId = id;
        
      })
    );
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Leer Campos //AGREGAR MAS POSTERIORMENTE 
    const codigo = document.getElementById('codigo').value.trim() || 'SIN-CODIGO';
    const tipo = document.getElementById('tipo').value;
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    const edadEnMeses = calcularEdadEnMeses(fechaNacimiento);
    const esTernero = edadEnMeses < 12;

    const tiempoAmamantado = esTernero
        ? parseInt(document.getElementById('tiempoAmamantado').value) || 0
        : null;

    const numeroDePartos = (!esTernero && tipo === 'hembra')
        ? parseInt(document.getElementById('numeroPartos').value) || 0
        : null;

    const intervaloParto = (!esTernero && tipo === 'hembra')
        // ESTO NO LO ENTIENDO DEL TODO
        ? document.getElementById('intervalosParto').value
            .split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n))
        : null;

    const nuevoAnimal = {
        codigo,
        tipo,
        fechaNacimiento,
        edadEnMeses,
        esTernero,
        tiempoAmamantado,
        numeroDePartos,
        intervaloParto
    };
    
    // ACTUALIZAR
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
