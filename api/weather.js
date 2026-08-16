const stages = {
  "1": { municipio: "36055", nombre: "Tui" },
  "2": { municipio: "36041", nombre: "Poio" },
  "3": { municipio: "36005", nombre: "Caldas de Reis" },
  "4": { municipio: "15065", nombre: "Padrón" },
  "5": { municipio: "15078", nombre: "Santiago de Compostela" }
};

export default async function handler(req, res) {
  try {
    const stage = String(req.query.stage || "");
    const item = stages[stage];

    if (!item) {
      return res.status(400).json({ error: "Etapa no válida" });
    }

    const apiKey = process.env.AEMET_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Falta la variable AEMET_API_KEY en Vercel"
      });
    }

    const url =
      `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${item.municipio}?api_key=${encodeURIComponent(apiKey)}`;

    const first = await fetch(url);

    if (!first.ok) {
      return res.status(first.status).json({
        error: "AEMET no respondió correctamente"
      });
    }

    const firstData = await first.json();

    if (!firstData.datos) {
      return res.status(502).json({
        error: "AEMET no devolvió la URL de datos"
      });
    }

    const second = await fetch(firstData.datos);

    if (!second.ok) {
      return res.status(second.status).json({
        error: "No se pudieron obtener los datos de AEMET"
      });
    }

    const raw = await second.json();

    const prediction =
      Array.isArray(raw) && raw[0]?.prediccion?.dia
        ? raw[0].prediccion.dia
        : [];

    const dias = prediction.map(dia => {
      const cielo = Array.isArray(dia.estadoCielo)
        ? dia.estadoCielo.find(x => x.periodo === "00-24") ||
          dia.estadoCielo[0]
        : null;

      const lluvia = Array.isArray(dia.probPrecipitacion)
        ? dia.probPrecipitacion.find(x => x.periodo === "00-24") ||
          dia.probPrecipitacion[0]
        : null;

      const velocidades = [];

      if (Array.isArray(dia.viento)) {
        dia.viento.forEach(v => {
          if (Array.isArray(v.velocidad)) {
            v.velocidad.forEach(x => {
              const n = Number(x);
              if (Number.isFinite(n)) velocidades.push(n);
            });
          }
        });
      }

      return {
        fecha: dia.fecha,
        minima: Number(dia.temperatura?.minima ?? null),
        maxima: Number(dia.temperatura?.maxima ?? null),
        probLluvia: Number(lluvia?.value ?? 0),
        vientoMax: velocidades.length ? Math.max(...velocidades) : 0,
        estadoCielo: cielo?.descripcion || "Variable"
      };
    });

    return res.status(200).json({
      municipio: item.nombre,
      dias
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Error consultando AEMET"
    });
  }
}
