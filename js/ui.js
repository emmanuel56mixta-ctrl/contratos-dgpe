// ===========================================================================
// LÓGICA DE LA INTERFAZ DE USUARIO
// ===========================================================================

let filasParseadas = [];
let zipResultado = null;

// ---------------------------------------------------------------------------
//  RENDERIZAR LISTA DE PRESTADORES
// ---------------------------------------------------------------------------

function renderizarPrestadores() {
  const tbody = document.getElementById("prestadores-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  PRESTADORES.forEach((p, idx) => {
    const tr = document.createElement("tr");
    const monto = formatearMonto(p.montoMensual);
    tr.innerHTML = `
      <td><span class="badge ${p.programa === 'DMD' ? 'badge-dmd' : 'badge-rob'}">${p.programa}</span></td>
      <td class="nombre-cell">${p.nombre}</td>
      <td><code>${p.rfc}</code></td>
      <td>${p.email}</td>
      <td class="text-right">${monto}</td>
      <td class="text-right">${p.isrPct}%</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("contador-prestadores").textContent = PRESTADORES.length;
}

// ---------------------------------------------------------------------------
//  PARSEAR EXCEL SUBIDO
// ---------------------------------------------------------------------------

async function parsearExcel(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, dateNF: "yyyy-mm-dd" });
        resolve(filas);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsArrayBuffer(file);
  });
}

function detectarHeaders(filas) {
  // Busca la fila que contenga los headers esperados
  // Headers esperados: Nombre, DGPE, Fecha inicio, Fecha fin, Fecha firma
  for (let i = 0; i < Math.min(10, filas.length); i++) {
    const fila = filas[i];
    if (!fila || fila.length === 0) continue;
    const lower = fila.map(c => String(c || "").toLowerCase());
    const tieneNombre = lower.some(c => c.includes("nombre"));
    const tieneDgpe = lower.some(c => c.includes("dgpe") || c.includes("contrato"));
    if (tieneNombre && tieneDgpe) return i;
  }
  // Si no encuentra, asume que la primera fila no vacía es el header
  for (let i = 0; i < filas.length; i++) {
    if (filas[i] && filas[i].length >= 5) return i;
  }
  return 0;
}

function extraerDatos(filas) {
  // Devuelve array de { nombre, numDgpe, fechaInicio, fechaFin, fechaFirma }
  const headerIdx = detectarHeaders(filas);
  const datos = [];
  for (let i = headerIdx + 1; i < filas.length; i++) {
    const fila = filas[i];
    if (!fila || fila.length < 5) continue;
    const [nombre, numDgpe, fechaInicio, fechaFin, fechaFirma] = fila;
    if (!nombre || !numDgpe || !fechaInicio || !fechaFin || !fechaFirma) continue;
    datos.push({
      nombre: String(nombre).trim(),
      numDgpe: String(numDgpe).trim(),
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      fechaFirma: fechaFirma,
    });
  }
  return datos;
}

// ---------------------------------------------------------------------------
//  RENDERIZAR VISTA PREVIA DE LO QUE SE VA A GENERAR
// ---------------------------------------------------------------------------

function formatearFechaCorta(valor) {
  try {
    const f = parsearFecha(valor);
    return f.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  } catch (e) {
    return String(valor);
  }
}

function renderizarPreview(filas) {
  const tbody = document.getElementById("preview-tbody");
  const sin = document.getElementById("preview-vacio");
  const cont = document.getElementById("preview-contenedor");
  const btnGenerar = document.getElementById("btn-generar");

  tbody.innerHTML = "";

  if (filas.length === 0) {
    sin.style.display = "block";
    cont.style.display = "none";
    btnGenerar.disabled = true;
    return;
  }

  sin.style.display = "none";
  cont.style.display = "block";

  let okCount = 0;
  filas.forEach((fila, idx) => {
    const clave = normalizarNombre(fila.nombre);
    const persona = PRESTADORES_POR_NOMBRE[clave];
    const tr = document.createElement("tr");

    if (!persona) {
      tr.classList.add("fila-error");
      tr.innerHTML = `
        <td class="status-cell"><span class="status-error">✕</span></td>
        <td>${fila.nombre} <small class="error-text">— no está en la base</small></td>
        <td><code>${fila.numDgpe}</code></td>
        <td colspan="3">—</td>
      `;
    } else {
      okCount++;
      let numMeses, vigencia;
      try {
        const ini = parsearFecha(fila.fechaInicio);
        const fin = parsearFecha(fila.fechaFin);
        numMeses = contarMeses(ini, fin);
        vigencia = `${formatearFechaCorta(ini)} → ${formatearFechaCorta(fin)}`;
      } catch (e) {
        vigencia = "Fecha inválida";
        numMeses = "?";
      }
      tr.innerHTML = `
        <td class="status-cell"><span class="status-ok">✓</span></td>
        <td>
          <span class="badge ${persona.programa === 'DMD' ? 'badge-dmd' : 'badge-rob'}">${persona.programa}</span>
          ${persona.nombre}
        </td>
        <td><code>${fila.numDgpe}</code></td>
        <td class="text-small">${vigencia}</td>
        <td class="text-right">${numMeses} mes${numMeses === 1 ? "" : "es"}</td>
        <td class="text-small">${formatearFechaCorta(fila.fechaFirma)}</td>
      `;
    }
    tbody.appendChild(tr);
  });

  document.getElementById("preview-contador").textContent = `${okCount} de ${filas.length}`;
  btnGenerar.disabled = okCount === 0;
}

// ---------------------------------------------------------------------------
//  HANDLERS
// ---------------------------------------------------------------------------

async function manejarArchivo(file) {
  const dropZone = document.getElementById("drop-zone");
  const fileName = document.getElementById("file-name");
  const errorBox = document.getElementById("error-archivo");
  errorBox.textContent = "";

  if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
    errorBox.textContent = "El archivo debe ser .xlsx, .xls o .csv";
    return;
  }

  fileName.textContent = file.name;
  dropZone.classList.add("has-file");

  try {
    const filasRaw = await parsearExcel(file);
    filasParseadas = extraerDatos(filasRaw);
    renderizarPreview(filasParseadas);
  } catch (e) {
    errorBox.textContent = "Error al leer el archivo: " + e.message;
    filasParseadas = [];
    renderizarPreview([]);
  }
}

async function manejarGeneracion() {
  const btnGenerar = document.getElementById("btn-generar");
  const progress = document.getElementById("progress-container");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const resultado = document.getElementById("resultado-container");

  btnGenerar.disabled = true;
  progress.style.display = "block";
  resultado.style.display = "none";

  try {
    const { zipBlob, generados, errores } = await generarTodos(filasParseadas, (i, total, nombre) => {
      const pct = (i / total) * 100;
      progressBar.style.width = pct + "%";
      progressText.textContent = `Generando ${i}/${total}: ${nombre}`;
    });

    zipResultado = zipBlob;

    progress.style.display = "none";

    // Mostrar resultado
    const fechaStamp = new Date().toISOString().slice(0, 10);
    document.getElementById("resultado-conteo").textContent = generados.length;
    document.getElementById("resultado-nombre").textContent = `contratos_${fechaStamp}.zip`;

    const erroresContainer = document.getElementById("errores-container");
    if (errores.length > 0) {
      let html = `<strong>Con problemas (${errores.length}):</strong><ul>`;
      errores.forEach(e => {
        html += `<li><strong>${e.nombre}</strong>: ${e.error}</li>`;
      });
      html += "</ul>";
      erroresContainer.innerHTML = html;
      erroresContainer.style.display = "block";
    } else {
      erroresContainer.style.display = "none";
    }

    resultado.style.display = "block";
  } catch (e) {
    alert("Error al generar contratos: " + e.message);
    console.error(e);
    progress.style.display = "none";
  }

  btnGenerar.disabled = false;
}

function descargarZip() {
  if (!zipResultado) return;
  const fechaStamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(zipResultado);
  a.download = `contratos_${fechaStamp}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ---------------------------------------------------------------------------
//  PLANTILLA DE EXCEL DESCARGABLE
// ---------------------------------------------------------------------------

function descargarPlantillaExcel() {
  const wb = XLSX.utils.book_new();
  const datos = [
    ["Nombre completo", "Número DGPE", "Fecha inicio", "Fecha fin", "Fecha firma"],
    ["", "", "", "", ""],
  ];
  // Pre-llenar con todos los nombres
  PRESTADORES.forEach(p => {
    datos.push([p.nombre, "", "", "", ""]);
  });
  // Reemplazar la fila vacía por una fila de ejemplo
  datos[1] = ["Ejemplo: Gilberto Solano García", "DGPE 659/2026", "2026-05-01", "2026-07-31", "2026-04-30"];

  const ws = XLSX.utils.aoa_to_sheet(datos);
  ws["!cols"] = [
    { wch: 38 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Generar");
  XLSX.writeFile(wb, "PLANTILLA_GENERAR.xlsx");
}

// ---------------------------------------------------------------------------
//  INICIALIZACIÓN
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  renderizarPrestadores();

  // Drag & drop
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");

  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) manejarArchivo(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) manejarArchivo(e.target.files[0]);
  });

  document.getElementById("btn-generar").addEventListener("click", manejarGeneracion);
  document.getElementById("btn-descargar").addEventListener("click", descargarZip);
  document.getElementById("btn-plantilla-excel").addEventListener("click", descargarPlantillaExcel);

  // Tabs
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });
});
