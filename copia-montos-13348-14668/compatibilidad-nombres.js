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
