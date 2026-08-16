const stages = [
  { n:1, date:"2026-08-21", label:"21 Ago", from:"Tui", to:"Redondela", km:31.5,
    aemet:"https://www.aemet.es/es/eltiempo/prediccion/municipios/tui-id36055",
    lat:42.0464, lon:-8.6444 },
  { n:2, date:"2026-08-22", label:"22 Ago", from:"Redondela", to:"Poio", km:21,
    aemet:"https://www.aemet.es/es/eltiempo/prediccion/municipios/redondela-id36045",
    lat:42.2838, lon:-8.6089 },
  { n:3, date:"2026-08-23", label:"23 Ago", from:"Poio", to:"Caldas de Reis", km:22,
    aemet:"https://www.aemet.es/es/eltiempo/prediccion/municipios/poio-convento-o-id36041",
    lat:42.4461, lon:-8.6858 },
  { n:4, date:"2026-08-24", label:"24 Ago", from:"Caldas de Reis", to:"Padrón", km:19,
    aemet:"https://www.aemet.es/es/eltiempo/prediccion/municipios/caldas-de-reis-id36005",
    lat:42.6026, lon:-8.6424 },
  { n:5, date:"2026-08-25", label:"25 Ago", from:"Padrón", to:"Santiago de Compostela", km:25,
    aemet:"https://www.aemet.es/es/eltiempo/prediccion/municipios/padron-id15065",
    lat:42.7373, lon:-8.6604 }
];

const weatherEl = document.querySelector("#weather");
const stagesEl = document.querySelector("#stages");
const selectedEl = document.querySelector("#selectedWeather");
let weatherData = {};
let selectedStage = null;

function icon(code) {
  if (code === 0) return "☀️";
  if ([1,2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45,48].includes(code)) return "🌫️";
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return "🌧️";
  if ([71,73,75,77,85,86].includes(code)) return "🌨️";
  if ([95,96,99].includes(code)) return "⛈️";
  return "🌤️";
}

function weatherText(code) {
  if (code === 0) return "Cielo despejado";
  if ([1,2].includes(code)) return "Poco nuboso";
  if (code === 3) return "Nublado";
  if ([45,48].includes(code)) return "Niebla";
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return "Lluvia";
  if ([71,73,75,77,85,86].includes(code)) return "Nieve";
  if ([95,96,99].includes(code)) return "Tormenta";
  return "Variable";
}

function localToday() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone:"Europe/Madrid", year:"numeric", month:"2-digit", day:"2-digit"
  }).formatToParts(now);
  const obj = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${obj.year}-${obj.month}-${obj.day}`;
}

function stageState(stage) {
  const today = localToday();
  if (today < stage.date) return "pendiente";
  if (today === stage.date) return "hoy";
  return "completada";
}

function getCurrentStage() {
  return stages.find(s => stageState(s) === "hoy")
      || stages.find(s => stageState(s) === "pendiente")
      || stages[stages.length - 1];
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday:"long", day:"numeric", month:"long"
  }).format(new Date(`${dateString}T12:00:00`));
}

function renderStages() {
  const current = getCurrentStage();
  stagesEl.innerHTML = stages.map(s => {
    const state = stageState(s);
    const stateLabel = state === "hoy" ? "HOY" :
      state === "completada" ? "COMPLETADA" : "PRÓXIMA";
    return `<button class="stage ${s.n === current.n ? "current" : ""} ${state}" data-stage="${s.n}">
      <div class="stage-num">${s.n}</div>
      <div class="stage-main">
        <h3>${s.from} → ${s.to}</h3>
        <p>${s.label} · ${s.km} km</p>
      </div>
      <div class="stage-state">${stateLabel}</div>
    </button>`;
  }).join("");

  stagesEl.querySelectorAll(".stage").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedStage = stages.find(s => s.n === Number(btn.dataset.stage));
      renderSelected();
      selectedEl.scrollIntoView({behavior:"smooth", block:"center"});
    });
  });
}

function renderSelected() {
  const s = selectedStage || getCurrentStage();
  const data = weatherData[s.n];

  if (!data) {
    selectedEl.innerHTML = `<div>
      <div class="selected-top">
        <div>
          <span class="pill">${stageState(s)==="hoy" ? "ETAPA DE HOY" : stageState(s)==="pendiente" ? "PRÓXIMA ETAPA" : "ETAPA COMPLETADA"}</span>
          <h3>${s.from} → ${s.to}</h3>
          <p>${formatDate(s.date)} · ${s.km} km</p>
        </div>
        <div class="selected-icon">⏳</div>
      </div>
      <p class="forecast-note">Cargando la previsión meteorológica para esta etapa…</p>
    </div>`;
    return;
  }

  selectedEl.innerHTML = `
    <div class="selected-top">
      <div>
        <span class="pill">${stageState(s)==="hoy" ? "ETAPA DE HOY" : stageState(s)==="pendiente" ? "PRÓXIMA ETAPA" : "ETAPA COMPLETADA"}</span>
        <h3>${s.from} → ${s.to}</h3>
        <p>${formatDate(s.date)} · ${s.km} km</p>
        <div class="weather-summary">${Math.round(data.temperature_2m_min)}° / ${Math.round(data.temperature_2m_max)}° <span>· ${weatherText(data.weather_code)}</span></div>
      </div>
      <div class="selected-icon">${icon(data.weather_code)}</div>
    </div>
    <div class="forecast-big">
      <div><strong>${Math.round(data.temperature_2m_min)}°</strong><span>Mínima</span></div>
      <div><strong>${Math.round(data.temperature_2m_max)}°</strong><span>Máxima</span></div>
      <div><strong>${data.precipitation_probability_max ?? "—"}%</strong><span>Prob. lluvia</span></div>
      <div><strong>${Math.round(data.windspeed_10m_max)} km/h</strong><span>Viento máx.</span></div>
    </div>
    <p class="condition">${weatherText(data.weather_code)}</p>
    <div class="selected-actions">
      <a href="${s.aemet}" target="_blank" rel="noopener">Ver AEMET de ${s.from} ↗</a>
    </div>
    <p class="forecast-note">La previsión se consulta automáticamente al abrir la app o al pulsar «Actualizar».</p>`;
}

function renderAllWeather() {
  weatherEl.innerHTML = stages.map(s => {
    const d = weatherData[s.n];
    if (!d) return `<article class="weather loading"><strong>${s.label}</strong><span>Consultando…</span></article>`;
    const state = stageState(s);
    return `<article class="weather ${state==="hoy" ? "today-weather" : ""}">
      <div class="date">${s.label} · Etapa ${s.n}</div>
      <div class="route">${s.from} → ${s.to}</div>
      <div class="wi">${icon(d.weather_code)}</div>
      <div class="condition-small">${weatherText(d.weather_code)}</div>
      <div class="temp">${Math.round(d.temperature_2m_min)}° / ${Math.round(d.temperature_2m_max)}°</div>
      <div class="rain">💧 ${d.precipitation_probability_max ?? "—"}%</div>
      <div class="muted">💨 ${Math.round(d.windspeed_10m_max)} km/h</div>
      <a href="${s.aemet}" target="_blank" rel="noopener" class="aemet-link">AEMET ↗</a>
    </article>`;
  }).join("");
}

function renderTodayHeader() {
  const s = getCurrentStage();
  const state = stageState(s);
  const d = weatherData[s.n];
  document.querySelector("#todayLabel").textContent =
    state==="hoy" ? "ETAPA DE HOY" : state==="pendiente" ? "PRÓXIMA ETAPA" : "CAMINO COMPLETADO";
  document.querySelector("#todayTitle").textContent = `${s.from} → ${s.to}`;
  document.querySelector("#todayMeta").textContent = `${formatDate(s.date)} · ${s.km} km`;
  document.querySelector("#todayStatus").textContent =
    state==="hoy" ? "Esta es la etapa que toca hoy. Revisa la previsión antes de salir." :
    state==="pendiente" ? "La app cambiará automáticamente a esta etapa cuando llegue su fecha." :
    "Las cinco etapas previstas ya han pasado.";
  document.querySelector("#todayIcon").textContent = d ? icon(d.weather_code) : "⏳";
}

async function fetchStageWeather(s) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=Europe%2FMadrid&forecast_days=16`;
  const response = await fetch(url, {cache:"no-store"});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  if (!json.daily || !Array.isArray(json.daily.time)) throw new Error("Respuesta meteorológica no válida");
  const idx = json.daily.time.indexOf(s.date);
  if (idx < 0) throw new Error(`La fecha ${s.date} todavía no está disponible`);
  return {
    weather_code: json.daily.weather_code[idx],
    temperature_2m_min: json.daily.temperature_2m_min[idx],
    temperature_2m_max: json.daily.temperature_2m_max[idx],
    precipitation_probability_max: json.daily.precipitation_probability_max[idx],
    windspeed_10m_max: json.daily.windspeed_10m_max[idx]
  };
}

async function loadWeather() {
  weatherData = {};
  renderStages();
  renderAllWeather();
  renderTodayHeader();
  renderSelected();
  document.querySelector("#updated").textContent = "Actualizando previsión…";

  const results = await Promise.allSettled(stages.map(fetchStageWeather));
  const failed = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") weatherData[stages[i].n] = result.value;
    else failed.push(stages[i]);
  });

  renderStages();
  renderAllWeather();
  renderTodayHeader();
  renderSelected();

  if (failed.length) {
    const names = failed.map(s => s.n).join(", ");
    document.querySelector("#updated").textContent =
      `Actualizado: ${new Date().toLocaleString("es-ES")} · No disponible para etapa(s): ${names}`;
    failed.forEach(s => {
      const card = [...weatherEl.children].find(el => el.textContent.includes(`Etapa ${s.n}`));
      if (card) card.innerHTML = `<strong>${s.from} → ${s.to}</strong>
        <span>Previsión no disponible ahora.</span>
        <a href="${s.aemet}" target="_blank" rel="noopener">Consultar AEMET ↗</a>`;
      card?.classList.add("weather-error");
    });
  } else {
    document.querySelector("#updated").textContent =
      `Actualizado: ${new Date().toLocaleString("es-ES")}`;
  }
}

document.querySelector("#refresh").addEventListener("click", loadWeather);
document.querySelector("#theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
});
if (localStorage.getItem("dark") === "true") document.body.classList.add("dark");

selectedStage = getCurrentStage();
renderStages();
renderAllWeather();
renderTodayHeader();
renderSelected();
loadWeather();
