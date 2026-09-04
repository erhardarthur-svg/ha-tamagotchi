const scene = document.getElementById('scene');
const pet = document.getElementById('pet');
const clock = document.getElementById('clock');
const periodLabel = document.getElementById('periodLabel');
const weatherLabel = document.getElementById('weatherLabel');
const caption = document.getElementById('caption');
const thoughtBubble = document.getElementById('thoughtBubble');
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

const THOUGHTS = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '☕',
  stormy: '⚡'
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

function getCaption(period, weather) {
  if (period === 'night') return 'Chut… il dort.';
  if (weather === 'stormy') return 'Ouh… ça gronde dehors.';
  if (weather === 'rainy') return 'Parfait pour rester au chaud.';
  if (weather === 'cloudy') return period === 'morning'
    ? 'Réveil tranquille sous les nuages.'
    : 'Petite journée calme à la maison.';
  if (period === 'morning') return 'Bonjour ! Une nouvelle journée commence.';
  if (period === 'evening') return 'La maison se pose pour la soirée.';
  return 'Belle journée à la maison.';
}

function getPetClasses(period, weather) {
  const classes = ['pet'];

  if (period === 'night') {
    classes.push('sleeping');
    return classes.join(' ');
  }

  classes.push('awake');

  if (weather === 'rainy' || weather === 'cloudy') {
    classes.push('cozy');
  }

  if (weather === 'stormy') {
    classes.push('stormy-mood');
  }

  return classes.join(' ');
}

function setScene(hour, weather) {
  const period = getPeriod(hour);

  scene.className = `scene ${weather} ${period}`;
  pet.className = getPetClasses(period, weather);

  const hh = String(hour).padStart(2, '0');
  const mm = mode === 'auto'
    ? String(new Date().getMinutes()).padStart(2, '0')
    : '00';

  clock.textContent = `${hh}:${mm}`;
  periodLabel.textContent = periodName(period);
  weatherLabel.textContent = WEATHER_LABELS[weather] || weather;
  caption.textContent = getCaption(period, weather);
  thoughtBubble.textContent = THOUGHTS[weather] || '•';
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
    const hour = mode === 'auto'
      ? new Date().getHours()
      : forcedHour ?? 12;

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
activateButton(autoBtn);
setInterval(renderAuto, 30000);
