<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mini Haxball</title>

<style>
body{
    margin:0;
    background:#222;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
}

canvas{
    background:#557a46;
    border:2px solid white;
}
</style>

</head>
<body>

<canvas id="gameCanvas" width="600" height="300"></canvas>

<script>

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

const keys = {};

window.addEventListener("keydown",e=>{
    keys[e.key]=true;
});

window.addEventListener("keyup",e=>{
    keys[e.key]=false;
});

const player = {
    x:120,
    y:H/2,
    r:8,
    vx:0,
    vy:0,
    accel:0.20,
    maxSpeed:3,
    color:"blue"
};

const ball = {
    x:W/2,
    y:H/2,
    r:5,
    vx:0,
    vy:0
};

const playerFriction = 0.93;
const ballFriction = 0.99;

const kickRange = 25;
const kickPower = 6;
const kickCooldown = 250;

let lastKick = 0;

const goalWidth = 8;
const goalHeight = 60;

let leftScore = 0;
let rightScore = 0;

function resetPositions(){

    player.x = 120;
    player.y = H/2;
    player.vx = 0;
    player.vy = 0;

    ball.x = W/2;
    ball.y = H/2;
    ball.vx = 0;
    ball.vy = 0;
}

function updatePlayer(){

    let dx = 0;
    let dy = 0;

    if(keys["w"]) dy--;
    if(keys["s"]) dy++;
    if(keys["a"]) dx--;
    if(keys["d"]) dx++;

    if(dx || dy){

        const len = Math.hypot(dx,dy);

        player.vx += (dx/len) * player.accel;
        player.vy += (dy/len) * player.accel;
    }

    const speed = Math.hypot(player.vx,player.vy);

    if(speed > player.maxSpeed){

        player.vx = player.vx/speed * player.maxSpeed;
        player.vy = player.vy/speed * player.maxSpeed;
    }

    player.vx *= playerFriction;
    player.vy *= playerFriction;

    player.x += player.vx;
    player.y += player.vy;

    player.x = Math.max(player.r,Math.min(W-player.r,player.x));
    player.y = Math.max(player.r,Math.min(H-player.r,player.y));
}

function playerBallCollision(){

    const dx = ball.x-player.x;
    const dy = ball.y-player.y;

    const dist = Math.hypot(dx,dy);

    const minDist = player.r + ball.r;

    if(dist < minDist && dist > 0){

        const nx = dx/dist;
        const ny = dy/dist;

        const overlap = minDist-dist;

        ball.x += nx*overlap;
        ball.y += ny*overlap;

        ball.vx += player.vx*0.8;
        ball.vy += player.vy*0.8;
    }
}

function handleKick(){

    const dx = ball.x-player.x;
    const dy = ball.y-player.y;

    const dist = Math.hypot(dx,dy);

    const now = performance.now();

    if(
        keys["Shift"] &&
        dist < kickRange &&
        now-lastKick > kickCooldown
    ){

        ball.vx += (dx/dist)*kickPower;
        ball.vy += (dy/dist)*kickPower;

        lastKick = now;
    }
}

function updateBall(){

    ball.x += ball.vx;
    ball.y += ball.vy;

    ball.vx *= ballFriction;
    ball.vy *= ballFriction;

    if(ball.y-ball.r < 0){

        ball.y = ball.r;
        ball.vy *= -0.85;
    }

    if(ball.y+ball.r > H){

        ball.y = H-ball.r;
        ball.vy *= -0.85;
    }

    const goalTop = H/2-goalHeight/2;
    const goalBottom = H/2+goalHeight/2;

    if(ball.x-ball.r < 0){

        if(ball.y > goalTop && ball.y < goalBottom){

            rightScore++;
            resetPositions();
        }
        else{

            ball.x = ball.r;
            ball.vx *= -0.85;
        }
    }

    if(ball.x+ball.r > W){

        if(ball.y > goalTop && ball.y < goalBottom){

            leftScore++;
            resetPositions();
        }
        else{

            ball.x = W-ball.r;
            ball.vx *= -0.85;
        }
    }
}

function drawField(){

    ctx.fillStyle="#557a46";
    ctx.fillRect(0,0,W,H);

    ctx.strokeStyle="rgba(255,255,255,0.5)";
    ctx.lineWidth=2;

    ctx.beginPath();
    ctx.moveTo(W/2,0);
    ctx.lineTo(W/2,H);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(W/2,H/2,25,0,Math.PI*2);
    ctx.stroke();

    ctx.fillStyle="#ff4d4d";
    ctx.fillRect(
        0,
        H/2-goalHeight/2,
        goalWidth,
        goalHeight
    );

    ctx.fillStyle="#4da6ff";
    ctx.fillRect(
        W-goalWidth,
        H/2-goalHeight/2,
        goalWidth,
        goalHeight
    );
}

function draw(){

    ctx.clearRect(0,0,W,H);

    drawField();

    ctx.beginPath();
    ctx.arc(
        ball.x,
        ball.y,
        ball.r,
        0,
        Math.PI*2
    );
    ctx.fillStyle="white";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
        player.x,
        player.y,
        player.r,
        0,
        Math.PI*2
    );
    ctx.fillStyle="blue";
    ctx.fill();

    ctx.fillStyle="white";
    ctx.font="18px Arial";

    ctx.fillText(
        leftScore+" - "+rightScore,
        W/2-20,
        25
    );

    if(
        Math.hypot(
            ball.x-player.x,
            ball.y-player.y
        ) < kickRange
    ){
        ctx.font="12px Arial";
        ctx.fillText(
            "SHIFT = KICK",
            10,
            H-10
        );
    }
}

function gameLoop(){

    updatePlayer();

    playerBallCollision();

    handleKick();

    updateBall();

    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();

</script>

</body>
</html>
