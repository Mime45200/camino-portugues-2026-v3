# Camino Portugués 2026

Aplicación móvil para las 5 etapas Tui → Santiago de Compostela.

## Qué hace esta versión 3

- Detecta automáticamente qué etapa corresponde a la fecha actual.
- Resalta la etapa de hoy o la próxima.
- Muestra la previsión prevista para cada etapa, con temperatura, lluvia, viento y estado del cielo visibles en móvil.
- Permite tocar cualquier etapa para consultar su pronóstico.
- Actualiza la información al abrir la app o pulsar «Actualizar».
- Incluye enlace directo a la predicción municipal de AEMET para contrastar la información oficial.
- Mantiene modo oscuro.

## Meteorología

La previsión mostrada dentro de la app se obtiene automáticamente de Open-Meteo. AEMET se ofrece como fuente oficial de contraste mediante enlaces directos a sus predicciones municipales.

AEMET indica que su predicción por municipios cubre los próximos 7 días y que la predicción horaria llega hasta 48 horas. Para la integración directa de datos AEMET en la propia app mediante su API haría falta configurar una clave de API y un pequeño backend/proxy seguro.

## Publicación

El proyecto es estático y se puede desplegar en Vercel, Netlify o GitHub Pages.
