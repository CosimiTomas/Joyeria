# Stella Maris Joyas — Stock y ventas

Sistema de stock y ventas del local de Av. Libertador San Martín 2038, Caseros.
Cada pieza es única: se carga con foto, se vende (o se reserva con seña) y queda registrada en el ticket del día.

**Para subirlo a internet:** ver [README_RAILWAY.md](README_RAILWAY.md).

## Qué hace

- **Stock:** grilla con foto, filtros por material y por tipo de pieza → subcategoría → variante (con cuántas hay de cada una), búsqueda por nombre, código o categoría, orden por fecha, precio o código. Las reservadas se marcan sobre la foto con el nombre de la clienta.
- **Vender:** medio de pago (efectivo, débito, crédito, transferencia, Mercado Pago) y **Deshacer** el mismo día.
- **Reservas:** nombre de la clienta y seña; al venderla se descuenta la seña.
- **Por completar:** se suben muchas fotos juntas y después se completan de a una (material, tipo de pieza con su subcategoría, precio). Al guardar, la pieza recibe su código (`ORO-020`, `PLA-031`…). Si son todas iguales, el material y la categoría se eligen una vez para todas.
- **Ventas:** tablero de cualquier día (‹ ›, calendario o tocando una barra): facturación, cantidad, ticket promedio y mejor venta comparados con el día anterior, últimos 7 días, medios de pago, por material y por tipo de pieza, movimientos con su comprobante (imprimir y anular, solo el mismo día) e **Imprimir cierre** del día.
- **Ingreso:** la cuenta de la dueña (ve y hace todo) y, si se define `MOSTRADOR_PASSWORD`, la **cuenta del mostrador**: solo ve el stock, vende (con comprobante para imprimir) y reserva. No ve Ventas, Por completar ni el valor del stock, no edita piezas ni sube fotos, y solo puede deshacer una venta suya en los primeros 5 minutos. El servidor lo controla (no alcanza con esconder botones). En Ventas, la dueña ve cuáles se hicieron en el mostrador. Las claves se validan en el servidor (bcrypt) y la sesión usa JWT.

## Estructura

```
server.js      API (Express) + sirve la carpeta public/
db.js          conexión MySQL, creación de tablas, cuentas del local
ejemplo.js     datos de prueba
seed.js        reinicia la base con los datos de prueba
schema.sql     estructura de las tablas (solo referencia: el servidor las crea solo)
public/        la app: index.html, styles.css, app.js, categorias.js, img/
```

## Categorías

Están en `public/categorias.js`, la misma lista para la página y para el servidor:
tipo (Cadenas, Aros, Pulseras, Anillos, Dijes) → subcategoría → a veces un nivel más
(por ejemplo Cadenas → Cierre común → Singapur).

- Para agregar una opción, sumá una fila `[clave, texto del botón, nombre automático]`.
- Para cambiar cómo se ve, cambiá el texto del botón o el nombre. **No cambies la clave** de una opción que ya se usó: es lo que queda guardado en la base.

Las fotos se guardan **en la base** (no en disco), así no se pierden cuando Railway reinicia.

## Correrlo en tu compu (XAMPP)

1. Prendé **MySQL** en XAMPP.
2. En la carpeta del proyecto:
   ```
   npm install
   cp .env.example .env      (en Windows: copy .env.example .env)
   ```
3. Editá `.env` (usuario/clave de MySQL, `LOGIN_PASSWORD`, `JWT_SECRET`).
4. `npm start` → abrí http://localhost:3000

La base y las tablas se crean solas, y una base de una versión anterior se pone al día sola (sin perder nada).
Con `DATOS_EJEMPLO=true` carga piezas de prueba si está vacía; si tiene solo los datos de prueba de una versión anterior, los cambia por los nuevos (si cargaste algo propio, no toca nada).

Para borrar todo y volver a los datos de prueba: `npm run seed -- --si`
(no toca la cuenta; sin `--si` no hace nada).

## API

Todas menos `/api/health`, `/api/login` y `/api/fotos/:clave` piden `Authorization: Bearer <token>`. Las marcadas con **(dueña)** responden 403 a la cuenta del mostrador.

| Método | Ruta | Para qué |
|---|---|---|
| GET | `/api/health` | chequeo del servidor |
| POST | `/api/login` | `{usuario, password, recordar}` → token y `rol` (`duena` o `mostrador`); 30 días con recordar, si no 12 h |
| GET | `/api/estado` | stock, por completar, ventas de hoy, semana (`semana`: totales; `dias`: fecha, total y cantidad). Al mostrador: solo el stock |
| GET | `/api/ventas/dia/:fecha` | **(dueña)** ventas de un día (`AAAA-MM-DD`) y los 7 días que terminan en él; cada venta dice `vendidoPor` |
| POST | `/api/piezas/:codigo/vender` | `{medio}` |
| POST | `/api/ventas/:id/deshacer` | anula una venta del día (el mostrador: solo una venta suya, en los primeros 5 minutos) |
| POST | `/api/piezas/:codigo/reserva` | `{cliente, sena}` |
| DELETE | `/api/piezas/:codigo/reserva` | quita la reserva |
| PATCH | `/api/piezas/:codigo` | **(dueña)** `{nombre, precio, categoria, subcategoria, variante, detalle}` (categoría completa) |
| PUT | `/api/piezas/:codigo/foto` | **(dueña)** cambia la foto (imagen en el cuerpo) |
| POST | `/api/pendientes` | **(dueña)** sube una foto por completar (`?material=&categoria=&subcategoria=&variante=`, opcionales) |
| PATCH | `/api/pendientes/:id` | **(dueña)** guarda datos; con material, tipo de pieza completo y precio pasa al stock |
| DELETE | `/api/pendientes/:id` | **(dueña)** la borra (se puede restaurar 2 días) |
| POST | `/api/pendientes/:id/restaurar` | **(dueña)** deshace el borrado |
| GET | `/api/fotos/:clave` | la imagen |

## Seguridad

- Claves con bcrypt; las sesiones de cada cuenta se cierran solas si se cambia su clave (`LOGIN_PASSWORD` o `MOSTRADOR_PASSWORD`).
- La cuenta del mostrador recibe 403 en todo lo que no es vender o reservar.
- Máximo 8 intentos fallidos de ingreso cada 15 minutos por IP.
- Encabezados de seguridad (CSP, anti-iframe, HSTS en producción).
- Solo se sirve `public/`: el código del servidor y el `.env` no son accesibles desde el navegador.
- Las fotos se verifican por contenido (JPG, PNG, WebP), no por extensión.
