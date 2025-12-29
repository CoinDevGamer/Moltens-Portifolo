const cursorEl = document.getElementById('cursor');
const trailCanvas = document.getElementById('cursorTrail');
const ctxTrail = trailCanvas.getContext('2d');
trailCanvas.width = window.innerWidth;
trailCanvas.height = window.innerHeight;

let mouse = {x:0, y:0};
let cursorPos = {x:0, y:0};
document.addEventListener('mousemove', e=>{ mouse.x=e.clientX; mouse.y=e.clientY; });

// Trail particles
const trailParticles = [];
function animateCursor(){
  cursorPos.x += (mouse.x - cursorPos.x)*0.2;
  cursorPos.y += (mouse.y - cursorPos.y)*0.2;
  cursorEl.style.left = cursorPos.x + 'px';
  cursorEl.style.top = cursorPos.y + 'px';
  
  trailParticles.push({x:cursorPos.x, y:cursorPos.y, alpha:1});
  ctxTrail.clearRect(0,0,trailCanvas.width, trailCanvas.height);
  for(let i=0;i<trailParticles.length;i++){
    let p=trailParticles[i];
    ctxTrail.fillStyle=`rgba(255,200,0,${p.alpha})`;
    ctxTrail.beginPath();
    ctxTrail.arc(p.x,p.y,5,0,Math.PI*2);
    ctxTrail.fill();
    p.alpha-=0.02;
    if(p.alpha<=0) trailParticles.splice(i,1);
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

window.addEventListener('resize',()=>{trailCanvas.width=window.innerWidth; trailCanvas.height=window.innerHeight;});
