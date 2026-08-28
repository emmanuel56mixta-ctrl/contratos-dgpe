// ===========================================================================
// COPIA DE TRABAJO — AJUSTE DE MONTOS MENSUALES
// La versión original del sitio no se modifica.
// ===========================================================================

const MONTOS_AJUSTADOS_COPIA = Object.freeze({
  DMD: 13248.00,
  Robotica: 14668.00,
});

PRESTADORES.forEach((prestador) => {
  const nuevoMonto = MONTOS_AJUSTADOS_COPIA[prestador.programa];

  if (typeof nuevoMonto === "number") {
    prestador.montoMensual = nuevoMonto;
  }
});
