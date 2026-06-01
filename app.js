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

// Målens positioner och storlek
const goalWidth = 20;
const goalHeight = 100;
const leftGoal = { x: 0, y: canvas.height / 2 - goalHeight / 2, score: 0 };
const rightGoal = { x: canvas.width - goalWidth, y: canvas.height / 2 - goalHeight / 2, score: 0 };

// Tangentbordshantering
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    player.x = 200;
    player.y = 200;
    player.vx = 0;
    player.vy = 0;
}

function update() {
    // 1. Spelarrörelse
    if (keys['ArrowUp'] || keys['w']) player.vy -= player.speed;
    if (keys['ArrowDown'] || keys['s']) player.vy += player.speed;
    if (keys['ArrowLeft'] || keys['a']) player.vx -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.vx += player.speed;

    player.vx *= player.friction;
    player.vy *= player.friction;
    player.x += player.vx;
    player.y += player.vy;

    // Hindra spelaren från att åka utanför planen
    if (player.x - player.radius < 0) player.x = player.radius;
    if (player.x + player.radius > canvas.width) player.x = canvas.width - player.radius;
    if (player.y - player.radius < 0) player.y = player.radius;
    if (player.y + player.radius > canvas.height) player.y = canvas.height - player.radius;

    // 2. Bollrörelse och friktion
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // 3. Studsa mot väggarna (och kolla om det blir mål)
    // Vänster vägg
    if (ball.x - ball.radius < 0) {
        // Kolla om bollen är i vänster mål
        if (ball.y > leftGoal.y && ball.y < leftGoal.y + goalHeight) {
            rightGoal.score++; // Höger lag får poäng
            resetBall();
        } else {
            ball.x = ball.radius;
            ball.vx = -ball.vx * 0.8; // Studsa tillbaka
        }
    }
    // Höger vägg
    if (ball.x + ball.radius > canvas.width) {
        // Kolla om bollen är i höger mål
        if (ball.y > rightGoal.y && ball.y < rightGoal.y + goalHeight) {
            leftGoal.score++; // Vänster lag får poäng
            resetBall();
        } else {
            ball.x = canvas.width - ball.radius;
            ball.vx = -ball.vx * 0.8; // Studsa tillbaka
        }
    }
    // Övre och nedre vägg
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * 0.8;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy = -ball.vy * 0.8;
    }

    // 4. Kollision och kick-mekanik (Shift)
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + ball.radius + 5) { // +5 ger lite extra räckvidd för kicken
        // Räkna ut vinkeln från spelaren till bollen
        const angle = Math.atan2(dy, dx);
        
        if (keys['Shift']) {
            // HÅRD KICK: Skjut iväg bollen med hög fart i den vinkel spelaren står mot bollen
            const kickPower = 8;
            ball.vx = Math.cos(angle) * kickPower;
            ball.vy = Math.sin(angle) * kickPower;
        } else if (distance < player.radius + ball.radius) {
            // Vanlig knuff: Om man bara går in i bollen
            ball.vx = player.vx * 1.5;
            ball.vy = player.vy * 1.5;
        }
    }
}

function draw() {
    // Rensa planen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rita linjer på fotbollsplanen (Mittenlinje och cirkel)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Rita Vänster Mål (Rött)
    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(leftGoal.x, leftGoal.y, goalWidth, goalHeight);

    // Rita Höger Mål (Blått)
    ctx.fillStyle = '#4da6ff';
    ctx.fillRect(rightGoal.x, rightGoal.y, goalWidth, goalHeight);

    // Rita Spelare
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    // Vit ring runt spelaren om man håller in Shift (laddar kick)
    if (keys['Shift']) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.closePath();

    // Rita Boll
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

    // Rita Resultat (Poäng)
    ctx.fillStyle = 'white';
    ctx.font = '30px sans-serif';
    ctx.fillText(leftGoal.score, canvas.width / 2 - 50, 40);
    ctx.fillText(rightGoal.score, canvas.width / 2 + 30, 40);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
