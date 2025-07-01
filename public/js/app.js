import { observarUsuario, login, cerrarSesion } from './auth.js';

let usuarioActivo = null;

observarUsuario((usuario) => {
    const content = document.getElementById('content');
    const loginForm = document.getElementById('loginForm');

    if (usuario) {
        usuarioActivo = usuario;
        console.log("Usuario activo:", usuario.email);
        // Mostrar contenido
        content.style.display = 'block';
        // Oculta login si existe
        if (loginForm) loginForm.remove();
        router(); // carga vistas
    } else {
        usuarioActivo = null;

        // Ocultar contenido
        content.style.display = 'none';

        if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            try {
               await login(email, password);
            } catch (err) {
                alert("Error al iniciar sesión: " + err.message);
            }
        });
    } else {
        content.innerHTML = `<p>No se encontró el formulario de login.</p>`;
    }
  }
});

//MANEJO DE VISTAS
const routes = {
    '': '/views/main.html',
    '#/agregar': '/views/agregar.html',
    '#/modificar': '/views/modificar.html',
    '#/mostrar-todos': '/views/mostrar-todos.html',
    '#/eliminar': '/views/eliminar.html',
    //   '#/mostrar-toros': '/views/mostrar-toros.html',
    //   '#/mostrar-terneros': '/views/mostrar-terneros.html',
    //   '#/informes': '/views/informes.html',
};

async function loadView(viewUrl) {
    try {
        const res = await fetch(viewUrl);
        const html = await res.text();
        // Reemplaza lo que hay en el main con todo el fragmento de código de lo escogido
        document.getElementById('content').innerHTML = html; // Aquí insertas la vista en el DOM

        // Re-inicializa lo necesario según la vista cargada
        if (viewUrl.includes('agregar.html')){
            try {
                inicializarAgregar();
            } catch (err) {
                console.error("Error en inicializarAgregar:", err);
            }
        }

        // AGREGAR TRY CATCH
        if (viewUrl.includes('modificar.html')){
            inicializarModificar();
        }
        
        if (viewUrl.includes('mostrar-todos.html')){
            mostrarTodos();
        }
        if (viewUrl.includes('eliminar.html')) {
            try {
                inicializarEliminar();
            } catch (err) {
                console.error("Error inicializarEliminar", err)
            }
        }

        
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            cerrarSesion();
            alert("sesion cerrada con exito")
            setTimeout(() => {
            location.reload();
            }, 500);
        }), {once: true};

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
// window.addEventListener('load', router);

//LÓGICA DE LA APLICACIÓN
import {
    agregarAnimal,
    obtenerAnimales,
    eliminarAnimal,
    actualizarAnimal
} from './db.js';

import { calcularEdadMeses, inicializarFormDinamico, cancelarEdicion, mostrarNotificacion, formatearEdad } from './utils.js';
import { codigoExisteEnFirebase } from './firebase-config.js'


function inicializarAgregar() {
    const form = document.getElementById('form-animal');
    const lista = document.getElementById('lista-animales');
    let animalesGlobal = [];

    // Al inicio de inicializarAgregar(), antes de renderAnimales:
    obtenerAnimales(usuarioActivo.uid, (lista) => {
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
                <td>${formatearEdad(animal.fechaNacimiento)}</td>
                <td>${numeroDePartos}</td>
                <td class="datos-repro">${fechasParto}</td>
                <td class="datos-repro">${tiempoAmamantado}</td>
                <td>
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
                    await eliminarAnimal(usuarioActivo.uid, id);
                    mostrarNotificacion('Animal eliminado correctamente.');
                }
                })
            );
        } catch (err) {
            alert('Ocurrió un error eliminando el animal.')
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
        
    
        try {
            const existeCodigo = await codigoExisteEnFirebase(usuarioActivo.uid, codigo);
            if (existeCodigo) {
                alert(`Ya existe un animal con el código "${codigo}". Usa uno diferente.`);
                return;
            }
            await agregarAnimal(usuarioActivo.uid, nuevoAnimal);
            mostrarNotificacion('Animal agregado correctamente.');
            } catch (err) {
                alert('Ocurrió un error guardando el animal.');
        }
    
    
        document.getElementById('btn-guardar').textContent = 'Guardar';
        form.reset();
        document.getElementById('tipo').dispatchEvent(new Event('change'));
        document.getElementById('fechaNacimiento').dispatchEvent(new Event('change'));
        inicializarFormDinamico();
        // renderAnimales();
    });
    
    inicializarFormDinamico();
    // renderAnimales();
}

function mostrarTodos() {
    const lista = document.getElementById('lista-animales');
    const head = document.getElementById('tabla-head');
    const selectFiltro = document.getElementById('filtro-tipo');
    let animalesGlobal = [];

    // Cargar desde base de datos
    obtenerAnimales(usuarioActivo.uid, (listaDB) => {
        animalesGlobal = listaDB;
        renderAnimales(animalesGlobal, 'todos');
    });

    // Evento para filtrar
    selectFiltro.addEventListener('change', (e) => {
        const tipoSeleccionado = e.target.value;

        const filtrados = tipoSeleccionado === 'todos'
            ? animalesGlobal
            : animalesGlobal.filter(animal => {
                if (tipoSeleccionado === 'ternero') return animal.esTernero;
                return animal.tipo === tipoSeleccionado;
            });

        renderAnimales(filtrados, tipoSeleccionado);
    });

    // Renderizar la tabla dinámicamente
    function renderAnimales(animales, filtro = 'todos') {
        lista.innerHTML = '';

        // Construcción dinámica de encabezados
        let titulo = '';
        const cantidad = animales.length;

        switch (filtro) {
            case 'hembra':
                titulo = `Vacas Registradas (${cantidad})`;
                break;
            case 'toro':
                titulo = `Toros Registrados (${cantidad})`;
                break;
            case 'ternero':
                titulo = `Terneros Registrados (${cantidad})`;
                break;
            default:
                titulo = `Todos los animales registrados (${cantidad})`;
        }

        // Construir primera fila estilo subtitulo
        let encabezado = `
            <tr class="subtitulo-row">
                <th colspan="6" class="subtitulo">${titulo}</th>
            </tr>
            <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Edad</th>
        `;

        if (filtro === 'hembra') {
            encabezado += `
                <th>N° Partos</th>
                <th>Fechas de Partos</th>
            `;
        } else if (filtro === 'ternero') {
            encabezado += `<th>Tiempo Amamantado</th>`;
        }

        head.innerHTML = encabezado += '</tr>';

        // Crear filas
        animales.forEach(animal => {
            const tr = document.createElement('tr');
            const edad = formatearEdad(animal.fechaNacimiento);

            let fila = `
                <td>${animal.codigo}</td>
                <td>${animal.tipo}</td>
                <td>${edad}</td>
            `;

            if (filtro === 'hembra') {
                const nPartos = animal.numeroDePartos ?? 'N/A';
                const fechas = animal.intervaloParto
                    ? animal.intervaloParto.map(f => `<div>${f}</div>`).join('')
                    : 'N/A';
                fila += `
                    <td>${nPartos}</td>
                    <td class="datos-repro">${fechas}</td>
                `;
            } else if (filtro === 'ternero') {
                const tiempo = animal.tiempoAmamantado ?? 'N/A';
                fila += `<td class="datos-repro">${tiempo} meses</td>`;
            }

            tr.innerHTML = fila;
            lista.appendChild(tr);
        });
    }
}

function inicializarModificar() {
    const form = document.getElementById('form-animal');
    const btnBuscar = document.getElementById('btn-guardar');
    const btnCancelar = document.getElementById('btn-cancelar');
    let editandoId = null;
    let animalesGlobal = [];
    document.getElementById('contenedor-tipo').style.display = 'none'
    document.getElementById('contenedor-fechaN').style.display = 'none'

    obtenerAnimales(usuarioActivo.uid, (lista) => {
        animalesGlobal = lista;
    });

    btnBuscar.textContent = 'Buscar';

    btnBuscar.addEventListener('click', async () => {
        const modo = btnBuscar.textContent;

        if (modo === 'Buscar') {
            const codigoBuscado = document.getElementById('codigo').value.trim();
            const animal = animalesGlobal.find(a => a.codigo === codigoBuscado);

            if (!codigoBuscado) {
                alert('Ingresa un código para buscar.');
                return;
            }

            if (!animal) {
                alert('No se encontró ningún animal con ese código.');
                form.reset();
                return;
            }

            document.getElementById('contenedor-tipo').style.display = 'flex'
            document.getElementById('contenedor-fechaN').style.display = 'flex'

            btnCancelar.style.display = 'inline-block';

            document.getElementById('codigo').value = animal.codigo;
            document.getElementById('tipo').value = animal.tipo;
            document.getElementById('fechaNacimiento').value = animal.fechaNacimiento;

            document.getElementById('tipo').dispatchEvent(new Event('change'));
            document.getElementById('fechaNacimiento').dispatchEvent(new Event('change'));

            if (animal.esTernero) {
                document.getElementById('tiempoAmamantado').value = animal.tiempoAmamantado;
            } else if (animal.tipo === 'hembra') {
                document.getElementById('numeroPartos').value = animal.numeroDePartos || 0;

                const contenedor = document.getElementById('contenedor-intervalos');
                contenedor.innerHTML = '';

                for (let i = 0; i < (animal.numeroDePartos || 0); i++) {
                    const formField = document.createElement('div');
                    formField.className = 'form-field';

                    const label = document.createElement('label');
                    label.textContent = `Parto ${i + 1}:`;
                    label.setAttribute('for', `parto-${i + 1}`);

                    const input = document.createElement('input');
                    input.type = 'date';
                    input.className = 'intervalo';
                    input.id = `parto-${i + 1}`;
                    input.name = `parto-${i + 1}`;
                    input.value = animal.intervaloParto?.[i] || '';
                    input.required = true;

                    formField.appendChild(label);
                    formField.appendChild(input);
                    contenedor.appendChild(formField);
                }
            }

            editandoId = animal.id;
            btnBuscar.textContent = 'Actualizar';
        } else if (modo === 'Actualizar') {
            form.dispatchEvent(new Event('submit'));
        }
    });

    btnCancelar.addEventListener('click', () => cancelarEdicion(form, btnCancelar));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

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
            ? Array.from(document.querySelectorAll('.intervalo'))
                .map(input => input.value)
                .filter(val => val !== '')
            : null;

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

            for (let i = 1; i < intervaloParto.length; i++) {
                const anterior = new Date(intervaloParto[i - 1]);
                const actual = new Date(intervaloParto[i]);
                if (actual < anterior) {
                    alert('Las fechas de parto deben estar en orden cronológico.');
                    return;
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

        try {
            if (editandoId !== null) {
                await actualizarAnimal(usuarioActivo.uid, editandoId, nuevoAnimal);
                mostrarNotificacion('Animal actualizado correctamente.');
                editandoId = null;
            } else {
                const existeCodigo = await codigoExisteEnFirebase(usuarioActivo.uid, codigo);
                if (existeCodigo) {
                    alert(`Ya existe un animal con el código "${codigo}". Usa uno diferente.`);
                    return;
                }
                await agregarAnimal(usuarioActivo.uid, nuevoAnimal);
                mostrarNotificacion('Animal agregado correctamente.');
            }
        } catch (err) {
            alert('Ocurrió un error guardando el animal.');
        }

        btnBuscar.textContent = 'Buscar';
        form.reset();
        document.getElementById('tipo').dispatchEvent(new Event('change'));
        document.getElementById('fechaNacimiento').dispatchEvent(new Event('change'));
        cancelarEdicion(form, btnCancelar);
        inicializarFormDinamico();
    });

    inicializarFormDinamico();
}

export function inicializarEliminar() {
  // ————— Elementos del DOM —————
  const formEliminar = document.getElementById('form-eliminar');
  const inputEliminar = document.getElementById('codigoEliminar');
  const inputBuscar   = document.getElementById('codigoBuscar');
  const btnBuscar     = document.getElementById('btn-buscar');
  const subBuscar     = document.querySelectorAll('h2.subtitulo')[1]; // el segundo subtitulo
  const divResultado  = document.getElementById('resultado-buscar');
  const headResultado = document.getElementById('tabla-eliminar-head');
  const bodyResultado = document.getElementById('tabla-eliminar-body');

  let animalesGlobal = [];
  let datosListos    = false;

  // ————— Suscribir snapshot —————
  const unsubscribe = obtenerAnimales(usuarioActivo.uid, lista => {
    animalesGlobal = lista;
    datosListos = true;
  });

  // ————— Lógica de ELIMINAR —————
  formEliminar.addEventListener('submit', async e => {
    e.preventDefault();
    if (!datosListos) {
      alert('Los datos aún se están cargando, espera un momento.');
      return;
    }

    const codigo = inputEliminar.value.trim();
    if (!codigo) {
      alert('Por favor ingresa un código para eliminar.');
      return;
    }

    const animal = animalesGlobal.find(a => a.codigo === codigo);
    if (!animal) {
      alert(`No se encontró ningún animal con código "${codigo}".`);
      return;
    }

    if (!confirm(`Vas a eliminar el animal con Código "${codigo}".\n¿Estás seguro? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await eliminarAnimal(usuarioActivo.uid, id);
      mostrarNotificacion('Animal eliminado correctamente.');
      formEliminar.reset();
    } catch (err) {
      console.error(err);
      mostrarNotificacion('Error eliminando el animal.');
    }
  });

  // ————— Lógica de BUSCAR —————
  btnBuscar.addEventListener('click', () => {
    if (!datosListos) {
      alert('Los datos aún se están cargando, por favor espera un momento.');
      return;
    }

    const codigo = inputBuscar.value.trim();
    if (!codigo) {
      alert('Por favor ingresa un código para buscar.');
      return;
    }

    const animal = animalesGlobal.find(a => a.codigo === codigo);
    if (!animal) {
      alert(`No existe animal con código "${codigo}".`);
      return;
    }

    // Mostrar subtitulo y tabla
    subBuscar.style.display = 'block';
    divResultado.style.display = 'block';

    // Encabezados
    headResultado.innerHTML = `
      <tr>
        <th>Código</th>
        <th>Tipo</th>
        <th>Edad</th>
        <th>N° Partos</th>
        <th>Fechas de Partos</th>
        <th>Tiempo Amamantado</th>
      </tr>
    `;

    // Fila con datos
    const edad      = formatearEdad(animal.fechaNacimiento);
    const nPartos   = animal.tipo === 'hembra' ? (animal.numeroDePartos ?? 'N/A') : 'N/A';
    const fechas    = (animal.tipo === 'hembra' && animal.intervaloParto)
      ? animal.intervaloParto.map(f => `<div>${f}</div>`).join('')
      : 'N/A';
    const tiempoAma = animal.esTernero ? `${animal.tiempoAmamantado} meses` : 'N/A';

    bodyResultado.innerHTML = `
      <tr>
        <td>${animal.codigo}</td>
        <td>${animal.tipo}</td>
        <td>${edad}</td>
        <td>${nPartos}</td>
        <td class="datos-repro">${fechas}</td>
        <td class="datos-repro">${tiempoAma}</td>
      </tr>
    `;
  });

  // ————— Limpiar suscripción al salir —————
  window.addEventListener('hashchange', () => {
    if (!window.location.hash.includes('eliminar')) {
      unsubscribe();
    }
  });
}

