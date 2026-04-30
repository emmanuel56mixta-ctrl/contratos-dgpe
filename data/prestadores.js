// ===========================================================================
// BASE DE DATOS DE PRESTADORES
// ===========================================================================
// Edita aquí si alguien cambia de domicilio, RFC, email, etc.
// O si entra/sale alguien de la lista.
// ===========================================================================

const CLAVE_DMD = "21111040000014925622ESE5C13391002567001G120150";
const CLAVE_ROB = "21111040000014925622ESE5C23391002567001G120150";

const PRESTADORES = [
  // =================== PROGRAMA DMD ===================
  {
    programa: "DMD",
    nombre: "Gilberto Solano García",
    rfc: "SOGG750729HP2",
    email: "gilberto.solano.garcia@gmail.com",
    domFisico: "Emilio Rabaza 2087, Fco Glez B Blanco y Cuellar, C. P. 44730, Guadalajara, Jal.",
    domFiscal: "calle C. Emilio Rabaza, número 2087, colonia Blanco y Cuellar, C. P. 44730, de la municipalidad de Zapopan, Jalisco",
    objeto: "Editor de Video y realización audiovisual",
    clavePres: CLAVE_DMD,
    montoMensual: 13248.27,
    isrPct: 10.0,
  },
  {
    programa: "DMD",
    nombre: "Guadalupe Montserrat Viana Rojas",
    rfc: "VIRG910126585",
    email: "monseviana@gmail.com",
    domFisico: "Cll Rio Mezquitic 753 Arbolitos y Fco Villa Loma Bonita Ejidal, Zapopan, Zapopan Ja C.P. 45080 de la municipalidad de Zapopan, Jalisco",
    domFiscal: "calle Río Mezquitic, número 753, de la Colonia Loma Bonita Ejidal, C.P. 45085, de la Municipalidad de Zapopan, Jalisco",
    objeto: "Diseñador Gráfico y Diseño Editorial",
    clavePres: CLAVE_DMD,
    montoMensual: 13248.27,
    isrPct: 10.0,
  },
  {
    programa: "DMD",
    nombre: "Octavio Ahumada Morales",
    rfc: "AUMO010608DL4",
    email: "octavioahumada66@gmail.com",
    domFisico: "V Cofre de Perote 2084, Fujillama y Volcan Zacatecas El Colli Urbano 1ra C.P. 45070, Zapopan, Jal",
    domFiscal: "calle Volcán Cofre de Perote, número 2084, de la colonia El Colli Urbano 1ra Sección, C.P. 45070, de la Municipalidad de Zapopan, Jalisco",
    objeto: "Motion Graphics, Realización Audiovisual y Post Producción",
    clavePres: CLAVE_DMD,
    montoMensual: 13248.27,
    isrPct: 1.25,
  },
  {
    programa: "DMD",
    nombre: "Abraham Zaid Sánchez Vázquez",
    rfc: "SAVA050727R37",
    email: "abraham.zaid2005@gmail.com",
    domFisico: "Fco I Madero 329 Fco Villa Lomas del Batán C.P. 45190, Zapopan, Jal.",
    domFiscal: "calle Francisco I Madero, número 329, de la colonia Lomas del Batan, C.P. 45190, de la Municipalidad de Zapopan, Jalisco",
    objeto: "Producción y Post Producción de Video",
    clavePres: CLAVE_DMD,
    montoMensual: 13248.27,
    isrPct: 1.25,
  },
  {
    programa: "DMD",
    nombre: "Jorge Hernández Gutiérrez",
    rfc: "HEGJ960503DF6",
    email: "palilicum@gmail.com",
    domFisico: "Sinaloa 1379, 6 de Diciembre y Avila Camacho Mezquitán, C.P. 45190 Guadalajara, Jal.",
    domFiscal: "calle Sinaloa, número 1379, colonia La Normal, C.P. 44260, de la municipalidad de Guadalajara, Jalisco,",
    objeto: "Animador 2D y 3D",
    clavePres: CLAVE_DMD,
    montoMensual: 13248.27,
    isrPct: 10.0,
  },
  {
    programa: "DMD",
    nombre: "Kevin Michel Navarro Román",
    rfc: "NARK040521G99",
    email: "navarrokevin919@gmail.com",
    domFisico: "José Ma Castillo 142, Jesús Huerta José Casal, Residencial Poniente C.P. 45136, Zapopan, Jal.",
    domFiscal: "calle José María Castillo, número 142, colonia Residencial Poniente, C.P. 45136, de la municipalidad de Zapopan, Jalisco",
    objeto: "Motion Graphics y Edición de Video",
    clavePres: CLAVE_DMD,
    montoMensual: 13248.27,
    isrPct: 10.0,
  },
  {
    programa: "DMD",
    nombre: "Ximena Jazmín Barrón Romo",
    rfc: "BARX041126RS1",
    email: "jazmin.barx26@gmail.com",
    domFisico: "J Clemente Orozco 49 A, Picasso Frida Kahlo, Lomas de Tlaquepaque, C.P. 45559, Tlaquepaque, Jal,",
    domFiscal: "calle José Clemente Orozco, número 49, en la colonia Lomas de Tlaquepaque, C.P. 45559 de la Municipalidad de San Pedro Tlaquepaque, Jalisco",
    objeto: "Post Producción y Realización Audiovisual",
    clavePres: CLAVE_DMD,
    montoMensual: 13248.27,
    isrPct: 1.25,
  },

  // =================== PROGRAMA ROBÓTICA ===================
  {
    programa: "Robotica",
    nombre: "Rafael Padilla Ortega",
    rfc: "PAOR94122331A",
    email: "rafael.padilla@jalisco.gob.mx",
    domFisico: "Padre Javier Scheifler de Amezaga 675 Parques del Bosque, Tlaquepaque, Guadalajara, Jalisco C.P. 45609, de la municipalidad de Tlaquepaque, Jalisco",
    domFiscal: "675 de la Avenida Padre Xavier Scheifler de Amezaga, colonia Parques del Bosque, C.P. 45609, de la municipalidad de San Pedro Tlaquepaque, Jalisco",
    objeto: "Asesor Externo Especializado en Robótica",
    clavePres: CLAVE_ROB,
    montoMensual: 14668.53,
    isrPct: 1.25,
  },
  {
    programa: "Robotica",
    nombre: "Yair Hernández Ochoa",
    rfc: "HEOY020924NW9",
    email: "yairhdz107@gmail.com",
    domFisico: "la calle San Pedro 52, San Silvestre 5 de mayo, Santa Paula, C.P. 45420, de la Municipalidad de Tonalá, Jal.,",
    domFiscal: "San Pedro # 52, de la Colonia Santa Paula, C.P. 45420, de la Municipalidad de Tonalá, Jalisco",
    objeto: "Asesor Externo Especializado en Programación",
    clavePres: CLAVE_ROB,
    montoMensual: 14668.53,
    isrPct: 1.25,
  },
  {
    programa: "Robotica",
    nombre: "Myrna Livier Calleja Ramos",
    rfc: "CARM820810BD8",
    email: "liviercalleja@gmail.com",
    domFisico: "Valle del Olmo 216 Valle Verde y Valle del Sur, El Real, C.P. 45601, Tlaquepaque, Jal.,",
    domFiscal: "AND Vicente Arregui número 400, de la Colonia Miravalle, C.P. 44990, de la Municipalidad de Guadalajara, Jalisco.,",
    objeto: "Asesor Externo Especializado en Programación",
    clavePres: CLAVE_ROB,
    montoMensual: 14668.53,
    isrPct: 1.25,
  },
  {
    programa: "Robotica",
    nombre: "Diego Saúl Muñoz Arciniega",
    rfc: "MUAD0310205M3",
    email: "diego223624@gmail.com",
    domFisico: "E Alatorre 2847 R Castellanos Vergel, Libertad, C.P. 44750, Guadalajara, Jal.,",
    domFiscal: "Esteban Alatorre número 2847, de la Colonia Libertad, C.P. 44750, de la Municipalidad de Guadalajara, Jalisco",
    objeto: "Asesor Externo Especializado en Programación",
    clavePres: CLAVE_ROB,
    montoMensual: 14668.53,
    isrPct: 1.25,
  },
  {
    programa: "Robotica",
    nombre: "Luis Adán Mandujano Velasco",
    rfc: "MAVL9910018N8",
    email: "adan.mandujano26@gmail.com",
    domFisico: "Emilio Lázaro Cardenas 212, San Sebastián el Gde CR, C.P. 45650-CR 45603, Tlajomulco, Jal, JA.",
    domFiscal: "Calle Lázaro Cardenas, número 212, Localidad de San Sebastián el Grande, C.P. 45650, municipio de Tlajomulco de Zúñiga, Jalisco",
    objeto: "Asesor Externo Especializado en Programación en área de Robótica",
    clavePres: CLAVE_ROB,
    montoMensual: 14668.53,
    isrPct: 1.25,
  },
];

// Índice por nombre normalizado para búsqueda rápida
const PRESTADORES_POR_NOMBRE = {};
PRESTADORES.forEach(p => {
  const clave = p.nombre.toLowerCase().replace(/\s+/g, ' ').trim();
  PRESTADORES_POR_NOMBRE[clave] = p;
});
