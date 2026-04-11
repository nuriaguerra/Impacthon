# TouchGrass

**Proyecto del Impacthon 2026** — Retos 1 y 4.

TouchGrass es una aplicación móvil de retos diarios físicos y mentales con competición entre amigos. Cada día se genera un reto personalizado según el clima y el nivel de energía del usuario. El grupo compite en un leaderboard en tiempo real y cada 5.000 XP acumulados entre todos los miembros se planta un árbol real.

---

## Equipo

| Nombre |
|--------|
| Carolina Silva Rey |
| Martín García Cebeiro | 
| Nuria Guerra Casal | 
| Iago Leis Fernández | 

---

## Características principales

- **Reto diario personalizado** — Selección según tipo (interior/exterior/aleatorio) y nivel de energía (bajo/medio/alto), adaptado automáticamente al clima del usuario via Open-Meteo
- **Tracker GPS** — Registro de rutas en tiempo real con contador de kilómetros.
- **Leaderboard en tiempo real** — Clasificación del grupo sincronizada con Firestore, se actualiza al instante cuando alguien gana XP
- **Sistema de grupos** — Crear o unirse a grupos mediante código de 6 caracteres; soporte para múltiples grupos por usuario
- **Chat de grupo** — Mensajería en tiempo real dentro de cada grupo
- **Impacto medioambiental** — Por cada 5.000 XP acumulados entre todos los miembros del grupo, la empresa se compromete a plantar un árbol real
- **Recompensas por XP** — Al cruzar ciertos umbrales de XP se reciben Acorns (moneda de la app) automáticamente
- **Street View** — Los retos exteriores muestran el punto de control en Google Street View
- **Detección de clima** — Open-Meteo + Nominatim para adaptar el tipo de reto según las condiciones meteorológicas

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Base de datos | Firebase Firestore (NoSQL) |
| Autenticación | Firebase Auth (Google) |
| Clima | Open-Meteo API (sin API key) |
| Geolocalización | Web Geolocation API (`navigator.geolocation`) |
| Geocodificación | Nominatim (OpenStreetMap) |
| Mapas | Google Maps JavaScript API  + Street View |
| Imagen de mapa (fallback) | Google Maps Static API |
| Búsqueda de lugares | Google Places API |
| Confeti | canvas-confetti |
| Hosting | GitHub Pages |

---

## Estructura del proyecto

```
.
├── index.html          — HTML principal (pantallas, modales y navegación)
├── js/
│   ├── firebase-config.js  — Credenciales Firebase
│   ├── app.js              — Lógica principal: auth, grupos, leaderboard, chat
│   ├── challenges.js       — Base de datos de retos, tracker GPS, selección diaria
│   ├── context.js          — Detección de clima y geolocalización
│   └── maps.js             — Google Maps: Street View y directions
└── css/
    ├── styles.css          — Estilos principales (tema oscuro, tipografías...)
    ├── context.css         — Botones de encuesta, energía, banner de clima
    └── tracker.css         — Panel del tracker GPS, placeholder de reto
```

---
## Usar la app

Para probar la app basta con entrar al siguiente link del pages: https://nuriaguerra.github.io/Impacthon/

## Ejecutar en local

```bash
# Clonar el repositorio
git clone https://github.com/nuriaguerra/Impacthon.git
cd Impacthon

# Arrancar el servidor local
python3 -m http.server 8005
```

Abrir en el navegador: `http://localhost:8005`

> ⚠️ Usar `localhost` y no `0.0.0.0` — algunas APIs del navegador (geolocalización, Firebase Auth) requieren un origen seguro o reconocido.

---

## Ver en el móvil (red local)

```bash
# Obtener la IP local
hostname -I
```

En el navegador del móvil, conectado a la misma red:

```
http://<tu-IP>:8005
```

> Si hay problemas de red, usar los datos móviles del ordenador como hotspot (Eduroam a veces da problemas para este tipo de cosas).

---

## Configuración de Firebase (por si quieres tener la tuya personal)

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Activar **Authentication → Google**
3. Activar **Firestore Database** en modo de prueba
4. Registrar una app web y copiar la configuración en `js/firebase-config.js`
5. En **Authentication → Configuración → Dominios autorizados**, añadir:
   - `localhost`
   - `tuusuario.github.io`

---

## Geolocalización

Al abrir la app por primera vez el navegador solicitará permiso de ubicación. Seleccionar **Permitir**. Si no aparece la solicitud, hacer clic en el icono de candado 🔒 de la barra del navegador y activar la ubicación manualmente.

La ubicación se usa para detectar el clima y adaptar el tipo de reto. No se almacena en ningún servidor.

---

## Colecciones de Firestore

| Colección | Descripción |
|-----------|-------------|
| `users` | Perfil, XP, Acorns, racha, grupos y retos completados |
| `groups` | Nombre, código, miembros, XP total y árboles plantados |
| `messages` | Mensajes del chat por grupo |
| `notifications` | Notificaciones en tiempo real (retos, superaciones, árboles) |

---

## Uso de APIs

Toda esta parte se encuentra explicada de manera extensa a continuación:[APIs](https://nuriaguerra.github.io/Impacthon/apis.html)

---

## GitHub Pages

[https://nuriaguerra.github.io/Impacthon/](https://nuriaguerra.github.io/Impacthon/)
