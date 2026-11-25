/* =====================================================================
   Stella Maris Joyas — desplegables y calendario con el diseño de la página
   ---------------------------------------------------------------------
   Las listas y el calendario del navegador no se pueden pintar con los
   colores del local, así que se reemplazan por unos propios:

   · Cada <select> sigue en la página (la lógica lo lee y escucha su
     "change"), pero queda oculto: se usa a través de un botón con el
     mismo estilo que los campos y una lista que se abre debajo.
   · El calendario elige un día sin pasar de hoy (Ventas).

   Accesibles con teclado y lector de pantalla (patrón "combobox" de
   ARIA): el foco queda en el botón y la lista marca la opción activa.
   ===================================================================== */
(function () {
  'use strict';

  /* Capa donde se abren las listas y el calendario: encima de todo (también de las hojas) */
  const capa = document.createElement('div');
  capa.id = 'capa';
  capa.className = 'capa';
  document.body.appendChild(capa);

  const CHEV = '<svg class="sel-chev" width="12" height="8" viewBox="0 0 12 8" aria-hidden="true"><path d="M1.5 1.75 6 6.25l4.5-4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const TILDE = '<svg class="op-tilde" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const FLECHA = d => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d < 0 ? 'M14.5 6 8.5 12l6 6' : 'm9.5 6 6 6-6 6'}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sinTildes = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let cuenta = 0;
  let abierto = null;   // lo que está abierto ahora (una lista o el calendario): {cerrar, contiene, ubicar}

  /* Ubica la ventanita debajo de lo que la abrió; si no entra, arriba. Nunca se sale de la pantalla. */
  function ubicar(pop, ancla, { centrar = false, ancho = true } = {}) {
    const r = ancla.getBoundingClientRect(), m = 8, sep = 6;
    const vw = document.documentElement.clientWidth, vh = innerHeight;
    if (ancho) pop.style.minWidth = r.width + 'px';
    pop.style.maxHeight = '';
    const w = pop.offsetWidth, h = pop.scrollHeight;
    let left = centrar ? r.left + r.width / 2 - w / 2 : r.left;
    left = Math.max(m, Math.min(left, vw - w - m));
    const abajo = vh - r.bottom - sep - m, arriba = r.top - sep - m;
    const vaAbajo = h <= abajo || abajo >= arriba;
    const alto = Math.min(h, vaAbajo ? abajo : arriba);
    pop.style.left = left + 'px';
    pop.style.top = (vaAbajo ? r.bottom + sep : r.top - sep - alto) + 'px';
    if (h > alto) pop.style.maxHeight = Math.max(alto, 120) + 'px';
    pop.dataset.lado = vaAbajo ? 'abajo' : 'arriba';
  }
  function cerrarAbierto() { if (abierto) abierto.cerrar(false); }
  /* Tocar afuera cierra; si lo que abrió se va de la pantalla (o de la página), también */
  document.addEventListener('pointerdown', e => { if (abierto && !abierto.contiene(e.target)) abierto.cerrar(false); }, true);
  addEventListener('resize', () => abierto && abierto.ubicar());
  addEventListener('scroll', e => { if (abierto && !abierto.contiene(e.target)) abierto.ubicar(); }, true);

  /* ───────────── Desplegable: un <select> con el estilo de la página ───────────── */
  const PROTO = HTMLSelectElement.prototype;
  const VALOR = Object.getOwnPropertyDescriptor(PROTO, 'value');
  const INDICE = Object.getOwnPropertyDescriptor(PROTO, 'selectedIndex');

  function mejorar(sel) {
    if (sel.dataset.desplegable || sel.multiple || sel.size > 1) return;
    sel.dataset.desplegable = '1';
    const id = 'des' + (++cuenta);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = id;
    btn.className = 'sel ' + (sel.classList.contains('input') ? [...sel.classList].join(' ') : 'sel-plano');
    btn.dataset.para = sel.id || '';
    btn.setAttribute('role', 'combobox');
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id + '-lista');
    btn.innerHTML = '<span class="sel-v"></span>' + CHEV;
    sel.after(btn);
    /* El select queda en la página (la lógica lo usa) pero oculto: se ve y se usa el botón */
    sel.classList.add('sel-nativo');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');

    /* Nombre: el de su etiqueta (si la etiqueta envuelve al select, el texto que no es el select) */
    const etiqueta = sel.id && document.querySelector(`label[for="${CSS.escape(sel.id)}"]`) || sel.closest('label');
    if (etiqueta) {
      const fuente = etiqueta.contains(sel) ? [...etiqueta.children].find(el => el !== sel && el !== btn && el.textContent.trim()) : etiqueta;
      if (fuente) {
        if (!fuente.id) fuente.id = id + '-etq';
        btn.setAttribute('aria-labelledby', fuente.id);
      }
    }

    let lista = null, activa = -1, busqueda = '', reloj = 0;
    const sync = () => {
      const o = sel.options[INDICE.get.call(sel)];
      btn.querySelector('.sel-v').textContent = o ? o.text : '';
      btn.classList.toggle('vacio', !o || o.value === '');
      btn.hidden = sel.hidden;
      btn.disabled = sel.disabled;
      for (const a of ['aria-invalid', 'aria-describedby', 'aria-label', 'aria-required']) {
        if (sel.hasAttribute(a)) btn.setAttribute(a, sel.getAttribute(a)); else btn.removeAttribute(a);
      }
      if (lista) pintar();
    };
    /* Si el código cambia el valor (por ejemplo "Quitar filtros"), el botón también cambia */
    Object.defineProperty(sel, 'value', { configurable: true, get() { return VALOR.get.call(this); }, set(v) { VALOR.set.call(this, v); sync(); } });
    Object.defineProperty(sel, 'selectedIndex', { configurable: true, get() { return INDICE.get.call(this); }, set(v) { INDICE.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'disabled', 'selected', 'aria-invalid', 'aria-describedby', 'aria-label', 'aria-required'] });
    sel.addEventListener('change', sync);
    /* Una etiqueta o el código que enfoca el select enfoca el botón */
    sel.addEventListener('focus', () => btn.focus());

    const usable = i => sel.options[i] && !sel.options[i].disabled;
    function pintar() {
      const actual = INDICE.get.call(sel);
      lista.innerHTML = [...sel.options].map((o, i) =>
        `<div role="option" id="${id}-o${i}" class="op${o.value === '' ? ' op-vacia' : ''}${i === activa ? ' activa' : ''}" data-i="${i}" aria-selected="${i === actual}"${o.disabled ? ' aria-disabled="true"' : ''}><span>${esc(o.text)}</span>${TILDE}</div>`).join('');
      if (activa >= 0) btn.setAttribute('aria-activedescendant', `${id}-o${activa}`);
    }
    function marcar(i) {
      if (!lista || !usable(i)) return;
      activa = i;
      lista.querySelectorAll('.op').forEach(o => o.classList.toggle('activa', +o.dataset.i === i));
      btn.setAttribute('aria-activedescendant', `${id}-o${i}`);
      lista.querySelector(`[data-i="${i}"]`)?.scrollIntoView({ block: 'nearest' });
    }
    function abrir(i) {
      if (btn.disabled) return;
      cerrarAbierto();
      lista = document.createElement('div');
      lista.className = 'lista';
      lista.id = id + '-lista';
      lista.setAttribute('role', 'listbox');
      if (btn.hasAttribute('aria-labelledby')) lista.setAttribute('aria-labelledby', btn.getAttribute('aria-labelledby'));
      else if (btn.hasAttribute('aria-label')) lista.setAttribute('aria-label', btn.getAttribute('aria-label'));
      const actual = INDICE.get.call(sel);
      activa = usable(i) ? i : usable(actual) ? actual : [...sel.options].findIndex(o => !o.disabled);
      pintar();
      capa.appendChild(lista);
      ubicar(lista, btn);
      btn.setAttribute('aria-expanded', 'true');
      marcar(activa);
      /* El foco no sale del botón: la lista se usa con el mouse o con el teclado desde el botón */
      lista.addEventListener('pointerdown', e => e.preventDefault());
      lista.addEventListener('pointermove', e => { const o = e.target.closest('.op'); if (o && +o.dataset.i !== activa) marcar(+o.dataset.i); });
      lista.addEventListener('click', e => { const o = e.target.closest('.op'); if (o) elegir(+o.dataset.i); });
      abierto = { cerrar, contiene: t => btn.contains(t) || (lista && lista.contains(t)), ubicar: () => { if (!btn.isConnected || btn.hidden) cerrar(false); else ubicar(lista, btn); } };
    }
    function cerrar(foco) {
      if (!lista) return;
      lista.remove();
      lista = null;
      activa = -1;
      btn.setAttribute('aria-expanded', 'false');
      btn.removeAttribute('aria-activedescendant');
      if (abierto && abierto.cerrar === cerrar) abierto = null;
      if (foco) btn.focus({ preventScroll: true });
    }
    function elegir(i) {
      if (!usable(i)) return;
      const cambia = i !== INDICE.get.call(sel);
      cerrar(true);
      if (cambia) {
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    function mover(paso) {
      const n = sel.options.length;
      let i = activa;
      for (let k = 0; k < n; k++) {
        i = Math.max(0, Math.min(n - 1, i + paso));
        if (usable(i)) break;
        if (i === 0 || i === n - 1) { i = activa; break; }
      }
      marcar(i);
    }
    function extremo(fin) {
      const idx = [...sel.options].map((o, i) => i).filter(usable);
      if (idx.length) marcar(fin ? idx[idx.length - 1] : idx[0]);
    }
    /* Escribir una letra (o el comienzo de una palabra) salta a la opción que empieza así */
    function buscar(letra) {
      clearTimeout(reloj);
      busqueda += sinTildes(letra);
      reloj = setTimeout(() => { busqueda = ''; }, 700);
      const n = sel.options.length, desde = activa >= 0 ? activa : INDICE.get.call(sel);
      const misma = busqueda.split('').every(c => c === busqueda[0]);
      const texto = misma ? busqueda[0] : busqueda;
      for (let k = 1; k <= n; k++) {
        const i = ((misma ? desde + k : desde + k - 1) % n + n) % n;
        if (usable(i) && sinTildes(sel.options[i].text.trim()).startsWith(texto)) { marcar(i); return; }
      }
    }

    btn.addEventListener('click', () => { if (lista) cerrar(false); else abrir(); });
    btn.addEventListener('keydown', e => {
      const k = e.key, letra = k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
      if (!lista) {
        if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') { e.preventDefault(); abrir(); }
        else if (k === 'Home' || k === 'End') { e.preventDefault(); abrir(); extremo(k === 'End'); }
        else if (letra) { e.preventDefault(); abrir(); buscar(k); }
        return;
      }
      switch (k) {
        case 'ArrowDown': e.preventDefault(); mover(1); break;
        case 'ArrowUp': e.preventDefault(); if (e.altKey) elegir(activa); else mover(-1); break;
        case 'Home': e.preventDefault(); extremo(false); break;
        case 'End': e.preventDefault(); extremo(true); break;
        case 'PageDown': e.preventDefault(); mover(10); break;
        case 'PageUp': e.preventDefault(); mover(-10); break;
        case 'Enter': e.preventDefault(); elegir(activa); break;
        case ' ': e.preventDefault(); if (busqueda) buscar(' '); else elegir(activa); break;
        case 'Escape': e.preventDefault(); e.stopPropagation(); cerrar(true); break;
        case 'Tab': elegir(activa); break;
        default: if (letra) { e.preventDefault(); buscar(k); }
      }
    });
    btn.addEventListener('blur', () => setTimeout(() => { if (lista && document.activeElement !== btn) cerrar(false); }, 0));
    sync();
  }

  /* Todos los select de la página, también los que aparecen después (hojas, preguntas nuevas) */
  const revisar = nodo => {
    if (nodo.nodeType !== 1) return;
    if (nodo.matches('select')) mejorar(nodo);
    nodo.querySelectorAll('select').forEach(mejorar);
  };
  revisar(document.body);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(revisar))).observe(document.body, { childList: true, subtree: true });

  /* ───────────── Calendario: elegir un día sin pasar de hoy ───────────── */
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const SEMANA = [['lu', 'lunes'], ['ma', 'martes'], ['mi', 'miércoles'], ['ju', 'jueves'], ['vi', 'viernes'], ['sá', 'sábado'], ['do', 'domingo']];
  const aIso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const deIso = s => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
  const sumar = (s, dias) => { const d = deIso(s); d.setDate(d.getDate() + dias); return aIso(d); };
  const sumarMes = (s, meses) => {
    const d = deIso(s), dia = d.getDate();
    d.setDate(1); d.setMonth(d.getMonth() + meses);
    d.setDate(Math.min(dia, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return aIso(d);
  };
  const lunes = s => { const d = deIso(s); return sumar(s, -((d.getDay() + 6) % 7)); };

  /* boton: lo que lo abre · valor(): el día elegido · max(): el último día que se puede elegir · alElegir(dia) */
  function calendario({ boton, valor, max, alElegir }) {
    boton.setAttribute('aria-haspopup', 'dialog');
    boton.setAttribute('aria-expanded', 'false');
    let pop = null, foco = '';
    const tope = () => max() || '9999-12-31';

    function pintar() {
      const elegido = valor(), hoy = max(), limite = tope();
      const d = deIso(foco), primero = aIso(new Date(d.getFullYear(), d.getMonth(), 1));
      const ultimo = aIso(new Date(d.getFullYear(), d.getMonth() + 1, 0));
      const titulo = `${MESES[d.getMonth()]} de ${d.getFullYear()}`;
      let filas = '', dia = lunes(primero);
      while (dia <= ultimo) {
        filas += '<tr>';
        for (let k = 0; k < 7; k++, dia = sumar(dia, 1)) {
          if (dia < primero || dia > ultimo) { filas += '<td></td>'; continue; }
          const x = deIso(dia), clases = ['cal-dia'];
          if (dia === hoy) clases.push('hoy');
          if (dia === elegido) clases.push('elegido');
          const nombre = `${SEMANA[(x.getDay() + 6) % 7][1]} ${x.getDate()} de ${MESES[x.getMonth()]}${dia === hoy ? ', hoy' : ''}${dia === elegido ? ', elegido' : ''}`;
          filas += `<td><button type="button" class="${clases.join(' ')}" data-f="${dia}" tabindex="${dia === foco ? 0 : -1}" aria-label="${nombre}"${dia > limite ? ' disabled' : ''}>${x.getDate()}</button></td>`;
        }
        filas += '</tr>';
      }
      pop.innerHTML = `<div class="cal-top">
          <button type="button" class="cal-mes" data-mover="-1" aria-label="Mes anterior">${FLECHA(-1)}</button>
          <p class="cal-titulo" id="calTitulo" aria-live="polite">${titulo}</p>
          <button type="button" class="cal-mes" data-mover="1" aria-label="Mes siguiente"${sumarMes(primero, 1) > limite ? ' disabled' : ''}>${FLECHA(1)}</button>
        </div>
        <table class="cal-grilla" role="grid" aria-labelledby="calTitulo">
          <thead><tr>${SEMANA.map(([c, l]) => `<th scope="col" abbr="${l}">${c}</th>`).join('')}</tr></thead>
          <tbody>${filas}</tbody>
        </table>
        <div class="cal-pie"><button type="button" class="btn btn-quiet btn-sm" data-hoy>Hoy</button></div>`;
    }
    function enfocar(dia) {
      if (dia > tope()) dia = tope();
      const mismoMes = dia.slice(0, 7) === foco.slice(0, 7);
      foco = dia;
      if (!mismoMes) pintar();
      else pop.querySelectorAll('.cal-dia').forEach(b => { b.tabIndex = b.dataset.f === dia ? 0 : -1; });
      pop.querySelector(`.cal-dia[data-f="${dia}"]`)?.focus();
    }
    function abrir() {
      cerrarAbierto();
      foco = valor() || max();
      pop = document.createElement('div');
      pop.className = 'cal';
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-modal', 'false');
      pop.setAttribute('aria-label', 'Elegir el día');
      pintar();
      capa.appendChild(pop);
      ubicar(pop, boton, { centrar: true, ancho: false });
      boton.setAttribute('aria-expanded', 'true');
      pop.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled) return;
        if (b.dataset.mover) { foco = sumarMes(foco, +b.dataset.mover); if (foco > tope()) foco = tope(); pintar(); pop.querySelector(`[data-mover="${b.dataset.mover}"]:not([disabled])`)?.focus(); return; }
        if (b.hasAttribute('data-hoy')) { cerrar(true); alElegir(max()); return; }
        if (b.dataset.f) { cerrar(true); if (b.dataset.f !== valor()) alElegir(b.dataset.f); }
      });
      pop.addEventListener('keydown', teclas);
      abierto = { cerrar, contiene: t => boton.contains(t) || (pop && pop.contains(t)), ubicar: () => ubicar(pop, boton, { centrar: true, ancho: false }) };
      pop.querySelector(`.cal-dia[data-f="${foco}"]`)?.focus();
    }
    function cerrar(devolverFoco) {
      if (!pop) return;
      pop.remove();
      pop = null;
      boton.setAttribute('aria-expanded', 'false');
      if (abierto && abierto.cerrar === cerrar) abierto = null;
      if (devolverFoco) boton.focus({ preventScroll: true });
    }
    function teclas(e) {
      const k = e.key;
      if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(true); return; }
      if (k === 'Tab') {   /* el foco da vueltas adentro del calendario */
        const fs = [...pop.querySelectorAll('button:not([disabled])')].filter(b => !b.classList.contains('cal-dia') || b.tabIndex === 0);
        const i = fs.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); fs[fs.length - 1].focus(); }
        else if (!e.shiftKey && i === fs.length - 1) { e.preventDefault(); fs[0].focus(); }
        return;
      }
      if (!e.target.classList.contains('cal-dia')) return;
      const mov = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[k];
      if (mov) { e.preventDefault(); enfocar(sumar(foco, mov)); return; }
      if (k === 'Home') { e.preventDefault(); enfocar(lunes(foco)); return; }
      if (k === 'End') { e.preventDefault(); enfocar(sumar(lunes(foco), 6)); return; }
      if (k === 'PageUp' || k === 'PageDown') { e.preventDefault(); enfocar(sumarMes(foco, (k === 'PageUp' ? -1 : 1) * (e.shiftKey ? 12 : 1))); }
    }
    boton.addEventListener('click', () => { if (pop) cerrar(false); else abrir(); });
    boton.addEventListener('keydown', e => { if (!pop && e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); abrir(); } });
    return { cerrar: () => cerrar(false) };
  }

  window.Desplegables = Object.freeze({ calendario, cerrar: cerrarAbierto });
})();
