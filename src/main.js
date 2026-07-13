// Importamos la función desde nuestro nuevo archivo
import { getWeatherIcon } from './utils.js';
// Inicializamos la animación del fondo


const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherResult = document.getElementById('weather-result');
const suggestionsList = document.getElementById('suggestions');

let debounceTimer;



// 1. Nueva función específica: Obtener clima usando coordenadas exactas
const fetchWeatherByCoords = async (latitude, longitude, name, country) => {
  weatherResult.innerHTML = '<p class="placeholder-text">Cargando clima...</p>';
  
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    const current = weatherData.current;
    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const icon = getWeatherIcon(current.weather_code);

    weatherResult.innerHTML = `
      <div class="weather-card">
        <div class="city-name">${name}, ${country}</div>
        <div class="weather-icon">${icon}</div>
        <div class="temp">${temp}°C</div>
        <div class="humidity">💧 Humedad: ${humidity}%</div>
      </div>
    `;
    cityInput.value = '';
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    weatherResult.innerHTML = '<p class="placeholder-text">⚠️ Hubo un error de conexión.</p>';
  }
};

// 2. Función para cuando el usuario escribe en el input y aprieta "Buscar" o "Enter"
const handleManualSearch = async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  weatherResult.innerHTML = '<p class="placeholder-text">Buscando...</p>';
  suggestionsList.style.display = 'none';

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=es&format=json`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherResult.innerHTML = '<p class="placeholder-text">❌ Ciudad no encontrada. Intenta con otra.</p>';
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    fetchWeatherByCoords(latitude, longitude, name, country);
  } catch (error) {
    weatherResult.innerHTML = '<p class="placeholder-text">⚠️ Hubo un error al buscar la ciudad.</p>';
  }
};

// --- LÓGICA DE AUTOCOMPLETADO ---

const clearSuggestions = () => {
  suggestionsList.innerHTML = '';
  suggestionsList.style.display = 'none';
};

const fetchSuggestions = async (query) => {
  if (!query) {
    clearSuggestions();
    return;
  }

  try {
    // Pedimos hasta 5 sugerencias
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=es&format=json`;
    const response = await fetch(geoUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      clearSuggestions();
      
      data.results.forEach(place => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        // Agregamos la provincia/estado si existe para dar más contexto
        const region = place.admin1 ? `${place.admin1}, ` : '';
        li.textContent = `${place.name}, ${region}${place.country}`;
        
        // Cuando hacemos clic en una sugerencia, usamos sus coordenadas directamente
        li.addEventListener('click', () => {
          cityInput.value = place.name;
          clearSuggestions();
          fetchWeatherByCoords(place.latitude, place.longitude, place.name, place.country);
        });
        
        suggestionsList.appendChild(li);
      });
      suggestionsList.style.display = 'block';
    } else {
      clearSuggestions();
    }
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
  }
};

// --- EVENT LISTENERS ---

// Escuchar mientras el usuario escribe (con retraso de 300ms)
cityInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  const query = e.target.value.trim();
  
  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 300);
});

// Ocultar sugerencias si el usuario hace clic en otra parte de la pantalla
document.addEventListener('click', (e) => {
  if (!cityInput.contains(e.target) && !suggestionsList.contains(e.target)) {
    clearSuggestions();
  }
});

// Buscar con botón o Enter
searchBtn.addEventListener('click', handleManualSearch);
cityInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    handleManualSearch();
  }
});