import {
    agregarAnimal,
    obtenerAnimales,
    eliminarAnimal,
    actualizarAnimal
} from './db.js';

import { calcularEdadMeses, inicializarFormDinamico, cancelarEdicion } from './utils.js';

const form = document.getElementById('form-animal');
const btnCancelar = document.getElementById('btn-cancelar');
const lista = document.getElementById('lista-animales');
let editandoId = null;

const renderAnimales = async () => {
    
    const animales = await obtenerAnimales(); 
    lista.innerHTML = '';

    animales.forEach(animal => {
        const li = document.createElement('li');
        li.innerHTML = `
        <strong>${animal.codigo} — ${animal.tipo} — ${animal.edadEnMeses} meses</strong><br/>
        ${
            animal.esTernero
                ? `Amamantado: ${animal.tiempoAmamantado} meses`
                : (animal.tipo === 'hembra'
                    ? `Partos: ${animal.numeroDePartos}, Eventos: ${(animal.intervaloParto || []).join(', ')}`
                    : `Adulto sin datos reproductivos (por ahora)`
                )
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

            btnCancelar.style.display = 'inline-block';
            // Quitar resaltado previo
            document.querySelectorAll('#lista-animales li').forEach(li => {
                li.classList.remove('editando');
            });

            // Resaltar el <li> correspondiente al botón clicado
            const liActual = e.target.closest('li');
            if (liActual) {
                liActual.classList.add('editando');
            }

            if (!animal) return;
            // Llenar el formulario
            document.getElementById('codigo').value = animal.codigo;
            document.getElementById('tipo').value = animal.tipo;
            document.getElementById('fechaNacimiento').value = animal.fechaNacimiento;

            // Forzar actualización visual de campos condicionales
            document.getElementById('tipo').dispatchEvent(new Event('change'));
            document.getElementById('fechaNacimiento').dispatchEvent(new Event('change'));

            if (animal.esTernero) {
                document.getElementById('tiempoAmamantado').value = animal.tiempoAmamantado;
            } else if (animal.tipo === 'hembra') {
                document.getElementById('numeroPartos').value = animal.numeroDePartos || 0;

                const contenedor = document.getElementById('contenedor-intervalos');
                contenedor.innerHTML = '';

                for (let i = 0; i < (animal.numeroDePartos || 0); i++) {
                    const label = document.createElement('label');
                    label.textContent = `Parto ${i + 1}:`;

                    const input = document.createElement('input');
                    input.type = 'date';
                    input.className = 'intervalo';
                    input.value = animal.intervaloParto?.[i] || '';
                    input.required = true;

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

btnCancelar.addEventListener('click', () => cancelarEdicion(form, btnCancelar));


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
    // VALIDACIONES POSIBLES (MUY INTRUSIVAS)

    // if (!codigo || !tipo || !fechaNacimiento) {
    // alert('Por favor completa todos los campos obligatorios.');
    // return;
    // }

    // if (esTernero) {
    //     if (document.getElementById('tiempoAmamantado').value === '') {
    //         alert('Ingresa el tiempo amamantado del ternero.');
    //         return;
    //     }
    // }

    // if (!esTernero && tipo === 'hembra') {
    //     if (document.getElementById('numeroPartos').value === '') {
    //         alert('Ingresa el número de partos.');
    //         return;
    //     }
    //     const campos = Array.from(document.querySelectorAll('.intervalo'));
    //     const algunaVacia = campos.some(input => input.value.trim() === '');
    //     if (algunaVacia) {
    //         alert('Por favor completa todas las fechas de parto.');
    //         return;
    //     }
    // }

    // Validar fechas cronológicas

    
    if (!esTernero && tipo === 'hembra') {
        if (numeroDePartos > edadEnMeses) {
            alert(`Una hembra de ${edadEnMeses} meses no puede haber tenido ${numeroDePartos} partos.`);
            return;
        }

        const fechaNac = new Date(fechaNacimiento);
        for (let i = 0; i < intervaloParto.length; i++) {
            const fechaParto = new Date(intervaloParto[i]);
            if (fechaParto < fechaNac) {
                alert(`El parto ${i + 1} no puede ser anterior a la fecha de nacimiento.`);
                return;
            }
        }

        if (Array.isArray(intervaloParto) && intervaloParto.length > 1) {
        for (let i = 1; i < intervaloParto.length; i++) {
            const anterior = new Date(intervaloParto[i - 1]);
            const actual = new Date(intervaloParto[i]);
            if (actual < anterior) {
                alert('Las fechas de parto deben estar en orden cronológico.');
                return;
            }
            }
        }
    }
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
    document.getElementById('tipo').dispatchEvent(new Event('change'));
    document.getElementById('fechaNacimiento').dispatchEvent(new Event('change'));
    inicializarFormDinamico();
    renderAnimales();
});

// Inicializar todo tras cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    inicializarFormDinamico();
    renderAnimales();

});
