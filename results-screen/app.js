import renderScreen1 from "./screens/screen1.js";
import renderScreen2 from "./screens/screen2.js";

const socket = io("/", { path: "/real-time" });

function clearScripts() {
  document.getElementById("app").innerHTML = "";
}

// Modificar la lógica de ruta inicial
function initializeRoute() {
  const gameResults = JSON.parse(localStorage.getItem('gameResults'));
  if (gameResults) {
    // Si hay resultados guardados, ir directamente a la pantalla final
    renderRoute({ path: "/screen2", data: gameResults });
  } else {
    // Si no, ir a la pantalla de puntuaciones en vivo
    renderRoute({ path: "/", data: {} });
  }
}

function renderRoute(route) {
  clearScripts();
  switch (route.path) {
    case "/":
      renderScreen1(route.data);
      break;
    case "/screen2":
      renderScreen2(route.data);
      break;
    default:
      // Por defecto, mostrar la pantalla 1 si la ruta no es reconocida
      renderScreen1(route.data);
  }
}

function navigateTo(path, data) {
  const newRoute = { path, data };
  renderRoute(newRoute);
}

async function makeRequest(url, method, body) {
  try {
    const BASE_URL = "http://localhost:5050";
    let response = await fetch(`${BASE_URL}${url}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API request failed:", error);
    return { success: false, error: error.message };
  }
}

// Inicializar la ruta al cargar la página
initializeRoute();

export { navigateTo, socket, makeRequest };
