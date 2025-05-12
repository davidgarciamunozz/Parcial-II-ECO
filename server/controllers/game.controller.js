const playersDb = require("../db/players.db");
const {
  emitEvent,
  emitToSpecificClient,
} = require("../services/socket.service");

const joinGame = async (req, res) => {
  try {
    const { nickname, socketId } = req.body;
    playersDb.addPlayer(nickname, socketId);

    const gameData = playersDb.getGameData();
    emitEvent("userJoined", gameData);
    emitEvent("score-update", gameData.players);

    res.status(200).json({ success: true, players: gameData.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startGame = async (req, res) => {
  try {
    const playersWithRoles = playersDb.assignPlayerRoles();
    playersDb.resetScores();

    playersWithRoles.forEach((player) => {
      emitToSpecificClient(player.id, "startGame", player.role);
    });

    const gameData = playersDb.getGameData();
    emitEvent("score-update", gameData.players);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyMarco = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole([
      "polo",
      "polo-especial",
    ]);

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Marco!!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyPolo = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole("marco");

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Polo!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const selectPolo = async (req, res) => {
  try {
    const { socketId, poloId } = req.body;

    const marcoPlayer = playersDb.findPlayerById(socketId);
    const caughtPoloPlayer = playersDb.findPlayerById(poloId);
    const allPlayers = playersDb.getAllPlayers();
    let gameMessage = "";

    if (!marcoPlayer || !caughtPoloPlayer) {
      return res.status(404).json({ error: "Player not found" });
    }

    if (caughtPoloPlayer.role === "polo-especial") {
      playersDb.updateScore(socketId, 50);
      playersDb.updateScore(poloId, -10);
      gameMessage = `¡${marcoPlayer.nickname} (Marco) atrapó a ${caughtPoloPlayer.nickname} (Polo Especial)! Marco +50 pts, Polo Especial -10 pts.`;
    } else {
      playersDb.updateScore(socketId, -10);
      playersDb.updateScore(poloId, -10);
      
      const especialPoloPlayers = playersDb.findPlayersByRole("polo-especial");
      if (especialPoloPlayers && especialPoloPlayers.length > 0) {
        const especialPoloId = especialPoloPlayers[0].id;
        playersDb.updateScore(especialPoloId, 10);
        gameMessage = `¡${marcoPlayer.nickname} (Marco) atrapó a ${caughtPoloPlayer.nickname} (Polo Regular)! Marco -10 pts, Polo Regular -10 pts. ¡${especialPoloPlayers[0].nickname} (Polo Especial) sobrevive y gana +10 pts!`;
      } else {
        gameMessage = `¡${marcoPlayer.nickname} (Marco) atrapó a ${caughtPoloPlayer.nickname} (Polo Regular)! Marco -10 pts, Polo Regular -10 pts.`;
      }
    }

    const gameData = playersDb.getGameData();
    const winner = gameData.players.find(player => player.score >= 100);

    if (winner) {
      emitEvent("game-winner", {
        winner,
        players: gameData.players,
        message: `¡${winner.nickname} ha ganado el juego con ${winner.score} puntos!`
      });
    } else {
      emitEvent("score-update", gameData.players);
      allPlayers.forEach((player) => {
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: gameMessage,
          nickname: player.nickname
        });
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error in selectPolo controller:", err);
    res.status(500).json({ error: err.message });
  }
};

const resetGame = async (req, res) => {
  try {
    playersDb.resetGame();
    
    const gameData = playersDb.getGameData();
    emitEvent("score-update", gameData.players);
    emitEvent("userJoined", gameData);
    
    res.status(200).json({ success: true, message: "Game reset successfully, all players removed." });
  } catch (err) {
    console.error("Error in resetGame controller:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  joinGame,
  startGame,
  notifyMarco,
  notifyPolo,
  selectPolo,
  resetGame
};
