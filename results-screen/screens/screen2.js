import { navigateTo, socket, makeRequest } from "../app.js";

export default function renderScreen2(data) {
  // Se asume que app.js ya ha cargado los datos correctamente
  if (!data || !data.winner) {
    console.error("Error: No game data provided to renderScreen2");
    // Opcional: Redirigir si faltan datos cruciales
    // window.location.href = "/game"; 
    return; // Detener el renderizado si no hay datos
  }

  const app = document.getElementById("app");
  app.innerHTML = `
      <div id="screen2" class="final-scores-container">
        <div class="winner-section">
          <h2>🎉 ¡Fin del Juego! 🎉</h2>
          <div class="winner-announcement">
            <h3>🏆 Ganador: ${data.winner.nickname}</h3>
            <p class="winner-score">${data.winner.score} puntos</p>
          </div>
        </div>
        <div class="scores-section">
          <h3>Tabla de Puntuaciones</h3>
          <div class="sort-buttons">
            <button id="sort-score" class="active">Por Puntuación</button>
            <button id="sort-alphabetical">Alfabéticamente</button>
          </div>
          <div class="score-header">
            <span class="position-header">Pos</span>
            <span class="player-header">Jugador</span>
            <span class="score-header">Puntos</span>
          </div>
          <div id="final-players-list" class="players-list"></div>
        </div>
        <div class="action-buttons">
          <button id="reset-game" class="reset-button">🔄 Reiniciar Juego</button>
          <p class="reset-info">Este botón reiniciará el juego para todos los jugadores</p>
        </div>
      </div>
      `;

  const playersList = document.getElementById("final-players-list");
  const sortScoreBtn = document.getElementById("sort-score");
  const sortAlphaBtn = document.getElementById("sort-alphabetical");
  const resetButton = document.getElementById("reset-game");
  let currentSort = "score"; // Default sort by score

  function updatePlayersList(players, sortType = "score") {
    let sortedPlayers;
    if (sortType === "score") {
      sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    } else {
      sortedPlayers = [...players].sort((a, b) => a.nickname.localeCompare(b.nickname));
    }
    
    playersList.innerHTML = sortedPlayers.map((player, index) => `
      <div class="player-score ${player.score < 0 ? 'negative-score' : ''} ${player.id === data.winner.id ? 'winner' : ''}">
        <span class="position">${sortType === "score" ? (index + 1) : '•'}</span>
        <span class="nickname">${player.nickname}</span>
        <span class="score ${player.score >= 0 ? 'positive' : 'negative'}">${player.score} pts</span>
      </div>
    `).join('');
  }

  // Initial render
  updatePlayersList(data.players, "score");

  // Sort buttons click handlers
  sortScoreBtn.addEventListener("click", () => {
    currentSort = "score";
    sortScoreBtn.classList.add("active");
    sortAlphaBtn.classList.remove("active");
    updatePlayersList(data.players, "score");
  });

  sortAlphaBtn.addEventListener("click", () => {
    currentSort = "alphabetical";
    sortAlphaBtn.classList.add("active");
    sortScoreBtn.classList.remove("active");
    updatePlayersList(data.players, "alphabetical");
  });

  // Reset button click handler
  resetButton.addEventListener("click", async () => {
    resetButton.disabled = true;
    resetButton.textContent = "Reiniciando...";
    
    try {
      const result = await makeRequest("/api/game/reset", "POST");
      if (result.success) {
        localStorage.removeItem('gameResults');
        socket.emit("force-reset");
        setTimeout(() => {
          window.location.href = "/game";
        }, 1000);
      } else {
        throw new Error("Failed to reset game");
      }
    } catch (error) {
      console.error("Error resetting game:", error);
      resetButton.textContent = "Error al reiniciar";
      setTimeout(() => {
        resetButton.disabled = false;
        resetButton.textContent = "🔄 Reiniciar Juego";
      }, 2000);
    }
  });

  // Listen for force reset from server
  socket.on("force-reset", () => {
    localStorage.removeItem('gameResults');
    window.location.href = "/game";
  });
}
