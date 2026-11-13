/**
 * Datos de ejemplo para mostrar el sistema funcionando.
 * Se cargan solos con DATOS_EJEMPLO=true si la base está vacía, o a mano con `npm run seed`.
 * Si la base tiene solo los datos de ejemplo de una versión anterior, se cambian por estos.
 */
const { guardarAjuste, leerAjuste } = require('./db');

/* Subí este número cuando cambien los datos de ejemplo (y pasá los de ahora a ANTERIORES) */
const VERSION = 2;

/* Piezas en stock: código, nombre, material, tipo, subcategoría, variante, precio, detalle, días desde que ingresó */
const STOCK = [
  ['ORO-001', 'Anillo Solitario con Cubics', 'oro', 'anillo', 'cubics', null, 640000, 'Talle 14, 2,6 g', 62],
  ['ORO-002', 'Alianza Clásica 4 mm', 'oro', 'anillo', 'alianzas', null, 520000, 'Talle 18, 3,4 g', 120],
  ['ORO-003', 'Cadena Singapur 50 cm', 'oro', 'cadena', 'comun', 'singapur', 1850000, '50 cm, 12,1 g', 35],
  ['ORO-004', 'Cadena Veneciana 45 cm', 'oro', 'cadena', 'comun', 'veneciana', 980000, '45 cm, 6,3 g', 18],
  ['ORO-005', 'Aros Lisos Italianos', 'oro', 'aros', 'lisos', 'italianos', 460000, '18 mm, 2,9 g', 44],
  ['ORO-006', 'Dije Corazón Calado', 'oro', 'dije', 'lisos', null, 310000, '1,9 g', 9],
  ['ORO-007', 'Pulsera Lisa Pesada', 'oro', 'pulsera', 'lisa', 'pesadas', 1420000, '19 cm, 9,2 g', 27],
  ['ORO-008', 'Aros Abridores Bebé', 'oro', 'aros', 'abridores', null, 145000, 'Con traba, 0,9 g', 5],
  ['PLA-001', 'Anillo Corona con Cubics', 'plata', 'anillo', 'cubics', null, 38000, 'Talle 15', 14],
  ['PLA-002', 'Anillo Liso Doble Banda', 'plata', 'anillo', 'lisos', null, 29000, 'Talle 17', 51],
  ['PLA-003', 'Cadena de Bolitas 45 cm', 'plata', 'cadena', 'comun', 'bolitas', 34000, '45 cm', 22],
  ['PLA-004', 'Cadena Cierre Marinero 50 cm', 'plata', 'cadena', 'marinero', null, 48000, '50 cm', 73],
  ['PLA-005', 'Pulsera Esclava Rígida', 'plata', 'pulsera', 'esclavas', null, 56000, '6,5 cm de diámetro', 3],
  ['PLA-006', 'Aros Gota con Piedra', 'plata', 'aros', 'piedras', null, 31000, 'Piedra blanca', 11],
  ['PLA-007', 'Aros Abridores Lisos', 'plata', 'aros', 'abridores', null, 18000, '10 mm', 39],
  ['PLA-008', 'Dije Luna Creciente', 'plata', 'dije', 'lisos', null, 24000, '2,5 cm', 7],
  ['PLA-009', 'Aros Micropavé Botón', 'plata', 'aros', 'cubics', 'micropave', 42000, '8 mm', 6],
  ['PLA-010', 'Aros Hoggis Lisos', 'plata', 'aros', 'lisos', 'hoggis', 26000, '12 mm', 19],
  ['PLA-011', 'Pulsera Tennis con Swarovski', 'plata', 'pulsera', 'sw', null, 64000, '18 cm', 10],
  ['PLA-012', 'Dije para Grabar Corazón', 'plata', 'dije', 'grabar', null, 21000, '2 cm', 25],
  ['PLA-013', 'Anillo con Raíz de Esmeralda', 'plata', 'anillo', 'raiz', null, 45000, 'Talle 16', 28],
  ['PLA-014', 'Aros Cubics con Ónix', 'plata', 'aros', 'cubics', 'onix', 35000, 'Con traba', 16],
  ['ACE-001', 'Anillo Liso Pulido', 'acero', 'anillo', 'lisos', null, 9500, 'Talle 20', 90],
  ['ACE-002', 'Cadena Cola de Ratón 55 cm', 'acero', 'cadena', 'comun', 'cola-de-raton', 19000, '55 cm', 16],
  ['ACE-003', 'Pulsera Lisa Liviana', 'acero', 'pulsera', 'lisa', 'livianas', 15500, 'Ajustable', 30],
  ['ACE-004', 'Aros Gota Piedra Azul', 'acero', 'aros', 'piedras', null, 11000, 'Piedra azul', 12],
  ['ACE-005', 'Dije Cruz Texturada', 'acero', 'dije', 'religiosos', null, 12500, '3 cm', 58],
  ['ACE-006', 'Cadena For 50 cm', 'acero', 'cadena', 'comun', 'for', 21000, '50 cm', 20],
  ['ACE-007', 'Dije Estrella con Cubics', 'acero', 'dije', 'cubics', null, 14500, '1,5 cm', 4],
  ['PYO-001', 'Anillo Bicolor Entrelazado', 'plata-oro', 'anillo', 'lisos', null, 95000, 'Talle 16', 25],
  ['PYO-002', 'Pulsera Doble Tono con Cubics', 'plata-oro', 'pulsera', 'cubics', null, 138000, '19 cm', 41],
  ['PYO-003', 'Aros Combinados con Cubics', 'plata-oro', 'aros', 'cubics', 'comun', 72000, 'Con traba', 8],
  ['PYO-004', 'Dije Infinito Bicolor', 'plata-oro', 'dije', 'lisos', null, 64000, '2 cm', 15],
  ['PYO-005', 'Aros con Swarovski Bicolor', 'plata-oro', 'aros', 'sw', null, 88000, 'Cristal blanco', 13],
];

/* Reservas: cliente, seña y hace cuántos días */
const RESERVAS = {
  'ORO-004': ['Laura G.', 200000, 6],
  'ORO-007': ['Martín R.', 300000, 2],
  'PLA-006': ['Sofía P.', 0, 1],
};

/* Ventas: hace cuántos días, hora, código, nombre, material, tipo, subcategoría, variante, precio y medio de pago */
const VENTAS = [
  [0, '10:15', 'PLA-015', 'Cadena Veneciana 40 cm', 'plata', 'cadena', 'comun', 'veneciana', 36000, 'Efectivo'],
  [0, '11:42', 'ORO-009', 'Aros Micropavé Botón', 'oro', 'aros', 'cubics', 'micropave', 395000, 'Transferencia'],
  [0, '12:30', 'ACE-008', 'Pulsera Lisa Doble', 'acero', 'pulsera', 'lisa', 'livianas', 14000, 'Mercado Pago'],
  [0, '13:05', 'PLA-016', 'Anillo Liso Cinta Ondulada', 'plata', 'anillo', 'lisos', null, 27000, 'Débito'],
  [0, '14:10', 'ORO-010', 'Dije Estrella', 'oro', 'dije', 'lisos', null, 280000, 'Crédito'],
  [0, '14:48', 'PYO-006', 'Cadena Singapur Bicolor', 'plata-oro', 'cadena', 'comun', 'singapur', 118000, 'Transferencia'],
  [0, '15:32', 'PLA-017', 'Pulsera Tennis con Cubics', 'plata', 'pulsera', 'cubics', null, 62000, 'Efectivo'],
  [1, '11:05', 'ORO-011', 'Alianza Clásica 3 mm', 'oro', 'anillo', 'alianzas', null, 480000, 'Transferencia'],
  [1, '12:40', 'PYO-007', 'Pulsera Doble Tono Fina', 'plata-oro', 'pulsera', 'lisa', 'livianas', 126000, 'Crédito'],
  [1, '15:10', 'PLA-018', 'Anillo Liso Doble Banda Fino', 'plata', 'anillo', 'lisos', null, 26000, 'Efectivo'],
  [1, '16:25', 'ACE-009', 'Cadena For 45 cm', 'acero', 'cadena', 'comun', 'for', 18000, 'Débito'],
  [1, '17:50', 'PLA-019', 'Dije Corazón para Grabar', 'plata', 'dije', 'grabar', null, 22000, 'Mercado Pago'],
  [1, '18:30', 'ORO-012', 'Aros Abridores Corazón', 'oro', 'aros', 'abridores', null, 108000, 'Efectivo'],
  [2, '10:50', 'ORO-013', 'Cadena Singapur 45 cm', 'oro', 'cadena', 'comun', 'singapur', 1380000, 'Transferencia'],
  [2, '13:15', 'PLA-020', 'Pulsera Tennis con Swarovski Fina', 'plata', 'pulsera', 'sw', null, 64000, 'Crédito'],
  [2, '16:00', 'ACE-010', 'Dije Ancla', 'acero', 'dije', 'lisos', null, 14000, 'Efectivo'],
  [2, '18:05', 'PLA-021', 'Aros Argolla Lisos', 'plata', 'aros', 'lisos', 'comun', 32000, 'Débito'],
  [3, '11:30', 'ORO-014', 'Dije Medalla Virgen', 'oro', 'dije', 'religiosos', null, 420000, 'Efectivo'],
  [3, '12:55', 'ORO-015', 'Anillo Solitario Fino', 'oro', 'anillo', 'cubics', null, 760000, 'Crédito'],
  [3, '16:40', 'PLA-022', 'Cadena Cierre Marinero 45 cm', 'plata', 'cadena', 'marinero', null, 46000, 'Mercado Pago'],
  [3, '17:20', 'PYO-008', 'Aros Gota Bicolor', 'plata-oro', 'aros', 'piedras', null, 94000, 'Transferencia'],
  [4, '10:35', 'ORO-016', 'Aros Argolla Italianos', 'oro', 'aros', 'lisos', 'italianos', 690000, 'Transferencia'],
  [4, '15:45', 'PLA-023', 'Aros Hoggis Chicos', 'plata', 'aros', 'lisos', 'hoggis', 28000, 'Efectivo'],
  [4, '18:10', 'ACE-011', 'Pulsera Esclava Lisa', 'acero', 'pulsera', 'esclavas', null, 12000, 'Débito'],
  [5, '11:15', 'ORO-017', 'Cadena Veneciana 50 cm', 'oro', 'cadena', 'comun', 'veneciana', 980000, 'Transferencia'],
  [5, '14:20', 'PYO-009', 'Anillo Bicolor Liso', 'plata-oro', 'anillo', 'lisos', null, 112000, 'Crédito'],
  [5, '17:35', 'PLA-024', 'Pulsera con Raíz de Rubí', 'plata', 'pulsera', 'raiz', null, 58000, 'Efectivo'],
  [6, '11:20', 'ORO-018', 'Anillo con Raíz de Zafiro', 'oro', 'anillo', 'raiz', null, 520000, 'Transferencia'],
  [6, '15:05', 'PLA-025', 'Cadena de Bolitas 50 cm', 'plata', 'cadena', 'comun', 'bolitas', 48000, 'Efectivo'],
  [6, '17:45', 'ACE-012', 'Dije Cruz Lisa', 'acero', 'dije', 'religiosos', null, 15000, 'Mercado Pago'],
];

/* Piezas (código y nombre) de los datos de ejemplo de versiones anteriores. Sirven para saber
   si una base tiene solamente esos datos: recién ahí se pueden cambiar por los nuevos. */
const ANTERIORES = {
  1: [
    'ORO-001 Anillo Solitario Circón', 'ORO-002 Alianza Clásica 4 mm', 'ORO-003 Cadena Groumet 50 cm',
    'ORO-004 Cadena Veneciana 45 cm', 'ORO-005 Aros Argolla Mediana', 'ORO-006 Colgante Corazón Calado',
    'ORO-007 Pulsera Eslabón Grueso', 'ORO-008 Aros Pasantes Bebé', 'PLA-001 Anillo Corona Circones',
    'PLA-002 Anillo Doble Banda', 'PLA-003 Cadena Rolo 45 cm', 'PLA-004 Cadena Fígaro 50 cm',
    'PLA-005 Pulsera Dijes Corazón', 'PLA-006 Aros Gota con Piedra', 'PLA-007 Aros Abridores Lisos',
    'PLA-008 Colgante Luna Creciente', 'ACE-001 Anillo Liso Pulido', 'ACE-002 Cadena Cubana 55 cm',
    'ACE-003 Pulsera Malla Milanesa', 'ACE-004 Aros Clip Geométricos', 'ACE-005 Colgante Cruz Texturada',
    'ACE-006 Reloj Clásico Malla Acero', 'ACE-007 Reloj Dama Malla Dorada', 'PYO-001 Anillo Bicolor Entrelazado',
    'PYO-002 Pulsera Doble Tono', 'PYO-003 Aros Combinados', 'PYO-004 Colgante Infinito Bicolor',
    'PLA-012 Cadena Espiga 40 cm', 'ORO-012 Aros Botón Circón', 'ACE-009 Pulsera Cadena Doble',
    'PLA-015 Anillo Cinta Ondulada', 'ORO-010 Colgante Estrella', 'PYO-006 Cadena Bicolor Trenzada',
    'PLA-020 Pulsera Tennis Circones', 'ORO-018 Alianza Clásica 3 mm', 'PYO-008 Pulsera Doble Tono Fina',
    'PLA-017 Anillo Doble Banda Fino', 'ACE-012 Reloj Clásico Cuero', 'PLA-018 Colgante Corazón Plata',
    'ORO-019 Aros Pasantes Corazón', 'ORO-017 Cadena Groumet 45 cm', 'PLA-014 Pulsera Tennis Fina',
    'ACE-011 Colgante Ancla', 'PLA-016 Aros Perla', 'ORO-015 Colgante Medalla Virgen', 'ORO-016 Anillo Solitario Fino',
    'PLA-013 Cadena Fígaro 45 cm', 'PYO-007 Aros Bicolor Gota', 'ORO-014 Aros Argolla Grande',
    'PLA-011 Aros Argolla Chica', 'ACE-010 Reloj Dama Clásico', 'ORO-011 Cadena Veneciana 50 cm',
    'PYO-005 Anillo Bicolor Liso', 'PLA-010 Pulsera Dijes Luna', 'ORO-009 Anillo Sello Grabado',
    'PLA-009 Cadena Rolo 50 cm', 'ACE-008 Reloj Sport Malla Caucho',
  ],
};

/* Carga los datos de ejemplo (la base no tiene que tener piezas) y anota su versión */
async function cargarEjemplo(conn) {
  for (const [codigo, nombre, material, categoria, sub, variante, precio, detalle, dias] of STOCK) {
    const r = RESERVAS[codigo];
    await conn.query(
      `INSERT INTO piezas (codigo, nombre, material, categoria, subcategoria, variante, precio, detalle, estado, ingreso, reserva_cliente, reserva_sena, reserva_fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE() - INTERVAL ? DAY, ?, ?, ${r ? 'CURDATE() - INTERVAL ? DAY' : 'NULL'})`,
      [codigo, nombre, material, categoria, sub, variante, precio, detalle, r ? 'reservado' : 'disponible', dias, ...(r ? [r[0], r[1], r[2]] : [null, null])]);
  }
  for (const [hace, hora, codigo, nombre, material, categoria, sub, variante, precio, medio] of VENTAS) {
    const [p] = await conn.query(
      `INSERT INTO piezas (codigo, nombre, material, categoria, subcategoria, variante, precio, estado, ingreso)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'vendido', CURDATE() - INTERVAL ? DAY)`,
      [codigo, nombre, material, categoria, sub, variante, precio, hace + 30]);
    await conn.query(
      `INSERT INTO ventas (pieza_id, codigo, nombre, material, categoria, subcategoria, variante, precio, medio_pago, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TIMESTAMP(CURDATE() - INTERVAL ? DAY, ?))`,
      [p.insertId, codigo, nombre, material, categoria, sub, variante, precio, medio, hace, hora + ':00']);
  }
  await guardarAjuste(conn, 'datos_ejemplo', VERSION);
}

/* Con DATOS_EJEMPLO=true: si no hay piezas, carga el ejemplo. Si la base tiene solamente
   el ejemplo de una versión anterior, lo cambia por este. Si hay algo propio, no toca nada.
   Las fotos por completar nunca se tocan. Devuelve 'cargados', 'recargados' o null. */
async function prepararEjemplo(conn) {
  const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM piezas');
  const total = Number(n);
  const version = Number(await leerAjuste(conn, 'datos_ejemplo')) || (total ? 1 : 0);
  if (total && version >= VERSION) return null;
  const anteriores = total ? ANTERIORES[version] : [];
  if (!anteriores || total > anteriores.length) return null;
  if (total) {
    const conocidas = new Set(anteriores);
    const [filas] = await conn.query('SELECT codigo, nombre FROM piezas');
    if (!filas.every(f => conocidas.has(`${f.codigo} ${f.nombre}`))) return null;
  }
  await conn.beginTransaction();
  try {
    await conn.query('DELETE FROM ventas');
    await conn.query('DELETE FROM piezas');
    await cargarEjemplo(conn);
    await conn.commit();
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  }
  return total ? 'recargados' : 'cargados';
}

module.exports = { VERSION, cargarEjemplo, prepararEjemplo };
