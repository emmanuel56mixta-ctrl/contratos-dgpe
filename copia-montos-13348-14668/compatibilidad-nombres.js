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
// VALIDACIÓN FINAL DEL NOMBRE EN FIRMAS — SOLO PARA ESTA COPIA
// ===========================================================================
// Algunas plantillas Word pueden conservar un nombre escrito directamente en
// el bloque final de firmas. Esta capa vuelve a abrir cada DOCX ya generado y
// sustituye cualquier nombre de otro prestador por el nombre correcto del
// contrato, incluso cuando Word ha dividido el nombre entre varios <w:t>.
// También revisa encabezados y pies de página.
// ===========================================================================

(function () {
  const generarContratoIndividualOriginal = generarContratoIndividual;

  function quitarAcentos(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escaparRegExp(valor) {
    return String(valor).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function patronNombre(nombre) {
    return String(nombre || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(escaparRegExp)
      .join("\\s+");
  }

  function reemplazarRangoEnNodos(nodos, inicio, fin, reemplazo) {
    let acumulado = 0;
    let indiceInicio = -1;
    let indiceFin = -1;
    let offsetInicio = 0;
    let offsetFin = 0;

    for (let i = 0; i < nodos.length; i++) {
      const texto = nodos[i].textContent || "";
      const siguiente = acumulado + texto.length;

      if (indiceInicio === -1 && inicio >= acumulado && inicio < siguiente) {
        indiceInicio = i;
        offsetInicio = inicio - acumulado;
      }

      if (indiceFin === -1 && fin > acumulado && fin <= siguiente) {
        indiceFin = i;
        offsetFin = fin - acumulado;
      }

      acumulado = siguiente;
      if (indiceInicio !== -1 && indiceFin !== -1) break;
    }

    if (indiceInicio === -1 || indiceFin === -1) return false;

    if (indiceInicio === indiceFin) {
      const original = nodos[indiceInicio].textContent || "";
      nodos[indiceInicio].textContent =
        original.slice(0, offsetInicio) + reemplazo + original.slice(offsetFin);
      return true;
    }

    const textoInicio = nodos[indiceInicio].textContent || "";
    const textoFin = nodos[indiceFin].textContent || "";

    nodos[indiceInicio].textContent = textoInicio.slice(0, offsetInicio) + reemplazo;

    for (let i = indiceInicio + 1; i < indiceFin; i++) {
      nodos[i].textContent = "";
    }

    nodos[indiceFin].textContent = textoFin.slice(offsetFin);
    return true;
  }

  function corregirNombresEnXML(xml, nombreCorrecto) {
    const parser = new DOMParser();
    const documento = parser.parseFromString(xml, "application/xml");

    if (documento.getElementsByTagName("parsererror").length > 0) {
      throw new Error("No se pudo analizar el contenido interno del contrato Word");
    }

    const variantes = new Set();
    PRESTADORES.forEach((prestador) => {
      variantes.add(prestador.nombre);
      variantes.add(quitarAcentos(prestador.nombre));
    });

    const parrafos = Array.from(documento.getElementsByTagName("w:p"));
    let cambios = 0;

    parrafos.forEach((parrafo) => {
      const nodos = Array.from(parrafo.getElementsByTagName("w:t"));
      if (nodos.length === 0) return;

      variantes.forEach((variante) => {
        const patron = patronNombre(variante);
        if (!patron) return;

        let textoVisible = nodos.map((nodo) => nodo.textContent || "").join("");
        let expresion = new RegExp(patron, "giu");
        let coincidencia;

        while ((coincidencia = expresion.exec(textoVisible)) !== null) {
          // Si ya es exactamente el nombre oficial del prestador, no tocarlo.
          if (coincidencia[0] === nombreCorrecto) continue;

          const inicio = coincidencia.index;
          const fin = inicio + coincidencia[0].length;

          if (!reemplazarRangoEnNodos(nodos, inicio, fin, nombreCorrecto)) break;

          cambios++;
          textoVisible = nodos.map((nodo) => nodo.textContent || "").join("");
          expresion = new RegExp(patron, "giu");
          expresion.lastIndex = inicio + nombreCorrecto.length;
        }
      });
    });

    if (cambios === 0) {
      return { xml, cambios: 0 };
    }

    const serializer = new XMLSerializer();
    return {
      xml: serializer.serializeToString(documento),
      cambios,
    };
  }

  async function validarNombrePrestadorEnDocx(blob, persona) {
    const buffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const rutas = Object.keys(zip.files).filter((ruta) =>
      ruta === "word/document.xml" ||
      /^word\/header\d+\.xml$/i.test(ruta) ||
      /^word\/footer\d+\.xml$/i.test(ruta)
    );

    let totalCambios = 0;

    for (const ruta of rutas) {
      const archivo = zip.file(ruta);
      if (!archivo) continue;

      const original = await archivo.async("string");
      const corregido = corregirNombresEnXML(original, persona.nombre);

      if (corregido.cambios > 0) {
        zip.file(ruta, corregido.xml);
        totalCambios += corregido.cambios;
      }
    }

    if (totalCambios === 0) return blob;

    return await zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      compression: "DEFLATE",
    });
  }

  generarContratoIndividual = async function (persona, datos) {
    const resultado = await generarContratoIndividualOriginal(persona, datos);
    resultado.blob = await validarNombrePrestadorEnDocx(resultado.blob, persona);
    return resultado;
  };
})();
