<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HaxBall Mini - Musstyrning</title>
    <style>
        body {
            margin: 0;
            background-color: #222;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            cursor: crosshair; /* Ändrar muspekaren över skärmen */
        }
        canvas {
            background-color: #557a46; /* Grön rektangel-plan */
            border: 4px solid #fff;
        }
    </style>
</head>
<body>

    <canvas id="gameCanvas" width="800" height="400"></canvas>

<script>
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const friction = 0.98;

// Blå spelare (startar i mitten)
const player = {
    x: 400,
    y: 200,
    radius: 15,
    color: '#00ccff'
};

// Vit boll
const ball = {
    x: 600,
    y: 200,
    vx: 0,
    vy: 0,
    radius: 10,
    color: '#ffffff'
};

// Musens position på canvasen
const mouse = { x: 400, y: 200 };

// Lyssna på musrörelser
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

// Kicka med vänsterklick på musen
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Vänsterklick
        kickBall();
    }
});

// Kicka med Shift-tangenten (om man föredrar det)
window.addEventListener('keydown', (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        kickBall();
    }
});

function kickBall() {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const kickRange = player.radius + ball.radius + 15;

    if (dist < kickRange && dist > 0) {
        const nx = dx / dist;
        const ny = dy / dist;
        // Kraftfull kick
        ball.vx = nx * 15;
        ball.vy = ny * 15;
    }
}

function update() {
    // Spelaren följer musens position direkt
    player.x = mouse.x;
    player.y = mouse.y;

    // Håll spelaren strikt inom planen (väggkollision)
    if (player.x - player.radius < 0) player.x = player.radius;
    if (player.x + player.radius > canvas.width) player.x = canvas.width - player.radius;
    if (player.y - player.radius < 0) player.y = player.radius;
    if (player.y + player.radius > canvas.height) player.y = canvas.height - player.radius;

    // Bollrörelse och friktion
    ball.vx *= friction;
    ball.vy *= friction;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Perfekt väggkollision med elastisk studs för bollen
    if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx = -ball.vx * 0.8; }
    if (ball.x + ball.radius > canvas.width) { ball.x = canvas.width - ball.radius; ball.vx = -ball.vx * 0.8; }
    if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy = -ball.vy * 0.8; }
    if (ball.y + ball.radius > canvas.height) { ball.y = canvas.height - ball.radius; ball.vy = -ball.vy * 0.8; }

    // Fysisk kollision när spelaren rör vid bollen (knuffa bollen)
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = ball.radius + player.radius;

    if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        // Skjut ut bollen så den inte överlappar med spelarens cirkel
        ball.x += nx * overlap;
        ball.y += ny * overlap;

        // Ge bollen en lätt knuff framåt baserat på riktningen
        ball.vx += nx * 0.8;
        ball.vy += ny * 0.8;
    }
}

function draw() {
    // Rensa planen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rita blå spelare
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rita vit boll
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
</script>

</body>
</html>
