import { navigateTo, socket, makeRequest } from "../app.js";

export default function renderGameGround(data) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="game-ground">
      <h2 id="game-nickname-display">${data.nickname}</h2>
      <p>Tu rol es:</p>
      <h2 id="role-display">${data.role}</h2>
      <h2 id="shout-display"></h2>
      <div id="pool-players"></div>
      <button id="shout-button">Gritar ${data.role}</button>
      <div id="game-message" class="message-display"></div>
    </div>
  `;

  const nickname = data.nickname;
  let polos = []; // Array para almacenar los polos de la ronda actual
  const myRole = data.role;
  const shoutbtn = document.getElementById("shout-button");
  const shoutDisplay = document.getElementById("shout-display");
  const container = document.getElementById("pool-players");
  const gameMessage = document.getElementById("game-message");

  if (myRole !== "marco") {
    shoutbtn.style.display = "none";
  }

  shoutDisplay.style.display = "none";

  function updatePoloButtons() {
    if (myRole === "marco" && polos.length > 0) {
      container.innerHTML = "<p>Haz click sobre el polo que quieres escoger:</p>";
      polos.forEach((elemt) => {
        const button = document.createElement("button");
        button.innerHTML = `Un jugador gritó: ${elemt.message}`;
        button.setAttribute("data-key", elemt.userId);
        container.appendChild(button);
      });
    }
  }

  // Replace socket.emit with HTTP requests
  shoutbtn.addEventListener("click", async () => {
    if (myRole === "marco") {
      await makeRequest("/api/game/marco", "POST", {
        socketId: socket.id,
      });
    }
    if (myRole === "polo" || myRole === "polo-especial") {
      await makeRequest("/api/game/polo", "POST", {
        socketId: socket.id,
      });
    }
    shoutbtn.style.display = "none";
  });

  // Add event listener to the container for all buttons: this is called event delegation
  container.addEventListener("click", async function (event) {
    if (event.target.tagName === "BUTTON") {
      const key = event.target.dataset.key;
      await makeRequest("/api/game/select-polo", "POST", {
        socketId: socket.id,
        poloId: key,
      });
      // Limpiar los botones y el array después de seleccionar un polo
      container.innerHTML = "";
      polos = [];
    }
  });

  // Keep socket.on listeners for receiving notifications
  socket.on("notification", (data) => {
    console.log("Notification", data);
    if (myRole === "marco") {
      // Agregar el nuevo polo al array sin limpiar los anteriores
      polos.push(data);
      // Actualizar los botones mostrando todos los polos acumulados
      updatePoloButtons();
    } else {
      shoutbtn.style.display = "block";
      shoutDisplay.innerHTML = `Marco ha gritado: ${data.message}`;
      shoutDisplay.style.display = "block";
    }
  });

  // Handle game over notification
  socket.on("notifyGameOver", (data) => {
    gameMessage.innerHTML = data.message;
    gameMessage.style.display = "block";
    container.innerHTML = "";
    shoutbtn.style.display = "none";
    shoutDisplay.style.display = "none";
    // Limpiar el array de polos para la siguiente ronda
    polos = [];
    
    // Re-enable shout button after 3 seconds for next round
    setTimeout(() => {
      if (myRole === "marco") {
        shoutbtn.style.display = "block";
      }
      gameMessage.style.display = "none";
    }, 3000);
  });

  // Handle winner notification and redirect to results
  socket.on("game-winner", (data) => {
    gameMessage.innerHTML = data.message;
    gameMessage.style.display = "block";
    container.innerHTML = "";
    shoutbtn.style.display = "none";
    shoutDisplay.style.display = "none";
    
    // Guardar los datos del juego en localStorage antes de redirigir
    localStorage.setItem('gameResults', JSON.stringify({
      winner: data.winner,
      players: data.players,
      message: data.message
    }));
    
    // Redirect to results screen after showing the message
    setTimeout(() => {
      window.location.href = "/results";
    }, 2000);
  });
}
