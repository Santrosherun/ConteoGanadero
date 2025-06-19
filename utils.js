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
