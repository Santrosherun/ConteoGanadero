// Calcula edad en meses a partir de fecha ISO
export function calcularEdadMeses(fechaStr) {
    const fechaNac = new Date(fechaStr);
    const hoy = new Date();
    const años  = hoy.getFullYear() - fechaNac.getFullYear();
    const meses = hoy.getMonth() - fechaNac.getMonth();
    return años * 12 + meses;
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
                const label = document.createElement('label');
                label.textContent = `Parto ${i}:`;

                const input = document.createElement('input');
                input.type = 'date';
                input.className = 'intervalo';
                input.required = true;
                
                contenedorIntervalos.appendChild(label);
                contenedorIntervalos.appendChild(input);
                contenedorIntervalos.appendChild(document.createElement('br'));
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
    document.getElementById('btn-guardar').textContent = 'Guardar';
    btnCancelar.style.display = 'none';

    // Volver a estado limpio
    document.getElementById('tipo').dispatchEvent(new Event('change'));
    document.getElementById('fechaNacimiento').dispatchEvent(new Event('change'));

    // Quitar el resaltado
    document.querySelectorAll('#lista-animales li').forEach(li => {
        li.classList.remove('editando');
    });

    // Opcional: devolver foco al primer campo
    document.getElementById('codigo').focus();
}
