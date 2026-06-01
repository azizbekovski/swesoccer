from pathlib import Path

html = r"""<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8">
<title>Mini Haxball Clean</title>
<style>
body{margin:0;background:#222;display:flex;justify-content:center;align-items:center;height:100vh}
canvas{background:#557a46;border:2px solid #fff}
</style>
</head>
<body>
<canvas id="game" width="800" height="450"></canvas>
<script>
const c=document.getElementById("game"),x=c.getContext("2d");
const W=c.width,H=c.height;
const k={};
addEventListener("keydown",e=>k[e.key]=true);
addEventListener("keyup",e=>k[e.key]=false);

const p={x:150,y:H/2,r:14,vx:0,vy:0};
const b={x:W/2,y:H/2,r:9,vx:0,vy:0};
let l=0,r=0,lastKick=0;

function reset(){
 p.x=150;p.y=H/2;p.vx=p.vy=0;
 b.x=W/2;b.y=H/2;b.vx=b.vy=0;
}

function update(){
 let dx=0,dy=0;
 if(k.w)dy--; if(k.s)dy++;
 if(k.a)dx--; if(k.d)dx++;
 if(dx||dy){
   let m=Math.hypot(dx,dy);
   p.vx+=(dx/m)*0.3;
   p.vy+=(dy/m)*0.3;
 }
 p.vx*=0.92; p.vy*=0.92;
 let sp=Math.hypot(p.vx,p.vy);
 if(sp>4){p.vx=p.vx/sp*4;p.vy=p.vy/sp*4;}
 p.x+=p.vx; p.y+=p.vy;

 p.x=Math.max(p.r,Math.min(W-p.r,p.x));
 p.y=Math.max(p.r,Math.min(H-p.r,p.y));

 let ddx=b.x-p.x, ddy=b.y-p.y;
 let dist=Math.hypot(ddx,ddy);
 let min=p.r+b.r;

 if(dist<min && dist>0){
   let nx=ddx/dist, ny=ddy/dist;
   b.x+=nx*(min-dist);
   b.y+=ny*(min-dist);
   b.vx+=p.vx*0.8;
   b.vy+=p.vy*0.8;
 }

 if(k.Shift && performance.now()-lastKick>250 && dist<45){
   let nx=ddx/(dist||1), ny=ddy/(dist||1);
   b.vx+=nx*8;
   b.vy+=ny*8;
   lastKick=performance.now();
 }

 b.x+=b.vx; b.y+=b.vy;
 b.vx*=0.99; b.vy*=0.99;

 if(b.y<b.r||b.y>H-b.r) b.vy*=-0.85;

 const gy1=H/2-60, gy2=H/2+60;

 if(b.x<b.r){
   if(b.y>gy1&&b.y<gy2){r++;reset();}
   else {b.x=b.r;b.vx*=-0.85;}
 }
 if(b.x>W-b.r){
   if(b.y>gy1&&b.y<gy2){l++;reset();}
   else {b.x=W-b.r;b.vx*=-0.85;}
 }
}

function draw(){
 x.clearRect(0,0,W,H);

 x.strokeStyle="#fff";
 x.beginPath();x.moveTo(W/2,0);x.lineTo(W/2,H);x.stroke();
 x.beginPath();x.arc(W/2,H/2,45,0,Math.PI*2);x.stroke();

 x.fillStyle="red";x.fillRect(0,H/2-60,12,120);
 x.fillStyle="dodgerblue";x.fillRect(W-12,H/2-60,12,120);

 x.fillStyle="white";
 x.beginPath();x.arc(b.x,b.y,b.r,0,Math.PI*2);x.fill();

 x.fillStyle="blue";
 x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill();

 x.fillStyle="white";
 x.font="26px Arial";
 x.fillText(l+" - "+r,W/2-25,35);
}

(function loop(){update();draw();requestAnimationFrame(loop)})();
</script>
</body></html>
"""

path="/mnt/data/mini_haxball_clean.html"
Path(path).write_text(html, encoding="utf-8")
print(path)
