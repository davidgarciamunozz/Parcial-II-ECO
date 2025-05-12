import { navigateTo, socket } from "../app.js";

export default function renderScreen1() {
  // Ya no se necesita la lógica de localStorage aquí, app.js lo maneja.

  const app = document.getElementById("app");
  app.innerHTML = `
      <div id="screen1" class="scores-container">
        <h2>🏆 Puntuaciones en Vivo 🏆</h2>
        <div class="sort-buttons">
          <button id="sort-score" class="active">Por Puntuación</button>
          <button id="sort-alphabetical">Alfabéticamente</button>
        </div>
        <div class="score-header">
          <span class="position-header">Pos</span>
          <span class="player-header">Jugador</span>
          <span class="score-header">Puntos</span>
        </div>
        <div id="players-list" class="players-list"></div>
      </div>
      `;

  const playersList = document.getElementById("players-list");
  const sortScoreBtn = document.getElementById("sort-score");
  const sortAlphaBtn = document.getElementById("sort-alphabetical");
  let currentPlayers = []; // Para mantener el estado actual de los jugadores
  let currentSort = "score"; // Default sort by score

  function updatePlayersList(players, sortType = currentSort) {
    currentPlayers = players; // Actualizar el estado
    let sortedPlayers;
    
    if (sortType === "score") {
      sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    } else {
      sortedPlayers = [...players].sort((a, b) => a.nickname.localeCompare(b.nickname));
    }
    
    playersList.innerHTML = sortedPlayers.map((player, index) => `
      <div class="player-score ${player.score < 0 ? 'negative-score' : ''}">
        <span class="position">${sortType === "score" ? (index + 1) : '•'}</span>
        <span class="nickname">${player.nickname}</span>
        <span class="score ${player.score >= 0 ? 'positive' : 'negative'}">${player.score} pts</span>
      </div>
    `).join('');
  }

  // Sort buttons click handlers
  sortScoreBtn.addEventListener("click", () => {
    currentSort = "score";
    sortScoreBtn.classList.add("active");
    sortAlphaBtn.classList.remove("active");
    updatePlayersList(currentPlayers, "score");
  });

  sortAlphaBtn.addEventListener("click", () => {
    currentSort = "alphabetical";
    sortAlphaBtn.classList.add("active");
    sortScoreBtn.classList.remove("active");
    updatePlayersList(currentPlayers, "alphabetical");
  });

  // Listen for score updates
  socket.on("score-update", (players) => {
    updatePlayersList(players, currentSort);
  });

  // Listen for game over
  socket.on("game-winner", (data) => {
    // Guardar los datos del juego en localStorage y navegar a la pantalla final
    localStorage.setItem('gameResults', JSON.stringify(data));
    navigateTo("/screen2", data);
  });
}
