/**
 * Database service for player-related operations
 */

const { assignRoles } = require("../utils/helpers");

const players = [];

/**
 * Get all players
 * @returns {Array} Array of player objects
 */
const getAllPlayers = () => {
  return players;
};

/**
 * Add a new player
 * @param {string} nickname - Player's nickname
 * @param {string} socketId - Player's socket ID
 * @returns {Object} The created player
 */
const addPlayer = (nickname, socketId) => {
  const newPlayer = { id: socketId, nickname, score: 0 };
  players.push(newPlayer);
  return newPlayer;
};

/**
 * Find a player by their socket ID
 * @param {string} socketId - Player's socket ID
 * @returns {Object|null} Player object or null if not found
 */
const findPlayerById = (socketId) => {
  return players.find((player) => player.id === socketId) || null;
};

/**
 * Assign roles to all players
 * @returns {Array} Array of players with assigned roles
 */
const assignPlayerRoles = () => {
  let shuffled = players.sort(() => 0.5 - Math.random());
  shuffled[0].role = "marco";
  shuffled[1].role = "polo-especial";
  for (let i = 2; i < shuffled.length; i++) {
    shuffled[i].role = "polo";
  }
  return shuffled;
};

/**
 * Find players by role
 * @param {string|Array} role - Role or array of roles to find
 * @returns {Array} Array of players with the specified role(s)
 */
const findPlayersByRole = (roles) => {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }
  return players.filter((player) => roles.includes(player.role));
};

/**
 * Get all game data (includes players)
 * @returns {Object} Object containing players array
 */
const getGameData = () => {
  return {
    players: players.map(({ id, nickname, score, role }) => ({
      id,
      nickname,
      score,
      role
    }))
  };
};

/**
 * Update a player's score
 * @param {string} playerId - Player's ID
 * @param {number} points - Points to add to the player's score
 * @returns {void}
 */
const updateScore = (playerId, points) => {
  const player = findPlayerById(playerId);
  if (player) {
    player.score += points;
  }
};

/**
 * Reset all players' scores
 * @returns {void}
 */
const resetScores = () => {
  players.forEach(player => {
    player.score = 0;
  });
};

/**
 * Reset game data (clears scores and removes all players)
 * @returns {void}
 */
const resetGame = () => {
  // Remove all players from the array
  players.length = 0;
  // Note: Scores are implicitly reset as players are removed
};

module.exports = {
  getAllPlayers,
  addPlayer,
  findPlayerById,
  assignPlayerRoles,
  findPlayersByRole,
  getGameData,
  updateScore,
  resetScores,
  resetGame,
};
