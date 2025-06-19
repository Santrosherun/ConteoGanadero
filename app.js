import {
    agregarAnimal,
    obtenerAnimales,
    eliminarAnimal,
    actualizarAnimal
} from './db.js';

import { calcularEdadMeses, inicializarFormDinamico } from './utils.js';

const form = document.getElementById('form-animal');
const lista = document.getElementById('lista-animales');
let editandoId = null;

const renderAnimales = async () => {
    
    const animales = await obtenerAnimales();
    lista.innerHTML = '';

    animales.forEach(animal => {
        const li = document.createElement('li');
        li.innerHTML = `
        <strong>${animal.codigo} — ${animal.tipo} — ${animal.edadEnMeses} meses
        ${animal.esTernero
            ? `(Amamantado: ${animal.tiempoAmamantado} meses)`
            : `(Partos: ${animal.numeroDePartos}, intervalos: ${animal.intervaloParto || []})`
        }

        <button data-id="${animal.id}" class="editar">Editar</button>
        <button data-id="${animal.id}" class="eliminar">Eliminar</button>
        `;
        lista.appendChild(li);
    });

    // Asignar eventos a los botones
    //ELIMINAR

    try {
        lista.querySelectorAll('.eliminar').forEach(btn =>
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.dataset.id);
            await eliminarAnimal(id);
            renderAnimales();
            })
        );
    } catch (err) {
        alert('Ocurrió un error eliminando el animal.')
    }

    //EDITAR

    try {
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
            inicializarFormDinamico();  
    
            if (animal.esTernero) {
                document.getElementById('tiempoAmamantado').value = animal.tiempoAmamantado;
            } else if (animal.tipo === 'hembra') {
                document.getElementById('numeroPartos').value = animal.numeroDePartos;
                const contenedor = document.getElementById('contenedor-intervalos');
                contenedor.innerHTML = '';
                document.getElementById('numeroPartos').value = animal.numeroDePartos || 0;

                for (let i = 0; i < (animal.numeroDePartos || 0); i++) {
                    const label = document.createElement('label');
                    label.textContent = `Parto ${i + 1}:`;

                    const input = document.createElement('input');
                    input.type = 'date';
                    input.className = 'intervalo';
                    input.value = animal.intervaloParto?.[i] || '';

                    contenedor.appendChild(label);
                    contenedor.appendChild(input);
                    contenedor.appendChild(document.createElement('br'));
                }
            }
            editandoId = id;
            document.getElementById('btn-guardar').textContent = 'Actualizar';
    
          })
        );
    } catch (err) {
        alert('Ocurrió un error obteniendo el animal.')
    }

};

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Leer Campos //AGREGAR MAS POSTERIORMENTE 
    const codigo = document.getElementById('codigo').value.trim() || 'SIN-CODIGO';
    const tipo = document.getElementById('tipo').value;
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    const edadEnMeses = calcularEdadMeses(fechaNacimiento);
    const esTernero = edadEnMeses < 12;

    const tiempoAmamantado = esTernero
        ? parseInt(document.getElementById('tiempoAmamantado').value) || 0
        : null;

    const numeroDePartos = (!esTernero && tipo === 'hembra')
        ? parseInt(document.getElementById('numeroPartos').value) || 0
        : null;

    const intervaloParto = (!esTernero && tipo === 'hembra')
        ? Array.from(document.querySelectorAll('.intervalo')) // múltiples campos con esa clase
            .map(input => input.value)
            .filter(val => val !== '')
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

    try {
        if (editandoId !== null) {
            await actualizarAnimal(editandoId, nuevoAnimal);
            editandoId = null;
        } else {
            await agregarAnimal(nuevoAnimal);
        }
    } catch (err) {
        alert('Ocurrió un error guardando el animal.');
    }


    document.getElementById('btn-guardar').textContent = 'Guardar';
    form.reset();
    inicializarFormDinamico();
    renderAnimales();
});

// Inicializar todo tras cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    inicializarFormDinamico();
    renderAnimales();

});
