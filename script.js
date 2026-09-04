const scene = document.getElementById('scene');
const pet = document.getElementById('pet');
const clock = document.getElementById('clock');
const periodLabel = document.getElementById('periodLabel');
const weatherLabel = document.getElementById('weatherLabel');
const autoBtn = document.getElementById('autoBtn');

let mode = 'auto';
let forcedHour = null;
let forcedWeather = 'sunny';

const WEATHER_LABELS = {
  sunny: 'Ensoleillé',
  cloudy: 'Nuageux',
  rainy: 'Pluie',
  stormy: 'Orage'
};

function getPeriod(hour) {
  if (hour >= 6 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 18) return 'day';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function periodName(period) {
  return {
    morning: 'Matin',
    day: 'Journée',
    evening: 'Soirée',
    night: 'Nuit'
  }[period];
}

function setScene(hour, weather) {
  const period = getPeriod(hour);

  scene.className = `scene ${weather} ${period}`;
  pet.className = `pet ${period === 'night' ? 'sleeping' : 'awake'}`;

  const hh = String(hour).padStart(2, '0');
  const mm = mode === 'auto'
    ? String(new Date().getMinutes()).padStart(2, '0')
    : '00';

  clock.textContent = `${hh}:${mm}`;
  periodLabel.textContent = periodName(period);
  weatherLabel.textContent = WEATHER_LABELS[weather] || weather;
}

function renderAuto() {
  if (mode !== 'auto') return;
  const now = new Date();
  setScene(now.getHours(), forcedWeather);
}

function activateButton(target) {
  document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
  if (target) target.classList.add('active');
}

document.querySelectorAll('[data-hour]').forEach(button => {
  button.addEventListener('click', () => {
    mode = 'test';
    forcedHour = Number(button.dataset.hour);
    setScene(forcedHour, forcedWeather);
    activateButton(button);
  });
});

document.querySelectorAll('[data-weather]').forEach(button => {
  button.addEventListener('click', () => {
    forcedWeather = button.dataset.weather;
    const hour = mode === 'auto' ? new Date().getHours() : forcedHour ?? 12;
    setScene(hour, forcedWeather);
    activateButton(button);
  });
});

autoBtn.addEventListener('click', () => {
  mode = 'auto';
  forcedHour = null;
  activateButton(autoBtn);
  renderAuto();
});

renderAuto();
setInterval(renderAuto, 30000);
