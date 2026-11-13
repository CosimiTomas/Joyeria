/* ============================================================
   Categorías del local: tipo → subcategoría → (a veces) un nivel más.
   Las usa la página (para mostrar las opciones) y también el servidor
   (para revisar lo que llega), así la lista está en un solo lugar.

   Cada opción se escribe así:
     [clave, texto del botón, nombre automático de la pieza]
   y si tiene otro nivel abajo:
     [clave, texto del botón, nombre automático, pregunta del nivel siguiente, [opciones…]]

   La clave es lo que se guarda en la base: en una opción que ya se usó no la
   cambies (cambiá solo el texto del botón o el nombre). Para agregar una opción,
   sumá una fila con una clave nueva.
   ============================================================ */
(function (raiz) {
'use strict';

const TIPOS = {
  cadena: {
    plural: 'Cadenas', una: 'Cadena', genero: 'f', pregunta: '¿Qué cierre tiene?',
    subs: [
      ['marinero', 'Cierre marinero', 'Cadena con cierre marinero'],
      ['comun',    'Cierre común',    'Cadena con cierre común', '¿Qué cadena es?', [
        ['for',           'For',           'Cadena for'],
        ['singapur',      'Singapur',      'Cadena Singapur'],
        ['cola-de-raton', 'Cola de ratón', 'Cadena cola de ratón'],
        ['bolitas',       'Bolitas',       'Cadena de bolitas'],
        ['veneciana',     'Veneciana',     'Cadena veneciana'],
      ]],
    ],
  },
  aros: {
    plural: 'Aros', una: 'Aros', genero: 'm', pregunta: '¿Qué aros son?',
    subs: [
      ['abridores', 'Abridores',     'Aros abridores'],
      ['cubics',    'Con cubics',    'Aros con cubics', '¿Qué tipo de cubics?', [
        ['onix',      'Con ónix',  'Aros con cubics y ónix'],
        ['micropave', 'Micropavé', 'Aros micropavé'],
        ['comun',     'Común',     'Aros con cubics'],
      ]],
      ['lisos',     'Lisos',         'Aros lisos', '¿Qué aros lisos?', [
        ['comun',     'Común',     'Aros lisos'],
        ['italianos', 'Italianos', 'Aros italianos'],
        ['hoggis',    'Hoggis',    'Aros hoggis'],
      ]],
      ['piedras',   'Con piedras',   'Aros con piedras'],
      ['sw',        'Con Swarovski', 'Aros con Swarovski'],
      ['raiz',      'Con raíz',      'Aros con raíz'],
    ],
  },
  pulsera: {
    plural: 'Pulseras', una: 'Pulsera', genero: 'f', pregunta: '¿Qué pulsera es?',
    subs: [
      ['lisa',     'Lisas',         'Pulsera lisa', '¿Liviana o pesada?', [
        ['livianas', 'Livianas',                  'Pulsera lisa liviana'],
        ['pesadas',  'Pesadas (cierre marinero)', 'Pulsera lisa pesada'],
      ]],
      ['esclavas', 'Esclavas',      'Pulsera esclava'],
      ['sw',       'Con Swarovski', 'Pulsera con Swarovski'],
      ['piedras',  'Con piedras',   'Pulsera con piedras'],
      ['cubics',   'Con cubics',    'Pulsera con cubics'],
      ['raiz',     'Con raíz',      'Pulsera con raíz'],
    ],
  },
  anillo: {
    plural: 'Anillos', una: 'Anillo', genero: 'm', pregunta: '¿Qué anillo es?',
    subs: [
      ['lisos',    'Lisos',       'Anillo liso'],
      ['cubics',   'Con cubics',  'Anillo con cubics'],
      ['piedras',  'Con piedras', 'Anillo con piedras'],
      ['alianzas', 'Alianzas',    'Alianza'],
      ['raiz',     'Con raíz',    'Anillo con raíz'],
    ],
  },
  dije: {
    plural: 'Dijes', una: 'Dije', genero: 'm', pregunta: '¿Qué dije es?',
    subs: [
      ['grabar',     'Para grabar',   'Dije para grabar'],
      ['lisos',      'Lisos',         'Dije liso'],
      ['cubics',     'Con cubics',    'Dije con cubics'],
      ['sw',         'Con Swarovski', 'Dije con Swarovski'],
      ['piedras',    'Con piedras',   'Dije con piedras'],
      ['religiosos', 'Religiosos',    'Dije religioso'],
    ],
  },
};

/* Las filas se pasan a objetos con nombre: {clave, boton, nombre, pregunta?, variantes?} */
const opcion = ([clave, boton, nombre, pregunta, hijas]) => {
  const o = { clave, boton, nombre };
  if (hijas) {
    o.pregunta = pregunta;
    o.variantes = hijas.map(([clave, boton, nombre]) => Object.freeze({ clave, boton, nombre }));
    Object.freeze(o.variantes);
  }
  return Object.freeze(o);
};
for (const [clave, t] of Object.entries(TIPOS)) {
  t.clave = clave;
  t.todos = (t.genero === 'f' ? 'Todas las ' : 'Todos los ') + t.plural.toLowerCase();
  t.subs = Object.freeze(t.subs.map(opcion));
  Object.freeze(t);
}
Object.freeze(TIPOS);

const vacio = v => v == null || v === '';
const mayus = s => s.charAt(0).toUpperCase() + s.slice(1);
const buscar = (lista, clave) => lista.find(x => x.clave === clave) || null;

/* Revisa una elección {categoria, subcategoria, variante}:
   valida   → cada nivel existe dentro del de arriba (vacío también vale)
   completa → además tiene todos los niveles que corresponden */
function leer(c) {
  c = c || {};
  const k = vacio(c.categoria) ? null : String(c.categoria);
  const s = vacio(c.subcategoria) ? null : String(c.subcategoria);
  const v = vacio(c.variante) ? null : String(c.variante);
  const tipo = k && Object.prototype.hasOwnProperty.call(TIPOS, k) ? TIPOS[k] : null;
  const sub = tipo && s ? buscar(tipo.subs, s) : null;
  const variante = sub && sub.variantes && v ? buscar(sub.variantes, v) : null;
  const valida = (!k || !!tipo) && (!s || !!sub) && (!v || !!variante);
  const completa = valida && !!tipo && (!tipo.subs.length || !!sub) && (!sub || !sub.variantes || !!variante);
  return { tipo, sub, variante, valida, completa };
}

/* Nombre automático sin el material: "Cadena Singapur", "Alianza", "Aros micropavé" */
function nombre(c) {
  const r = leer(c);
  if (r.variante) return r.variante.nombre;
  if (r.sub) return r.sub.nombre;
  if (r.tipo) return r.tipo.una;
  return c && !vacio(c.categoria) ? mayus(String(c.categoria)) : '';
}

/* Para mostrar: "Cadena · Cierre común · Singapur" */
function texto(c, sep) {
  const r = leer(c);
  if (!r.tipo) return c && !vacio(c.categoria) ? mayus(String(c.categoria)) : '';
  return [r.tipo.una, r.sub && r.sub.boton, r.variante && r.variante.boton].filter(Boolean).join(sep || ' · ');
}

const CATEGORIAS = Object.freeze({ TIPOS, leer, nombre, texto });
if (typeof module === 'object' && module.exports) module.exports = CATEGORIAS;
else raiz.CATEGORIAS = CATEGORIAS;
})(typeof window !== 'undefined' ? window : globalThis);
