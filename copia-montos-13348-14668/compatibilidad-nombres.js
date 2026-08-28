// ===========================================================================
// COMPATIBILIDAD DE NOMBRES — SOLO PARA ESTA COPIA
// ===========================================================================
// Permite reconocer a un prestador aunque el Excel traiga sus apellidos y
// nombres en un orden distinto. También elimina automáticamente filas de
// ejemplo para que no aparezcan como errores en la vista previa.
// ===========================================================================

(function () {
  function claveNombreFlexible(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9ñ\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .sort()
      .join(" ");
  }

  // Agregar una segunda clave de búsqueda para cada prestador basada en las
  // mismas palabras del nombre, independientemente de su orden.
  PRESTADORES.forEach((prestador) => {
    PRESTADORES_POR_NOMBRE[claveNombreFlexible(prestador.nombre)] = prestador;
  });

  // Reemplaza el normalizador compartido únicamente dentro de esta copia.
  normalizarNombre = function (valor) {
    return claveNombreFlexible(valor);
  };

  // Evita que filas como "Ejemplo (puedes borrar esta fila)" se procesen.
  extraerDatos = function (filas) {
    const headerIdx = detectarHeaders(filas);
    const datos = [];

    for (let i = headerIdx + 1; i < filas.length; i++) {
      const fila = filas[i];
      if (!fila || fila.length < 5) continue;

      const [nombre, numDgpe, fechaInicio, fechaFin, fechaFirma] = fila;
      if (!nombre || !numDgpe || !fechaInicio || !fechaFin || !fechaFirma) continue;

      const nombreTexto = String(nombre).trim();
      const nombreLimpio = nombreTexto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      if (nombreLimpio.includes("ejemplo")) continue;

      datos.push({
        nombre: nombreTexto,
        numDgpe: String(numDgpe).trim(),
        fechaInicio,
        fechaFin,
        fechaFirma,
      });
    }

    return datos;
  };

  // La plantilla descargable de esta copia ya no incluye una fila de ejemplo.
  descargarPlantillaExcel = function () {
    const wb = XLSX.utils.book_new();
    const datos = [
      ["Nombre completo", "Número DGPE", "Fecha inicio", "Fecha fin", "Fecha firma"],
    ];

    PRESTADORES.forEach((p) => {
      datos.push([p.nombre, "", "", "", ""]);
    });

    const ws = XLSX.utils.aoa_to_sheet(datos);
    ws["!cols"] = [
      { wch: 38 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Generar");
    XLSX.writeFile(wb, "PLANTILLA_GENERAR.xlsx");
  };
})();

// ===========================================================================
// CORRECCIÓN DE NOMBRES INCRUSTADOS EN LAS PLANTILLAS WORD
// ===========================================================================
// Las plantillas originales conservan dos nombres escritos directamente en el
// bloque de firmas:
//   DMD      -> XIMENA JAZMÍN BARRÓN ROMO
//   Robótica -> MYRNA LIVIER CALLEJA RAMOS
//
// Al terminar cada contrato, esta capa abre el DOCX y sustituye esas dos
// ocurrencias por EL NOMBRE DEL PRESTADOR QUE SE ESTÁ GENERANDO. Así el nombre
// de la firma y el de la leyenda "HOJA DE FIRMAS" siempre coinciden con el
// contrato, sin depender del nombre que traiga la plantilla de origen.
// ===========================================================================

(function () {
  const generarContratoIndividualOriginal = generarContratoIndividual;

  const NOMBRE_BASE_DMD = "XIMENA JAZMÍN BARRÓN ROMO";
  const NOMBRE_BASE_ROBOTICA = "MYRNA LIVIER CALLEJA RAMOS";

  async function corregirNombreFinal(blob, persona) {
    const buffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const nombreBase = persona.programa === "DMD" ? NOMBRE_BASE_DMD : NOMBRE_BASE_ROBOTICA;
    const nombreCorrecto = escaparXML(String(persona.nombre || "").toUpperCase());

    const rutas = Object.keys(zip.files).filter((ruta) =>
      ruta === "word/document.xml" ||
      /^word\/header\d+\.xml$/i.test(ruta) ||
      /^word\/footer\d+\.xml$/i.test(ruta)
    );

    let ocurrenciasEncontradas = 0;

    for (const ruta of rutas) {
      const archivo = zip.file(ruta);
      if (!archivo) continue;

      let contenido = await archivo.async("string");
      const partes = contenido.split(nombreBase);
      const cantidad = partes.length - 1;

      if (cantidad > 0) {
        ocurrenciasEncontradas += cantidad;
        contenido = partes.join(nombreCorrecto);
        zip.file(ruta, contenido);
      }
    }

    // Para cualquier persona distinta del nombre base de la plantilla deben
    // existir las dos ocurrencias del bloque final: firma + hoja de firmas.
    if (nombreCorrecto !== nombreBase && ocurrenciasEncontradas < 2) {
      throw new Error(
        `No se pudo validar el nombre final de ${persona.nombre}. ` +
        `Se esperaban 2 referencias de la plantilla y se encontraron ${ocurrenciasEncontradas}.`
      );
    }

    return await zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      compression: "DEFLATE",
    });
  }

  generarContratoIndividual = async function (persona, datos) {
    const resultado = await generarContratoIndividualOriginal(persona, datos);
    resultado.blob = await corregirNombreFinal(resultado.blob, persona);
    return resultado;
  };
})();
