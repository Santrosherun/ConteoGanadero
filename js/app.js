//MANEJO DE VISTAS
const routes = {
  '': '/views/main.html',
  '#/agregar': '/views/agregar.html',
//   '#/modificar': '/views/modificar.html',
//   '#/eliminar': '/views/eliminar.html',
//   '#/mostrar-vacas': '/views/mostrar-vacas.html',
//   '#/mostrar-toros': '/views/mostrar-toros.html',
//   '#/mostrar-terneros': '/views/mostrar-terneros.html',
//   '#/mostrar-todos': '/views/mostrar-todos.html',
//   '#/informes': '/views/informes.html',
};

async function loadView(viewUrl) {
  try {
    const res = await fetch(viewUrl);
    const html = await res.text();
    // Reemplaza lo que hay en el main con todo el fragmento de código de lo escogido
    document.getElementById('content').innerHTML = html; // Aquí insertas la vista en el DOM

    // Re-inicializa lo necesario según la vista cargada
    if (viewUrl.includes('agregar.html')) {
      inicializarAgregar();
    }

  } catch (err) {
    document.getElementById('content').innerHTML = "<p>Error al cargar la vista.</p>";
  }
}

function router() {
  const hash = window.location.hash;
  const view = routes[hash] || routes[''];
  loadView(view);
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

//LÓGICA DE LA APLICACIÓN
import {
    agregarAnimal,
    obtenerAnimales,
    eliminarAnimal,
    actualizarAnimal
} from './db.js';

import { calcularEdadMeses, inicializarFormDinamico, cancelarEdicion, mostrarNotificacion, formatearEdad } from './utils.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

function inicializarAgregar() {
    const form = document.getElementById('form-animal');
    const btnCancelar = document.getElementById('btn-cancelar');
    const lista = document.getElementById('lista-animales');
    let editandoId = null;
    let animalesGlobal = [];

    // Al inicio de inicializarAgregar(), antes de renderAnimales:
    obtenerAnimales((lista) => {
        // listaAnimales viene de Firestore: [{ id, codigo, tipo, fechaNacimiento, ... }, …]
        animalesGlobal = lista;
        renderAnimales(lista);
    });

    const renderAnimales = (animales) => {
        
         
        
        lista.innerHTML = '';

        animales.forEach(animal => {
            const tr = document.createElement('tr');

            const numeroDePartos = animal.tipo === 'hembra' ? animal.numeroDePartos ?? 'N/A' : 'N/A';
            const fechasParto = animal.tipo === 'hembra' && animal.intervaloParto
                ? animal.intervaloParto.map(f => `<div>${f}</div>`).join('')
                : 'N/A';

            const tiempoAmamantado = animal.esTernero
                ? `${animal.tiempoAmamantado} meses`
                : 'N/A';

            tr.innerHTML = `
                <td>${animal.codigo}</td>
                <td>${animal.tipo}</td>
                <td>${formatearEdad(animal.fechaNacimiento)} meses</td>
                <td>${numeroDePartos}</td>
                <td class="datos-repro">${fechasParto}</td>
                <td class="datos-repro">${tiempoAmamantado}</td>
                <td>
                <button data-id="${animal.id}" class="editar">Editar</button>
                <button data-id="${animal.id}" class="eliminar">Eliminar</button>
                </td>
            `;
            lista.appendChild(tr);
        });




        // Asignar eventos a los botones
        //ELIMINAR
    
        try {
            lista.querySelectorAll('.eliminar').forEach(btn =>
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const confirmacion = confirm('¿Estás seguro de que deseas eliminar este animal? Esta acción no se puede deshacer.');
                if (confirmacion) {
                    await eliminarAnimal(id);
                    mostrarNotificacion('Animal eliminado correctamente.');
                }
                })
            );
        } catch (err) {
            alert('Ocurrió un error eliminando el animal.')
        }
    
        //EDITAR
        try {
        document.querySelectorAll('.editar').forEach(btn =>
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const animal = animalesGlobal.find(a => a.id === id);
    
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
                        // Crear contenedor para cada par label-input
                        const formField = document.createElement('div');
                        formField.className = 'form-field';

                        // Crear y configurar el label
                        const label = document.createElement('label');
                        label.textContent = `Parto ${i + 1}:`;
                        label.style.whiteSpace = 'nowrap';
                        label.style.minWidth = '50px';
                        label.style.marginRight = '25px';
                        label.style.textAlign = 'right';
                        label.setAttribute('for', `parto-${i + 1}`);
    
                        // Crear y configurar el input
                        const input = document.createElement('input');
                        input.type = 'date';
                        input.className = 'intervalo';
                        input.id = `parto-${i + 1}`;
                        input.name = `parto-${i + 1}`;
                        input.style.marginBottom = '5px';
                        input.style.marginTop = '5px';
                        input.value = animal.intervaloParto?.[i] || '';
                        input.required = true;

                        // Agregar label e input al contenedor
                        formField.appendChild(label);
                        formField.appendChild(input);
                        
                        // Agregar contenedor al DOM
                        contenedor.appendChild(formField);
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
                mostrarNotificacion('Animal actualizado correctamente.');
                editandoId = null;
            } else {
                await agregarAnimal(nuevoAnimal);
                mostrarNotificacion('Animal agregado correctamente.');
            }
        } catch (err) {
            alert('Ocurrió un error guardando el animal.');
        }
    
    
        document.getElementById('btn-guardar').textContent = 'Guardar';
        form.reset();
        document.getElementById('tipo').dispatchEvent(new Event('change'));
        document.getElementById('fechaNacimiento').dispatchEvent(new Event('change'));
        cancelarEdicion(form, btnCancelar);
        inicializarFormDinamico();
        // renderAnimales();
    });
    
    inicializarFormDinamico();
    // renderAnimales();
}
