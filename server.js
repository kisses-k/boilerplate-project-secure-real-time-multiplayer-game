require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const socket = require('socket.io');
const helmet = require('helmet');
//const nocache = require('nocache');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
const server = require('http').createServer(app);
const io = socket(server);

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- SECURITY HEADERS (Helmet v3.21.3) ---
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

// Content Security Policy to allow client-side scripts
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://code.jquery.com/jquery-3.5.1.min.js"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "*"]
  }
}));

// Index page (static HTML)
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// For FCC testing purposes
fccTestingRoutes(app);

// --- GAME LOGIC ---
let players = {};
let collectible = {
  x: Math.floor(Math.random() * 600),
  y: Math.floor(Math.random() * 400),
  value: 1,
  id: Date.now()
};

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

io.on('connection', (socket) => {
  console.log('User connected: ' + socket.id);

  players[socket.id] = {
    x: Math.floor(Math.random() * 500),
    y: Math.floor(Math.random() * 300),
    score: 0,
    id: socket.id
  };

  // Send init data to the connecting player
  socket.emit('init', { id: socket.id, players, collectible });
  
  // Tell everyone else a new player joined
  socket.broadcast.emit('new-player', players[socket.id]);

  socket.on('move-player', (dir, speed) => {
    const player = players[socket.id];
    if (player) {
      if (dir === 'left') player.x -= speed;
      if (dir === 'right') player.x += speed;
      if (dir === 'up') player.y -= speed;
      if (dir === 'down') player.y += speed;

      // Boundaries
      if (player.x < 0) player.x = 0;
      if (player.y < 0) player.y = 0;
      if (player.x > CANVAS_WIDTH - 30) player.x = CANVAS_WIDTH - 30;
      if (player.y > CANVAS_HEIGHT - 30) player.y = CANVAS_HEIGHT - 30;

      // Collision Check
      const playerSize = 30;
      const itemSize = 15;
      
      if (
        player.x < collectible.x + itemSize &&
        player.x + playerSize > collectible.x &&
        player.y < collectible.y + itemSize &&
        player.y + playerSize > collectible.y
      ) {
        player.score += collectible.value;
        collectible.x = Math.floor(Math.random() * (CANVAS_WIDTH - 20));
        collectible.y = Math.floor(Math.random() * (CANVAS_HEIGHT - 20));
        collectible.id = Date.now();
        io.emit('update-collectible', collectible);
      }

      io.emit('move-player', { id: socket.id, x: player.x, y: player.y, score: player.score });
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('remove-player', socket.id);
  });
});

// 404 handler
app.use(function(req, res, next) {
  res.status(404).type('text').send('Not Found');
});

const port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log(`Listening on port ${port}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:', e);
      }
    }, 1500);
  }
});

module.exports = app;