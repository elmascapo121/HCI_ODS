/*
 * ARCHIVO: js/main.js
 * PROYECTO: AguaClara — ODS 6 (Agua limpia y saneamiento)
 * DESCRIPCIÓN: Interacciones con JavaScript puro (Vanilla JS) y manipulación del API DOM.
 * No utiliza frameworks ni bibliotecas externas. Se vincula en index.html con "defer".
 */

/* ============================================================================
 * MÓDULO 1: MENÚ HAMBURGUESA Y SUBMENÚ DESPLEGABLE (ENCABEZADO)
 * - Elementos del DOM seleccionados: #boton-menu, #menu-principal y .desplegable
 * - Eventos escuchados: "click" en el botón hamburguesa, enlaces y documento
 * - Cambios en el DOM: alterna la clase ".abierto", actualiza "aria-expanded"
 *   y cierra automáticamente el submenú <details> al elegir una sección.
 * ============================================================================ */
const botonMenu = document.getElementById("boton-menu");
const menuPrincipal = document.getElementById("menu-principal");
const menuDesplegable = document.querySelector(".desplegable");
const enlacesMenu = document.querySelectorAll("#menu-principal a");

if (botonMenu && menuPrincipal) {
    botonMenu.addEventListener("click", function () {
        const estaAbierto = menuPrincipal.classList.toggle("abierto");
        botonMenu.setAttribute("aria-expanded", String(estaAbierto));
        botonMenu.textContent = estaAbierto ? "✕ Cerrar" : "☰ Menú";
    });

    // Cerrar el menú móvil y el desplegable cuando el usuario hace clic en un enlace
    enlacesMenu.forEach(function (enlace) {
        enlace.addEventListener("click", function () {
            menuPrincipal.classList.remove("abierto");
            botonMenu.setAttribute("aria-expanded", "false");
            botonMenu.textContent = "☰ Menú";
            if (menuDesplegable) {
                menuDesplegable.removeAttribute("open");
            }
        });
    });

    // Cerrar el submenú <details> si el usuario hace clic fuera de él
    document.addEventListener("click", function (evento) {
        if (menuDesplegable && !menuDesplegable.contains(evento.target)) {
            menuDesplegable.removeAttribute("open");
        }
    });
}

/* ============================================================================
 * MÓDULO 2: HU01 — REPORTE RÁPIDO DE FUGAS DE AGUA (#fugas)
 * Criterios de aceptación cubiertos:
 *   a. Permitir subir 1 imagen y mostrar vista previa inmediata en el DOM.
 *   b. Marcar ubicación en el mapa o copiar la ubicación seleccionada con #boton-gps.
 *   c. Validar los datos y generar un código de ticket único (FUG-2026-XXXXXX).
 * ============================================================================ */
const formularioFugas = document.getElementById("formulario-fugas");
const inputFoto = document.getElementById("foto");
const contenedorVistaPrevia = document.getElementById("vista-previa-foto");
const imagenPreviaFuga = document.getElementById("imagen-previa-fuga");
const nombreArchivoFuga = document.getElementById("nombre-archivo-fuga");
const botonGps = document.getElementById("boton-gps");
const inputDireccion = document.getElementById("direccion");
const inputDescripcion = document.getElementById("descripcion");
const inputCorreoReporte = document.getElementById("correo-reporte");
const resultadoFuga = document.getElementById("resultado-fuga");

// Criterio 1a: Mostrar vista previa de la foto seleccionada con el evento "change"
if (inputFoto) {
    inputFoto.addEventListener("change", function () {
        const archivo = inputFoto.files[0];
        if (archivo) {
            const urlTemporal = URL.createObjectURL(archivo);
            imagenPreviaFuga.src = urlTemporal;
            nombreArchivoFuga.textContent = "Fotografía cargada: " + archivo.name;
            contenedorVistaPrevia.hidden = false;
            inputFoto.classList.remove("campo-error");
        } else {
            contenedorVistaPrevia.hidden = true;
        }
    });
}

// Criterio 1b: Copiar el punto marcado del croquis al campo de dirección (#direccion)
if (botonGps && inputDireccion) {
    botonGps.addEventListener("click", function () {
        const puntoSeleccionado = document.querySelector('input[name="punto_demo"]:checked');
        if (puntoSeleccionado) {
            inputDireccion.value = puntoSeleccionado.value;
            inputDireccion.classList.remove("campo-error");
            inputDireccion.focus();
        }
    });
}

// Criterio 1c: Validar el formulario con "submit" y generar el ticket único FUG-2026-XXXXXX
if (formularioFugas) {
    formularioFugas.addEventListener("submit", function (evento) {
        evento.preventDefault(); // Evita que la página se recargue

        const tieneFoto = inputFoto.files && inputFoto.files.length > 0;
        const direccionTexto = inputDireccion.value.trim();
        const descripcionTexto = inputDescripcion.value.trim();
        const correoTexto = inputCorreoReporte.value.trim();
        const puntoCroquis = document.querySelector('input[name="punto_demo"]:checked');

        // Limpiar estados de error previos
        inputFoto.classList.remove("campo-error");
        inputDireccion.classList.remove("campo-error");
        inputDescripcion.classList.remove("campo-error");
        inputCorreoReporte.classList.remove("campo-error");

        // Validaciones orientadas al control del usuario
        if (!tieneFoto) {
            inputFoto.classList.add("campo-error");
            resultadoFuga.hidden = false;
            resultadoFuga.innerHTML = "<strong>Falta la fotografía:</strong> Selecciona o toma 1 foto de la fuga antes de enviar.";
            inputFoto.focus();
            return;
        }

        if (direccionTexto.length < 5) {
            inputDireccion.classList.add("campo-error");
            resultadoFuga.hidden = false;
            resultadoFuga.innerHTML = "<strong>Dirección incompleta:</strong> Ingresa al menos 5 caracteres o pulsa el botón de ubicación.";
            inputDireccion.focus();
            return;
        }

        if (descripcionTexto.length < 15) {
            inputDescripcion.classList.add("campo-error");
            resultadoFuga.hidden = false;
            resultadoFuga.innerHTML = "<strong>Descripción muy corta:</strong> Detalla la fuga con al menos 15 caracteres.";
            inputDescripcion.focus();
            return;
        }

        if (!correoTexto.includes("@") || !correoTexto.includes(".")) {
            inputCorreoReporte.classList.add("campo-error");
            resultadoFuga.hidden = false;
            resultadoFuga.innerHTML = "<strong>Correo inválido:</strong> Ingresa un correo electrónico con formato válido.";
            inputCorreoReporte.focus();
            return;
        }

        // Generar código de ticket único de 6 dígitos (ej. FUG-2026-004821)
        const numeroAleatorio = String(Math.floor(100000 + Math.random() * 900000));
        const codigoTicket = "FUG-2026-" + numeroAleatorio;
        const nombreArchivo = inputFoto.files[0].name;
        const ubicacionElegida = puntoCroquis ? puntoCroquis.value : direccionTexto;

        // Mostrar el resumen y el ticket único en el DOM
        resultadoFuga.hidden = false;
        resultadoFuga.innerHTML =
            "<h4>✓ Reporte registrado correctamente</h4>" +
            "<p>Código único de seguimiento:</p>" +
            '<span class="codigo-ticket">' + codigoTicket + "</span>" +
            "<p><strong>Fotografía adjunta:</strong> " + nombreArchivo + "</p>" +
            "<p><strong>Ubicación:</strong> " + direccionTexto + " (" + ubicacionElegida + ")</p>" +
            "<p><strong>Descripción:</strong> " + descripcionTexto + "</p>";
    });
}

/* ============================================================================
 * MÓDULO 3: HU02 — CONSULTA DE CORTES PROGRAMADOS E INCIDENCIAS (#cortes)
 * Criterios de aceptación cubiertos:
 *   a. Buscador que acepta tanto el nombre del distrito como el número de suministro.
 *   b. Mostrar el estado actual ("Con servicio", "Corte programado", "Incidencia en reparación")
 *      y el horario estimado de restablecimiento.
 *   c. Opción de activar alertas por SMS o WhatsApp validando el teléfono de 9 dígitos.
 * ============================================================================ */
const inputBuscadorCorte = document.getElementById("buscador-corte");
const botonBuscarCorte = document.getElementById("boton-buscar-corte");
const mensajeBuscadorCorte = document.getElementById("mensaje-buscador-corte");
const radioZona1 = document.getElementById("zona1");
const radioZona2 = document.getElementById("zona2");
const radioZona3 = document.getElementById("zona3");

const formularioAlertas = document.getElementById("formulario-alertas");
const selectSuministroAlerta = document.getElementById("suministro-alerta");
const selectCanalAlerta = document.getElementById("canal");
const inputTelefonoAlerta = document.getElementById("telefono");
const resultadoAlerta = document.getElementById("resultado-alerta");

function consultarCortePorTexto() {
    const consulta = inputBuscadorCorte.value.trim().toLowerCase();

    if (consulta === "") {
        mensajeBuscadorCorte.textContent = "Escribe un distrito (Centro, Norte, Sur) o un suministro (100001, 100002, 100003).";
        return;
    }

    if (consulta.includes("centro") || consulta.includes("100001")) {
        radioZona1.checked = true;
        mensajeBuscadorCorte.textContent = "Mostrando resultado para: Distrito Centro · Suministro 100001 (Con servicio).";
    } else if (consulta.includes("norte") || consulta.includes("100002")) {
        radioZona2.checked = true;
        mensajeBuscadorCorte.textContent = "Mostrando resultado para: Distrito Norte · Suministro 100002 (Corte programado hasta las 14:00).";
    } else if (consulta.includes("sur") || consulta.includes("100003")) {
        radioZona3.checked = true;
        mensajeBuscadorCorte.textContent = "Mostrando resultado para: Distrito Sur · Suministro 100003 (Incidencia en reparación hasta las 18:00).";
    } else {
        mensajeBuscadorCorte.textContent = "No se encontró \"" + inputBuscadorCorte.value + "\". Prueba con Centro (100001), Norte (100002) o Sur (100003).";
    }
}

if (botonBuscarCorte && inputBuscadorCorte) {
    botonBuscarCorte.addEventListener("click", consultarCortePorTexto);
    inputBuscadorCorte.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") {
            evento.preventDefault();
            consultarCortePorTexto();
        }
    });
}

// Criterio 2c: Validar y activar alertas por SMS o WhatsApp
if (formularioAlertas) {
    formularioAlertas.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const suministro = selectSuministroAlerta.value;
        const canal = selectCanalAlerta.value;
        const telefono = inputTelefonoAlerta.value.trim();
        const soloNueveDigitos = /^[0-9]{9}$/.test(telefono);

        selectSuministroAlerta.classList.remove("campo-error");
        inputTelefonoAlerta.classList.remove("campo-error");

        if (suministro === "") {
            selectSuministroAlerta.classList.add("campo-error");
            resultadoAlerta.hidden = false;
            resultadoAlerta.textContent = "Selecciona primero un número de suministro de la lista.";
            selectSuministroAlerta.focus();
            return;
        }

        if (!soloNueveDigitos) {
            inputTelefonoAlerta.classList.add("campo-error");
            resultadoAlerta.hidden = false;
            resultadoAlerta.textContent = "El teléfono debe contener exactamente 9 dígitos numéricos (ej. 987654321).";
            inputTelefonoAlerta.focus();
            return;
        }

        resultadoAlerta.hidden = false;
        resultadoAlerta.innerHTML =
            "<strong>✓ Alerta activada por " + canal + ":</strong> Te notificaremos al número <strong>" +
            telefono + "</strong> sobre cualquier cambio de horario para el suministro <strong>" + suministro + "</strong>.";
    });
}

/* ============================================================================
 * MÓDULO 4: HU03 + REQUERIMIENTO DE EQUIVALENCIAS VISUALES Y ESCENARIOS (#ahorro)
 * Cumple los criterios de aceptación del PDF de Requerimiento y Escenarios:
 *   1. Calcula dinámicamente el consumo mensual según las 4 respuestas del usuario.
 *   2. Muestra debajo del total un gráfico comparativo con objetos cotidianos
 *      (bañeras de 150 L, bidones/botellas de 20 L y piscinas de 25 000 L).
 *   3. Incluye un tooltip explicativo ("?") que muestra/oculta el detalle del cálculo.
 *   4. Escenario 1 (Consumo excesivo): muestra alerta visual ROJA, equivalencia
 *      impactante y sugiere áreas críticas de mejora.
 *   5. Escenario 2 (Consumo eficiente): muestra alerta visual VERDE de bajo impacto
 *      y felicita al usuario por su eficiencia.
 * ============================================================================ */
const selectPersonas = document.getElementById("personas");
const selectLavadora = document.getElementById("lavadora");
const selectRiego = document.getElementById("riego");
const radiosDucha = document.querySelectorAll('input[name="ducha"]');

const tituloPerfilConsumo = document.getElementById("titulo-perfil-consumo");
const spanLitrosTotales = document.getElementById("litros-totales");
const subtituloHogar = document.getElementById("subtitulo-hogar");
const etiquetaMedidor = document.getElementById("etiqueta-medidor");
const medidorConsumo = document.getElementById("medidor-consumo");

const botonTooltip = document.getElementById("boton-tooltip");
const contenidoTooltip = document.getElementById("contenido-tooltip");
const textoFormulaTooltip = document.getElementById("texto-formula-tooltip");

const alertaEscenario = document.getElementById("alerta-escenario");
const tituloEscenario = document.getElementById("titulo-escenario");
const descripcionEscenario = document.getElementById("descripcion-escenario");

const eqBaneras = document.getElementById("eq-baneras");
const eqBotellas = document.getElementById("eq-botellas");
const eqPiscinas = document.getElementById("eq-piscinas");
const visualBaneras = document.getElementById("visual-baneras");
const visualBotellas = document.getElementById("visual-botellas");
const barraPiscinaRelleno = document.getElementById("barra-piscina-relleno");
const listaConsejos = document.getElementById("lista-consejos");

// Mostrar u ocultar el tooltip explicativo ("?") al hacer clic
if (botonTooltip && contenidoTooltip) {
    botonTooltip.addEventListener("click", function () {
        const estaVisible = !contenidoTooltip.hidden;
        contenidoTooltip.hidden = estaVisible;
        botonTooltip.setAttribute("aria-expanded", String(!estaVisible));
    });
}

// Función principal que calcula el consumo, las equivalencias y evalúa los Escenarios 1 y 2
function actualizarCalculadoraYEquivalencias() {
    if (!selectPersonas || !selectLavadora || !selectRiego) {
        return;
    }

    const numeroPersonas = parseInt(selectPersonas.value, 10) || 4;
    const nivelLavadora = selectLavadora.value;
    const tipoRiego = selectRiego.value;
    const radioDuchaActivo = document.querySelector('input[name="ducha"]:checked');
    const tipoDucha = radioDuchaActivo ? radioDuchaActivo.value : "bajo";

    // 1. Consumo mensual por persona según duración de ducha + higiene básica diaria
    let litrosPorPersonaMes = 1950; // Ducha breve (hasta 5 min)
    if (tipoDucha === "medio") {
        litrosPorPersonaMes = 3100; // Ducha intermedia (6 a 10 min)
    } else if (tipoDucha === "alto") {
        litrosPorPersonaMes = 4400; // Ducha prolongada (más de 10 min)
    }

    // 2. Consumo mensual por uso de lavadora en el hogar
    let litrosLavadoraMes = 560; // 0 a 2 cargas/semana
    if (nivelLavadora === "media") {
        litrosLavadoraMes = 1200; // 3 a 4 cargas/semana
    } else if (nivelLavadora === "alta") {
        litrosLavadoraMes = 2200; // 5 o más cargas/semana
    }

    // 3. Consumo mensual por método de riego
    let litrosRiegoMes = 0;
    if (tipoRiego === "regadera") {
        litrosRiegoMes = 600;
    } else if (tipoRiego === "manguera") {
        litrosRiegoMes = 2400;
    }

    // Total mensual del hogar y referencia recomendada por la OMS (3 000 L/mes por persona = 100 L/día)
    const consumoTotalLitros = (numeroPersonas * litrosPorPersonaMes) + litrosLavadoraMes + litrosRiegoMes;
    const referenciaOmsHogar = numeroPersonas * 3000;
    const porcentajeComparacion = Math.round((consumoTotalLitros / referenciaOmsHogar) * 100);

    // Cálculo dinámico de equivalencias cotidianas
    const cantidadBaneras = Math.round(consumoTotalLitros / 150); // 1 bañera = 150 L
    const cantidadBidones = Math.round(consumoTotalLitros / 20);  // 1 bidón/botella grande = 20 L
    const proporcionPiscina = (consumoTotalLitros / 25000).toFixed(2); // Piscina de 25 000 L
    const porcentajePiscina = Math.min(100, Math.round((consumoTotalLitros / 25000) * 100));

    // Actualizar textos principales y medidor en el DOM
    spanLitrosTotales.textContent = consumoTotalLitros.toLocaleString("es-PE");
    subtituloHogar.textContent =
        "para un hogar de " + numeroPersonas + (numeroPersonas === 1 ? " persona" : " personas") +
        " (referencia OMS: " + referenciaOmsHogar.toLocaleString("es-PE") + " L/mes)";
    etiquetaMedidor.textContent = "Comparación con referencia recomendada por la OMS: " + porcentajeComparacion + "%";
    medidorConsumo.value = Math.min(200, porcentajeComparacion);

    // Actualizar el detalle matemático dentro del tooltip ("?")
    textoFormulaTooltip.textContent =
        "Cálculo actual: (" + numeroPersonas + " hab. × " + litrosPorPersonaMes + " L en ducha/higiene) + " +
        litrosLavadoraMes + " L de lavadora + " + litrosRiegoMes + " L de riego = " +
        consumoTotalLitros.toLocaleString("es-PE") + " L/mes. " +
        "Dividido entre: 150 L por bañera (" + cantidadBaneras + " bañeras), 20 L por bidón (" +
        cantidadBidones + " bidones) y 25 000 L por piscina familiar (" + proporcionPiscina + " piscinas).";

    // Actualizar las tarjetas del gráfico comparativo con objetos cotidianos
    eqBaneras.textContent = cantidadBaneras + " bañeras";
    eqBotellas.textContent = cantidadBidones + " bidones";
    eqPiscinas.textContent = proporcionPiscina + " piscinas";

    // Generar representación gráfica de iconos repetidos (máximo 12 iconos visuales)
    const iconosBanera = Math.max(1, Math.min(12, Math.round(cantidadBaneras / 10)));
    const iconosBidon = Math.max(1, Math.min(12, Math.round(cantidadBidones / 80)));
    visualBaneras.textContent = "🛁".repeat(iconosBanera);
    visualBotellas.textContent = "🧴".repeat(iconosBidon);
    barraPiscinaRelleno.style.width = porcentajePiscina + "%";

    // Evaluar Escenario 1 (Consumo excesivo > 100% OMS) vs. Escenario 2 (Consumo eficiente <= 100% OMS)
    if (porcentajeComparacion > 100) {
        // ESCENARIO 1: CONSUMO EXCESIVO (Alerta visual ROJA + Equivalencia impactante)
        tituloPerfilConsumo.textContent = "Alerta: Consumo elevado por encima del promedio";
        alertaEscenario.classList.remove("alerta-verde");
        alertaEscenario.classList.add("alerta-roja");
        barraPiscinaRelleno.style.backgroundColor = "#b91c1c";

        tituloEscenario.textContent =
            "⚠️ Escenario de consumo excesivo: ¡Tu consumo equivale a llenar " +
            cantidadBaneras + " bañeras o el " + porcentajePiscina + "% de una piscina al mes!";
        descripcionEscenario.textContent =
            "Superas en un " + (porcentajeComparacion - 100) +
            "% la referencia recomendada por la OMS para tu hogar. Revisa las áreas críticas de ducha, lavadora y riego sugeridas abajo.";
    } else {
        // ESCENARIO 2: CONSUMO EFICIENTE (Gráfico de bajo impacto en VERDE + Felicitación)
        tituloPerfilConsumo.textContent = "Perfil de consumo eficiente y responsable";
        alertaEscenario.classList.remove("alerta-roja");
        alertaEscenario.classList.add("alerta-verde");
        barraPiscinaRelleno.style.backgroundColor = "#15803d";

        tituloEscenario.textContent =
            "✓ ¡Felicitaciones por tu eficiencia hídrica! (" + porcentajeComparacion + "% de la referencia OMS)";
        descripcionEscenario.textContent =
            "Tu consumo se mantiene por debajo de la media recomendada. Solo utilizas el equivalente a " +
            cantidadBaneras + " bañeras al mes para todo tu hogar.";
    }

    // Generar los 3 consejos personalizados según las respuestas de mayor impacto
    const consejosPersonalizados = [];

    if (tipoDucha === "alto") {
        consejosPersonalizados.push("Área crítica — Ducha: Reducir tu ducha de más de 10 minutos a 5 minutos ahorraría hasta 2 400 L/mes por persona.");
    } else if (tipoDucha === "medio") {
        consejosPersonalizados.push("Ducha: Cierra la llave mientras te enjabonas o aplicas shampoo para bajar de 10 a 5 minutos.");
    } else {
        consejosPersonalizados.push("Ducha eficiente: Mantén tu hábito de duchas breves de hasta 5 minutos.");
    }

    if (nivelLavadora === "alta") {
        consejosPersonalizados.push("Área crítica — Lavadora: Disminuye las 5+ cargas semanales agrupando prendas para lavar solo con carga completa.");
    } else {
        consejosPersonalizados.push("Lavadora: Reutiliza el agua del último enjuague para limpiar pisos o patios.");
    }

    if (tipoRiego === "manguera") {
        consejosPersonalizados.push("Área crítica — Riego: Reemplaza la manguera abierta por regadera o balde; ahorrarás hasta 1 800 L al mes.");
    } else {
        consejosPersonalizados.push("Riego y grifos: Revisa periódicamente los empaques de caños e inodoros para evitar fugas silenciosas.");
    }

    listaConsejos.innerHTML = consejosPersonalizados
        .map(function (texto) {
            return "<li>" + texto + "</li>";
        })
        .join("");
}

// Escuchar cambios ("change") en las 4 preguntas para actualizar la calculadora en tiempo real
if (selectPersonas && selectLavadora && selectRiego) {
    selectPersonas.addEventListener("change", actualizarCalculadoraYEquivalencias);
    selectLavadora.addEventListener("change", actualizarCalculadoraYEquivalencias);
    selectRiego.addEventListener("change", actualizarCalculadoraYEquivalencias);
    radiosDucha.forEach(function (radio) {
        radio.addEventListener("change", actualizarCalculadoraYEquivalencias);
    });

    // Ejecutar una vez al cargar la página para mostrar el cálculo inicial
    actualizarCalculadoraYEquivalencias();
}

/* ============================================================================
 * MÓDULO 5: FORMULARIO DE CONTACTO (#contacto)
 * - Elementos del DOM seleccionados: #formulario-contacto, #nombre, #correo, #mensaje, #resultado-contacto
 * - Evento escuchado: "submit"
 * - Cambios en el DOM: valida los campos y muestra un mensaje personalizado de confirmación.
 * ============================================================================ */
const formularioContacto = document.getElementById("formulario-contacto");
const inputNombreContacto = document.getElementById("nombre");
const inputCorreoContacto = document.getElementById("correo");
const inputMensajeContacto = document.getElementById("mensaje");
const resultadoContacto = document.getElementById("resultado-contacto");

if (formularioContacto) {
    formularioContacto.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = inputNombreContacto.value.trim();
        const correo = inputCorreoContacto.value.trim();
        const mensaje = inputMensajeContacto.value.trim();

        inputNombreContacto.classList.remove("campo-error");
        inputCorreoContacto.classList.remove("campo-error");
        inputMensajeContacto.classList.remove("campo-error");

        if (nombre.length < 2) {
            inputNombreContacto.classList.add("campo-error");
            resultadoContacto.hidden = false;
            resultadoContacto.textContent = "Por favor, ingresa tu nombre antes de enviar.";
            inputNombreContacto.focus();
            return;
        }

        if (!correo.includes("@") || !correo.includes(".")) {
            inputCorreoContacto.classList.add("campo-error");
            resultadoContacto.hidden = false;
            resultadoContacto.textContent = "Por favor, ingresa un correo electrónico válido.";
            inputCorreoContacto.focus();
            return;
        }

        if (mensaje.length < 15) {
            inputMensajeContacto.classList.add("campo-error");
            resultadoContacto.hidden = false;
            resultadoContacto.textContent = "Tu mensaje debe tener al menos 15 caracteres para explicar tu idea.";
            inputMensajeContacto.focus();
            return;
        }

        resultadoContacto.hidden = false;
        resultadoContacto.innerHTML =
            "<strong>¡Gracias por tu aporte, " + nombre + "!</strong> Hemos registrado tu idea en esta demostración académica vinculada con el ODS 6.";
        formularioContacto.reset();
    });
}
