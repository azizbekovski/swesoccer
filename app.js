const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Spelare
const player = {
    x: 200,
    y: 200,
    radius: 15,
    vx: 0,
    vy: 0,
    speed: 0.5,
    friction: 0.95,
    color: 'blue'
};

// Bollen
const ball = {
    x: 400,
    y: 200,
    radius: 10,
    vx: 0,
    vy: 0,
    friction: 0.99,
    color: 'white'
};

// Hämta vilka knappar som trycks ned
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function update() {
    // 1. Spelarens rörelse
    if (keys['ArrowUp'] || keys['w']) player.vy -= player.speed;
    if (keys['ArrowDown'] || keys['s']) player.vy += player.speed;
    if (keys['ArrowLeft'] || keys['a']) player.vx -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.vx += player.speed;

    // Friktion / bromsa in
    player.vx *= player.friction;
    player.vy *= player.friction;

    player.x += player.vx;
    player.y += player.vy;

    // 2. Bollens fysik
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Studsa mot kanterna
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx = -ball.vx * 0.8; // Dämpad studs
    }
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.vy = -ball.vy * 0.8;
    }

    // 3. Kollision mellan spelare och boll (enkel stöt)
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + ball.radius) {
        // Skjut iväg bollen i samma riktning som spelaren åker
        ball.vx = player.vx * 2;
        ball.vy = player.vy * 2;
    }
}

function draw() {
    // Rensa skärmen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rita spelare
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // Rita boll
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
 
