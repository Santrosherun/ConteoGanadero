// Calcula edad en meses a partir de fecha ISO
export function calcularEdadMeses(fechaStr) {
    const fechaNac = new Date(fechaStr);
    const hoy = new Date();
    const años  = hoy.getFullYear() - fechaNac.getFullYear();
    const meses = hoy.getMonth() - fechaNac.getMonth();
    return años * 12 + meses;
}

export function formatearEdad(fechaNacimientoStr) {
    const fechaNac = new Date(fechaNacimientoStr);
    const hoy = new Date();

    const diferenciaMs = hoy - fechaNac;
    if (diferenciaMs < 0) return "fecha en el futuro";

    const diasTotales = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    const años = Math.floor(diasTotales / 365.25);
    const diasRestantesTrasAños = diasTotales - Math.floor(años * 365.25);
    const meses = Math.floor(diasRestantesTrasAños / 30.44);
    const diasRestantes = Math.floor(diasRestantesTrasAños - meses * 30.44);

    let resultado = [];

    if (años > 0) resultado.push(`${años} año${años === 1 ? '' : 's'}`);
    if (meses > 0) resultado.push(`${meses} mes${meses === 1 ? '' : 'es'}`);
    if (diasRestantes > 0 || resultado.length === 0) {
        resultado.push(`${diasRestantes} día${diasRestantes === 1 ? '' : 's'}`);
    }
    return resultado.join(' y ');
}

export function inicializarFormDinamico() {
    const tipoInput = document.getElementById('tipo');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    const campoAmamantado = document.getElementById('campo-amamantado');
    const camposPartos = document.getElementById('campos-partos');
    const numeroPartosInput = document.getElementById('numeroPartos');
    const contenedorIntervalos = document.getElementById('contenedor-intervalos');
    const tiempoAmamantadoInput = document.getElementById('tiempoAmamantado');

    function actualizarCamposVisibles() {
        const tipo = tipoInput.value;
        const fecha = fechaNacimientoInput.value;
        if (!fecha) {
            campoAmamantado.style.display = 'none';
            camposPartos.style.display = 'none';
            return;
        }
        const edadMeses = calcularEdadMeses(fecha);

        campoAmamantado.style.display = edadMeses < 12 ? 'inline-block' : 'none';
        camposPartos.style.display = (tipo === 'hembra' && edadMeses >= 12) ? 'inline-block' : 'none';

        tiempoAmamantadoInput.required = edadMeses < 12;
        numeroPartosInput.required = (tipo === 'hembra' && edadMeses >= 12);

        // Limpia valores ocultos
        if (edadMeses >= 12) {
            document.getElementById('tiempoAmamantado').value = '';
        }
        if (tipo !== 'hembra' || edadMeses < 12) {
            numeroPartosInput.value = '';
            contenedorIntervalos.innerHTML = '';
        }
    }

    function actualizarCamposIntervalo() {
        const numero = parseInt(numeroPartosInput.value);
        contenedorIntervalos.innerHTML = '';

        if (!isNaN(numero) && numero > 0) {
            for (let i = 1; i <= numero; i++) {
                // Crear contenedor para cada par label-input
                const formField = document.createElement('div');
                formField.className = 'form-field';

                // Crear y configurar el label
                const label = document.createElement('label');
                label.textContent = `Parto ${i}:`;
                label.style.whiteSpace = 'nowrap';
                label.style.minWidth = '50px';
                label.style.marginRight = '25px';
                label.style.textAlign = 'right';
                label.setAttribute('for', `parto-${i}`);

                // Crear y configurar el input
                const input = document.createElement('input');
                input.type = 'date';
                input.className = 'intervalo';
                input.id = `parto-${i}`;
                input.name = `parto-${i}`;
                input.style.marginBottom = '5px';
                input.style.marginTop = '5px';
                input.required = true;
                input.max = new Date().toISOString().split('T')[0];

                // Agregar label e input al contenedor
                formField.appendChild(label);
                formField.appendChild(input);

                // Agregar contenedor al DOM
                contenedorIntervalos.appendChild(formField);
            }
        }
    }


    tipoInput.addEventListener('change', actualizarCamposVisibles);
    fechaNacimientoInput.addEventListener('change', actualizarCamposVisibles);
    numeroPartosInput.addEventListener('input', actualizarCamposIntervalo);
}

export function cancelarEdicion(form, btnCancelar) {
    // Limpiar estado de edición
    if (typeof window.editandoId !== 'undefined') {
        window.editandoId = null;
    }

    form.reset();
    document.getElementById('btn-guardar').textContent = 'Buscar';
    btnCancelar.style.display = 'none';

    // Volver a estado limpio
    document.getElementById('tipo').dispatchEvent(new Event('change'));
    document.getElementById('fechaNacimiento').dispatchEvent(new Event('change'));
    document.getElementById('contenedor-tipo').style.display = 'None'
    document.getElementById('contenedor-fechaN').style.display = 'None'

    // Opcional: devolver foco al primer campo
    document.getElementById('codigo').focus();

    document.getElementById('accionesAnimal').style.display = 'None';
    document.getElementById('estadoAnimalContainer').style.display = 'None';
}

export function mostrarNotificacion(mensaje, tipo = 'exito', duracion = 3000) {
    const div = document.getElementById('notificacion');
    if (!div) return;
    
    div.textContent = mensaje;
    div.className = `notificacion ${tipo} visible`;

    setTimeout(() => {
        div.classList.add('oculto');
        div.classList.remove('visible');
    }, duracion);
}

export function mostrarFincaActiva(nombre) {
  const indicador = document.getElementById('indicadorFincaActiva');

  if (!indicador) return;

  if (!nombre) {
    indicador.innerHTML = 'Ninguna finca activa';
  } else {
    indicador.innerHTML = `Finca activa: <strong>${nombre}</strong>`;
  }
}
