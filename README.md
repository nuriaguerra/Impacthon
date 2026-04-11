# Impacthon 2026
Somos completamente novatos en esto, es mas que nada para la experiencia y aprender.
# AUTORES:
  - Carolina Silva Rey
  - Martín García Cebeiro
  - Nuria Guerra Casal
  - Iago Leis Fernández

Hemos elegido los retos 1 y 4, planteamos una aplicación de retos tanto físicos como mentales donde el eje principal es competir con tus amigos. 
La aplicación contemplara una Leaderboard donde se podrá comprobar a tiempo real las posiciones, los jugadores que acaben el dia en las posiciones mas bajas seran penalizados con castigos impuestos mediante una votación por los jugadores que mas alto se encuentren en el ranking

## Para ejecutarlo en local:
- Primero clonar el repo con la estructura de carpetas dada.
- Abrir una terminal y moverte hasta la carpeta del proyecto
- Ejecutar: python3 -m http.server 8005  |8005 es un puerto, podeis elegir el que mas os guste
- Con eso tendreis un enlace para ver la version de ordenador.

- Para usar la geolocalización se copia el enlace y se substituye por http://localhost:8005/
    ⚠️ No uar http://0.0.0.0:8005/ (por ejemplo), ya que puede causar problemas con algunas APIs del navegador (como la geolocalización).

## Para verlo en el móvil:
- Con eduroam a mi no me iba asi q poneros los datos del móvil
- Mirar vuestra ip una vez conectados a los datos con: hostname -I
- En el buscador de vuestro móvil poned: http://vuestraIP:vuestropuerto/
- Buscad y ya deberíais verlo

## Para linkear el repo de git con el local
- En donde quieras crear la carpeta del git, copia esto: git clone https://github.com/nuriaguerra/Impacthon.git

## Google Maps

La aplicación utiliza la geolocalización del navegador para adaptar el contenido (clima y retos) según la posición del usuario. Al abrir la web por primera vez: El navegador solicitará permiso de ubicación y se deberá seleccionar “Permitir”. Si no aparece la solicitud se debe hacer clic en el icono de candado 🔒 o el simbolo de maps en la barra del navegador y permitir ubicación.

## Pages de github:
https://nuriaguerra.github.io/Impacthon/
