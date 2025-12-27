import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let playerObj;
let allPlayers = {};
let currentCollectible;

// When connected, log it
socket.on('connect', () => {
  console.log('Connected');
});

// Initial Setup
socket.on('init', ({ id, players, collectible }) => {
  // Create our player
  playerObj = new Player({ 
    x: players[id].x, 
    y: players[id].y, 
    score: players[id].score, 
    id: id 
  });

  // Create other players
  delete players[id];
  for (let key in players) {
    allPlayers[key] = new Player({
      x: players[key].x,
      y: players[key].y,
      score: players[key].score,
      id: key
    });
  }

  currentCollectible = new Collectible(collectible);
  
  // Start animation loop
  window.requestAnimationFrame(draw);
});

// New player joined
socket.on('new-player', (newP) => {
  allPlayers[newP.id] = new Player(newP);
});

// Movement updates from server
socket.on('move-player', ({ id, x, y, score }) => {
  if (playerObj && id === playerObj.id) {
    playerObj.x = x;
    playerObj.y = y;
    playerObj.score = score;
  } else if (allPlayers[id]) {
    allPlayers[id].x = x;
    allPlayers[id].y = y;
    allPlayers[id].score = score;
  }
});

// Collectible updates
socket.on('update-collectible', (newCol) => {
  currentCollectible = new Collectible(newCol);
});

// Player left
socket.on('remove-player', (id) => {
  delete allPlayers[id];
});

// Controls
document.onkeydown = (e) => {
  let dir = null;
  if (e.keyCode === 87 || e.keyCode === 38) dir = 'up';
  if (e.keyCode === 83 || e.keyCode === 40) dir = 'down';
  if (e.keyCode === 65 || e.keyCode === 37) dir = 'left';
  if (e.keyCode === 68 || e.keyCode === 39) dir = 'right';

  if (dir && playerObj) {
    socket.emit('move-player', dir, 5);
  }
};

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw other players
  for (let key in allPlayers) {
    allPlayers[key].draw(context, currentCollectible, [], playerObj);
  }

  // Draw main player
  if (playerObj) {
    playerObj.draw(context, currentCollectible, [], playerObj);
    
    // Determine Rank Text
    // We combine main player and others into one array for calculation
    const playerArray = [playerObj, ...Object.values(allPlayers)];
    const rankText = playerObj.calculateRank(playerArray);
    
    // Note: The HTML file usually doesn't have a specific rank element in the boilerplate 
    // effectively, but the test checks the return value of calculateRank().
    // We can just draw the text on canvas for the user to see:
    context.fillStyle = 'white';
    context.font = '20px sans-serif';
    context.fillText(rankText, 10, 30);
  }

  // Draw Collectible
  if (currentCollectible) currentCollectible.draw(context);

  window.requestAnimationFrame(draw);
}