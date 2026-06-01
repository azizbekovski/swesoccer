// Haxball-like demo script for canvas#gameCanvas
// Controls: WASD / arrows to move, mouse to aim, Shift to kick

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

const keys = {};
let mouse = { x: W/2, y: H/2 };
let shiftHeld = false;

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === 'Shift') shiftHeld = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  if (e.key === 'Shift') shiftHeld = false;
});
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// Entities
const player = {
  x: 200,
  y: 200,
  r: 15,
  vx: 0,
  vy: 0,
  maxSpeed: 3.5,
  accel: 0.25,
  color: 'blue'
};

const ball = {
  x: 400,
  y: 200,
  r: 10,
  vx: 0,
  vy: 0,
  color: 'white'
};

const ballFriction = 0.985;
const playerFriction = 0.90;
const kickRange = 40;
const kickPower = 9.5;

function resetPositions() {
  player.x = 200; player.y = 200; player.vx = 0; player.vy = 0;
  ball.x = canvas.width / 2; ball.y = canvas.height / 2; ball.vx = 0; ball.vy = 0;
}

function updatePlayer() {
  let dx = 0, dy = 0;
  if (keys['w'] || keys['ArrowUp']) dy -= 1;
  if (keys['s'] || keys['ArrowDown']) dy += 1;
  if (keys['a'] || keys['ArrowLeft']) dx -= 1;
  if (keys['d'] || keys['ArrowRight']) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const mag = Math.hypot(dx, dy);
    player.vx += (dx / mag) * player.accel;
    player.vy += (dy / mag) * player.accel;
  }

  // clamp speed
  const sp = Math.hypot(player.vx, player.vy);
  if (sp > player.maxSpeed) {
    player.vx = (player.vx / sp) * player.maxSpeed;
    player.vy = (player.vy / sp) * player.maxSpeed;
  }

  player.vx *= playerFriction;
  player.vy *= playerFriction;
  player.x += player.vx;
  player.y += player.vy;

  // bounds
  player.x = Math.max(player.r, Math.min(W - player.r, player.x));
  player.y = Math.max(player.r, Math.min(H - player.r, player.y));
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // walls
  if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = -ball.vx * 0.8; }
  if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -ball.vx * 0.8; }
  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = -ball.vy * 0.8; }
  if (ball.y + ball.r > H) { ball.y = H - ball.r; ball.vy = -ball.vy * 0.8; }

  ball.vx *= ballFriction;
  ball.vy *= ballFriction;
  if (Math.abs(ball.vx) < 0.01) ball.vx = 0;
  if (Math.abs(ball.vy) < 0.01) ball.vy = 0;
}

function playerBallCollision() {
  const pdx = ball.x - player.x;
  const pdy = ball.y - player.y;
  const dist = Math.hypot(pdx, pdy);
  const minDist = ball.r + player.r;
  if (dist < minDist && dist > 0) {
    const overlap = minDist - dist;
    const nx = pdx / dist, ny = pdy / dist;
    // separate
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    // simple impulse from player movement
    ball.vx += player.vx * 0.6;
    ball.vy += player.vy * 0.6;
  }
}

let kickConsumed = false; // prevents holding shift to continuously kick

function handleKick() {
  const toBallX = ball.x - player.x;
  const toBallY = ball.y - player.y;
  const toBallDist = Math.hypot(toBallX, toBallY);

  if ((keys['Shift'] || shiftHeld) && !kickConsumed && toBallDist <= kickRange) {
    // aim direction is from player toward mouse
    const aimDx = mouse.x - player.x;
    const aimDy = mouse.y - player.y;
    const aimMag = Math.hypot(aimDx, aimDy) || 1;
    const dirX = aimDx / aimMag;
    const dirY = aimDy / aimMag;

    ball.vx += dirX * kickPower;
    ball.vy += dirY * kickPower;
    // small recoil
    player.x -= dirX * 4;
    player.y -= dirY * 4;

    kickConsumed = true;
  }

  if (!keys['Shift'] && !shiftHeld) kickConsumed = false;
}

function update() {
  updatePlayer();
  playerBallCollision();
  handleKick();
  updateBall();
}

function drawField() {
  // grass
  ctx.fillStyle = '#557a46';
  ctx.fillRect(0,0,W,H);
  // midline
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke();
  // center circle
  ctx.beginPath(); ctx.arc(W/2, H/2, 40, 0, Math.PI*2); ctx.stroke();
}

function draw() {
  drawField();

  // ball
  ctx.beginPath(); ctx.fillStyle = ball.color; ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
  // player
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(angle);
  ctx.beginPath(); ctx.fillStyle = player.color; ctx.arc(0,0,player.r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#063'; ctx.fillRect(player.r*0.3, -4, player.r*0.9, 8);
  ctx.restore();

  // aim line
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();

  // HUD distance
  const d = Math.hypot(ball.x - player.x, ball.y - player.y);
  ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.fillText('Avstånd till boll: ' + Math.round(d), 10, H - 10);
  if (d <= kickRange) { ctx.fillStyle = '#ffeb3b'; ctx.fillText('Tryck Shift för att sparka!', 10, H - 28); }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// initialize positions and start
resetPositions();
loop();
