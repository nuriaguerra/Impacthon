// ═══════════════════════════════════════════════
//  TouchGrass — maps.js
//  Google Maps: Street View + Directions link
//  en el modal de detalle del reto exterior.
//
//  REQUIERE:
//  - Una Google Maps API key con los servicios:
//    · Maps JavaScript API (para Street View)
//    · (Opcional) Places API (para buscar por nombre)
// ═══════════════════════════════════════════════

/* ─────────────────────────────────────────────
   ESTADO INTERNO
───────────────────────────────────────────── */
let _mapsReady     = false;
let _streetView    = null;   // instancia de StreetViewPanorama
let _geocoder      = null;

/* ─────────────────────────────────────────────
   CALLBACK: Google Maps llama a esta función
   cuando termina de cargar el SDK.
   El nombre debe coincidir con &callback= en la URL.
───────────────────────────────────────────── */
function MAPS_onLoad() {
  _mapsReady = true;
  _geocoder  = new google.maps.Geocoder();
  console.log('✅ Google Maps SDK listo');
}
window.MAPS_onLoad = MAPS_onLoad;

/* ─────────────────────────────────────────────
   MOSTRAR STREET VIEW en el modal de detalle
   query: string con el nombre/dirección del lugar ("Catedral de Santiago de Compostela")
   Ejemplo reto: "Busca la Catedral y sube una foto"
───────────────────────────────────────────── */
function MAPS_showStreetView(query) {
  const container = document.getElementById('streetview-container');
  if (!container) return;

  if (!_mapsReady) {
    // Maps aún no cargó: mostrar placeholder con texto informativo
    _renderPlaceholder(container, query, 'Cargando mapa...');
    return;
  }

  // Geocodificar el nombre del lugar → coordenadas
  _geocoder.geocode({ address: query }, (results, status) => {
    if (status !== 'OK' || !results.length) {
      console.warn('Geocode falló:', status, query);
      _renderPlaceholder(container, query, 'No se encontró el lugar');
      return;
    }

    const location = results[0].geometry.location;
    const lat = location.lat();
    const lon = location.lng();

    // Guardar checkpoint en CTX para Persona 2
    if (window.CTX) {
      window.CTX.checkpoint = { name: query, lat, lon };
      if (typeof window.MoveUp?.onUpdate === 'function') {
        window.MoveUp.onUpdate({ ...window.CTX });
      }
    }

    // Comprobar si hay Street View disponible en ese punto
    const svService = new google.maps.StreetViewService();
    svService.getPanorama({ location: { lat, lng: lon }, radius: 100 }, (data, svStatus) => {
      if (svStatus === 'OK') {
        _renderStreetViewPanorama(container, lat, lon, query);
      } else {
        // No hay Street View: mostrar mapa estático en su lugar
        _renderStaticMap(container, lat, lon, query);
      }
    });
  });
}

/* ─────────────────────────────────────────────
   RENDERIZAR PANORAMA DE STREET VIEW
───────────────────────────────────────────── */
function _renderStreetViewPanorama(container, lat, lon, label) {
  // Limpiar contenido anterior
  container.innerHTML = '';
  container.style.height = '220px';
  container.style.borderRadius = 'var(--radius-lg)';
  container.style.overflow = 'hidden';
  container.style.border = '1px solid var(--border)';

  const panoDiv = document.createElement('div');
  panoDiv.style.width  = '100%';
  panoDiv.style.height = '100%';
  container.appendChild(panoDiv);

  _streetView = new google.maps.StreetViewPanorama(panoDiv, {
    position:          { lat, lng: lon },
    pov:               { heading: 0, pitch: 0 },
    zoom:              1,
    addressControl:    false,
    fullscreenControl: true,
    motionTrackingControl: false,
    showRoadLabels:    true,
  });

  // Añadir link "Abrir en Maps"
  _appendMapsLink(container, lat, lon, label);
}

/* ─────────────────────────────────────────────
   FALLBACK: mapa estático (si no hay Street View)
   Usa la Static Maps API — misma key.
───────────────────────────────────────────── */
function _renderStaticMap(container, lat, lon, label) {
  // Obtener la key del script tag de Google Maps
  const apiKey = _getApiKey();

  container.innerHTML = '';
  container.style.borderRadius = 'var(--radius-lg)';
  container.style.overflow = 'hidden';
  container.style.border = '1px solid var(--border)';

  if (apiKey) {
    const staticUrl = `https://maps.googleapis.com/maps/api/staticmap` +
      `?center=${lat},${lon}&zoom=17&size=600x220&maptype=roadmap` +
      `&markers=color:red%7C${lat},${lon}&key=${apiKey}`;

    container.innerHTML = `
      <div style="position:relative">
        <img src="${staticUrl}" alt="${label}"
          style="width:100%;height:220px;object-fit:cover;display:block" />
        <div style="
          position:absolute;bottom:0;left:0;right:0;
          background:linear-gradient(transparent,rgba(0,0,0,0.7));
          padding:12px 16px;
          color:#fff;font-size:13px;font-weight:600">
          📍 ${label}
        </div>
      </div>
    `;
  } else {
    // Sin key: usar iframe de Google Maps Embed (no requiere key para uso básico)
    const q = encodeURIComponent(label);
    container.innerHTML = `
      <iframe
        width="100%" height="220"
        style="border:0;display:block"
        loading="lazy"
        src="https://maps.google.com/maps?q=${q}&output=embed">
      </iframe>
    `;
  }

  _appendMapsLink(container, lat, lon, label);
}

/* ─────────────────────────────────────────────
   PLACEHOLDER mientras carga o si falla
───────────────────────────────────────────── */
function _renderPlaceholder(container, query, message) {
  container.innerHTML = `
    <div class="streetview-inner">
      <span class="sv-icon">📍</span>
      <p>${message}</p>
      <p class="sv-sub">${query}</p>
      ${query ? `<a href="https://maps.google.com/?q=${encodeURIComponent(query)}"
          target="_blank" rel="noopener"
          style="
            display:inline-block;margin-top:8px;
            background:var(--accent);color:#0d0d0f;
            padding:6px 14px;border-radius:8px;
            font-size:12px;font-weight:700;text-decoration:none">
          Ver en Google Maps ↗
        </a>` : ''}
    </div>
  `;
}

/* ─────────────────────────────────────────────
   LINK "Cómo llegar" debajo del mapa
───────────────────────────────────────────── */
function _appendMapsLink(container, lat, lon, label) {
  const link = document.createElement('a');
  link.href   = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
  link.target = '_blank';
  link.rel    = 'noopener noreferrer';
  link.className = 'maps-directions-btn';
  link.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 12h18M12 5l7 7-7 7"/>
    </svg>
    Cómo llegar a pie · ${label}
  `;
  container.appendChild(link);
}

/* ─────────────────────────────────────────────
   OBTENER API KEY desde el script tag de Maps
   (para no duplicarla en el código)
───────────────────────────────────────────── */
function _getApiKey() {
  const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  for (const s of scripts) {
    const match = s.src.match(/[?&]key=([^&]+)/);
    if (match) return match[1];
  }
  return null;
}

/* ─────────────────────────────────────────────
   FUNCIÓN PRINCIPAL
   Llamar desde app.js cuando se abre el modal
   de detalle de un reto exterior.

   INTEGRACIÓN EN APP.JS:
   Busca el listener de btn-challenge-details:
     document.getElementById('btn-challenge-details')
       ?.addEventListener('click', (e) => {
         e.stopPropagation();
         openModal('modal-challenge-detail');   // ← ya existe
         CTX_syncDetailModal();                 // ← añadir
         MAPS_loadForCurrentChallenge();        // ← añadir
       });
───────────────────────────────────────────── */
function MAPS_loadForCurrentChallenge() {
  const ch = window.CTX?.challenge;
  if (!ch) return;

  const container = document.getElementById('streetview-container');
  if (!container) return;

  // Solo para retos exteriores con checkpoint definido
  if (ch.badgeClass === 'outdoor' && ch.checkpoint) {
    const query = ch.checkpoint.query || ch.checkpoint.name;
    MAPS_showStreetView(query);
  } else {
    // Reto interior: restaurar placeholder original
    container.innerHTML = `
      <div class="streetview-inner">
        <span class="sv-icon">🏠</span>
        <p>Reto de interior — sin punto de control</p>
        <p class="sv-sub">Este reto se realiza en casa</p>
      </div>
    `;
  }
}

window.MAPS_loadForCurrentChallenge = MAPS_loadForCurrentChallenge;
window.MAPS_showStreetView          = MAPS_showStreetView;