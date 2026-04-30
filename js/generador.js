// ===========================================================================
// LÓGICA DE GENERACIÓN DE CONTRATOS
// ===========================================================================

// ---------------------------------------------------------------------------
//  CONVERSIÓN DE NÚMEROS A LETRAS (español, pesos mexicanos)
// ---------------------------------------------------------------------------

const UNIDADES_LETRA = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
  "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco",
  "veintiséis", "veintisiete", "veintiocho", "veintinueve"];

const DECENAS_LETRA = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];

const CENTENAS_LETRA = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos",
  "seiscientos", "setecientos", "ochocientos", "novecientos"];

function leerCentenas(n) {
  // n entre 0 y 999
  if (n === 0) return "";
  if (n === 100) return "cien";
  let texto = "";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  if (c > 0) texto += CENTENAS_LETRA[c];
  if (resto > 0) {
    if (texto) texto += " ";
    if (resto < 30) {
      texto += UNIDADES_LETRA[resto];
    } else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      texto += DECENAS_LETRA[d];
      if (u > 0) texto += " y " + UNIDADES_LETRA[u];
    }
  }
  return texto;
}

function numeroALetras(n) {
  // Convierte un entero (hasta millones) a letras en español
  n = Math.floor(n);
  if (n === 0) return "cero";
  if (n < 1000) return leerCentenas(n);

  if (n < 1000000) {
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    let texto = "";
    if (miles === 1) texto = "mil";
    else texto = leerCentenas(miles) + " mil";
    if (resto > 0) texto += " " + leerCentenas(resto);
    return texto;
  }

  // Millones (poco probable en este contexto, pero por completitud)
  const millones = Math.floor(n / 1000000);
  const resto = n % 1000000;
  let texto = "";
  if (millones === 1) texto = "un millón";
  else texto = leerCentenas(millones) + " millones";
  if (resto > 0) {
    if (resto < 1000) texto += " " + leerCentenas(resto);
    else {
      const miles = Math.floor(resto / 1000);
      const sub = resto % 1000;
      if (miles === 1) texto += " mil";
      else texto += " " + leerCentenas(miles) + " mil";
      if (sub > 0) texto += " " + leerCentenas(sub);
    }
  }
  return texto;
}

function montoALetra(monto) {
  // 13248.27 → "Trece mil doscientos cuarenta y ocho pesos 27/100 M.N."
  const enteros = Math.floor(monto);
  const centavos = Math.round((monto - enteros) * 100);
  const enLetra = numeroALetras(enteros);
  const enLetraCap = enLetra.charAt(0).toUpperCase() + enLetra.slice(1);
  return `${enLetraCap} pesos ${String(centavos).padStart(2, "0")}/100 M.N.`;
}

function formatearMonto(numero) {
  return "$" + numero.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
//  FECHAS Y PERIODOS EN FORMATO LEGAL
// ---------------------------------------------------------------------------

const MESES_ES = {
  1: "enero", 2: "febrero", 3: "marzo", 4: "abril",
  5: "mayo", 6: "junio", 7: "julio", 8: "agosto",
  9: "septiembre", 10: "octubre", 11: "noviembre", 12: "diciembre",
};

// Para vigencia: día 1 = "primero"
const DIAS_LETRA_ORDINAL = {
  1: "primero", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
  6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
  11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince",
  16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve",
  20: "veinte", 21: "veintiuno", 22: "veintidós", 23: "veintitrés",
  24: "veinticuatro", 25: "veinticinco", 26: "veintiséis",
  27: "veintisiete", 28: "veintiocho", 29: "veintinueve",
  30: "treinta", 31: "treinta y uno",
};

// Para fecha de firma: día 1 = "uno"
const DIAS_LETRA_CARDINAL = { ...DIAS_LETRA_ORDINAL, 1: "uno" };

function añoALetra(año) {
  const mapa = {
    2025: "dos mil veinticinco", 2026: "dos mil veintiséis",
    2027: "dos mil veintisiete", 2028: "dos mil veintiocho",
    2029: "dos mil veintinueve", 2030: "dos mil treinta",
  };
  return mapa[año] || String(año);
}

function parsearFecha(valor) {
  // Acepta "AAAA-MM-DD" o Date
  if (valor instanceof Date) return valor;
  if (typeof valor === "string") {
    const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
    // Probar DD/MM/YYYY
    const m2 = valor.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m2) return new Date(parseInt(m2[3]), parseInt(m2[2]) - 1, parseInt(m2[1]));
  }
  if (typeof valor === "number") {
    // Excel guarda fechas como número de días desde 1900-01-01
    return new Date((valor - 25569) * 86400 * 1000);
  }
  throw new Error("Fecha inválida: " + valor);
}

function fechaFirmaLarga(fecha) {
  const d = fecha.getDate();
  const m = fecha.getMonth() + 1;
  const y = fecha.getFullYear();
  const dia2 = String(d).padStart(2, "0");
  return `${dia2} ${DIAS_LETRA_CARDINAL[d]} del mes de ${MESES_ES[m]} de ${y} ${añoALetra(y)}`;
}

function vigenciaLarga(inicio, fin) {
  const di = inicio.getDate(), mi = inicio.getMonth() + 1, yi = inicio.getFullYear();
  const df = fin.getDate(), mf = fin.getMonth() + 1, yf = fin.getFullYear();
  return `${di} ${DIAS_LETRA_ORDINAL[di]} de ${MESES_ES[mi]} de ${yi} ${añoALetra(yi)} ` +
         `y concluirá el ${df} ${DIAS_LETRA_ORDINAL[df]} de ${MESES_ES[mf]} de ${yf} ${añoALetra(yf)}.`;
}

function construirMesPago(inicio, fin) {
  // 1 mes: "mayo de 2026 dos mil veintiséis"
  // 2: "mayo y junio de 2026 dos mil veintiséis"
  // 3+: "mayo, junio y julio de 2026 dos mil veintiséis"
  const meses = [];
  let y = inicio.getFullYear(), m = inicio.getMonth() + 1;
  const yEnd = fin.getFullYear(), mEnd = fin.getMonth() + 1;
  while (y < yEnd || (y === yEnd && m <= mEnd)) {
    meses.push({ y, m });
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  const años = [...new Set(meses.map(x => x.y))].sort();
  if (años.length === 1) {
    const año = años[0];
    const nombres = meses.map(x => MESES_ES[x.m]);
    let txt;
    if (nombres.length === 1) txt = nombres[0];
    else if (nombres.length === 2) txt = `${nombres[0]} y ${nombres[1]}`;
    else txt = nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1];
    return `${txt} de ${año} ${añoALetra(año)}`;
  } else {
    const partes = años.map(año => {
      const nombres = meses.filter(x => x.y === año).map(x => MESES_ES[x.m]);
      let txt;
      if (nombres.length === 1) txt = nombres[0];
      else if (nombres.length === 2) txt = `${nombres[0]} y ${nombres[1]}`;
      else txt = nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1];
      return `${txt} de ${año} ${añoALetra(año)}`;
    });
    return partes.join(" y ");
  }
}

function contarMeses(inicio, fin) {
  let n = 0;
  let y = inicio.getFullYear(), m = inicio.getMonth() + 1;
  const yEnd = fin.getFullYear(), mEnd = fin.getMonth() + 1;
  while (y < yEnd || (y === yEnd && m <= mEnd)) {
    n += 1;
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return n;
}

// ---------------------------------------------------------------------------
//  ESCAPE XML
// ---------------------------------------------------------------------------

function escaparXML(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
//  CARGAR PLANTILLAS DESDE BASE64
// ---------------------------------------------------------------------------

async function cargarPlantilla(programa) {
  // PLANTILLA_DMD_BASE64 y PLANTILLA_ROBOTICA_BASE64 están definidas en plantillas.js
  const b64 = programa === "DMD" ? PLANTILLA_DMD_BASE64 : PLANTILLA_ROBOTICA_BASE64;
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return await JSZip.loadAsync(bytes);
}

// ---------------------------------------------------------------------------
//  GENERAR UN CONTRATO INDIVIDUAL
// ---------------------------------------------------------------------------

async function generarContratoIndividual(persona, datos) {
  const fecIni = parsearFecha(datos.fechaInicio);
  const fecFin = parsearFecha(datos.fechaFin);
  const fecFirma = parsearFecha(datos.fechaFirma);
  const numMeses = contarMeses(fecIni, fecFin);

  // Cálculos mensuales
  const montoMen = persona.montoMensual;
  const ivaMen = Math.round(montoMen * 0.16 * 100) / 100;
  const isrMen = Math.round(montoMen * persona.isrPct * 100) / 10000;
  const netoMen = Math.round((montoMen + ivaMen - isrMen) * 100) / 100;

  // Total del contrato
  const montoTot = Math.round(montoMen * numMeses * 100) / 100;

  // Strings con número y letra
  const montoMenStr = `${formatearMonto(montoMen)} (${montoALetra(montoMen)})`;
  const ivaMenStr = `${formatearMonto(ivaMen)} (${montoALetra(ivaMen)})`;
  const isrMenStr = `${formatearMonto(isrMen)} (${montoALetra(isrMen)})`;
  const netoMenStr = `${formatearMonto(netoMen)} (${montoALetra(netoMen)})`;
  const montoTotStr = `${formatearMonto(montoTot)} (${montoALetra(montoTot)})`;

  // Reemplazos simples
  const reemplazos = {
    "{{NUM_DGPE}}": datos.numDgpe,
    "{{FECHA_FIRMA_LARGA}}": fechaFirmaLarga(fecFirma),
    "{{NOMBRE_COMPLETO}}": persona.nombre,
    "{{CLAVE_PRESUPUESTAL}}": persona.clavePres,
    "{{RFC}}": persona.rfc,
    "{{DOMICILIO_FISICO}}": persona.domFisico,
    "{{DOMICILIO_FISCAL}}": persona.domFiscal,
    "{{EMAIL}}": persona.email,
    "{{OBJETO_CONTRATO}}": persona.objeto,
    "{{VIGENCIA}}": vigenciaLarga(fecIni, fecFin),
    "{{PORCENTAJE_ISR}}": persona.isrPct + "%",
    "{{MES_PAGO}}": construirMesPago(fecIni, fecFin),
    "{{IVA_LETRA}}": ivaMenStr,
    "{{ISR_LETRA}}": isrMenStr,
    "{{NETO_LETRA}}": netoMenStr,
  };

  const zip = await cargarPlantilla(persona.programa);
  const archivos = ["word/document.xml", "word/header1.xml", "word/header2.xml", "word/header3.xml"];

  for (const ruta of archivos) {
    const archivo = zip.file(ruta);
    if (!archivo) continue;
    let contenido = await archivo.async("string");

    // Las plantillas tienen 2 ocurrencias de {{MONTO_LETRA}}
    // 1ra = TOTAL del contrato. 2da = MENSUAL.
    contenido = contenido.replace("{{MONTO_LETRA}}", escaparXML(montoTotStr));
    contenido = contenido.replace("{{MONTO_LETRA}}", escaparXML(montoMenStr));

    for (const [placeholder, valor] of Object.entries(reemplazos)) {
      // Reemplazo global (todas las ocurrencias)
      contenido = contenido.split(placeholder).join(escaparXML(valor));
    }

    zip.file(ruta, contenido);
  }

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });

  return { blob, numMeses };
}

// ---------------------------------------------------------------------------
//  GENERAR ZIP CON TODOS LOS CONTRATOS
// ---------------------------------------------------------------------------

function nombreArchivoSeguro(s) {
  return String(s)
    // Quitar caracteres no permitidos (preservando letras con acento)
    .replace(/[^\p{L}\p{N}\s\-\.]/gu, "")
    .replace(/\s+/g, "_");
}

function normalizarNombre(s) {
  return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

async function generarTodos(filasExcel, onProgress) {
  // filasExcel: array de objetos { nombre, numDgpe, fechaInicio, fechaFin, fechaFirma }
  const zipFinal = new JSZip();
  const generados = [];
  const errores = [];

  for (let i = 0; i < filasExcel.length; i++) {
    const fila = filasExcel[i];
    if (onProgress) onProgress(i + 1, filasExcel.length, fila.nombre);

    const clave = normalizarNombre(fila.nombre);
    const persona = PRESTADORES_POR_NOMBRE[clave];

    if (!persona) {
      errores.push({ nombre: fila.nombre, error: "No está en la base de datos" });
      continue;
    }

    try {
      const { blob, numMeses } = await generarContratoIndividual(persona, fila);
      const numSafe = nombreArchivoSeguro(fila.numDgpe);
      const nomSafe = nombreArchivoSeguro(persona.nombre);
      const progTag = persona.programa === "DMD" ? "DMD" : "ROB";
      const nombreArchivo = `${progTag}__${numSafe}__${nomSafe}.docx`;
      // Convertir el blob a ArrayBuffer para que JSZip lo acepte
      const arrayBuffer = await blob.arrayBuffer();
      zipFinal.file(nombreArchivo, arrayBuffer);
      generados.push({ nombre: persona.nombre, archivo: nombreArchivo, numMeses });
    } catch (e) {
      errores.push({ nombre: fila.nombre, error: e.message });
    }
  }

  const zipBlob = await zipFinal.generateAsync({ type: "blob" });
  return { zipBlob, generados, errores };
}
