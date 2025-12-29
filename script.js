// Particle Background
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particlesArray = [];
const colors = ['#ff4c00','#ff8700','#ffcf00'];

class Particle {
  constructor(){
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = Math.random() * 1 - 0.5;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update(){
    this.x += this.speedX;
    this.y += this.speedY;
    if(this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if(this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw(){
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fill();
  }
}

function init(){
  for(let i = 0; i < 120; i++){ particlesArray.push(new Particle()); }
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particlesArray.forEach(p => { p.update(); p.draw(); });
  connectParticles();
  requestAnimationFrame(animate);
}
function connectParticles(){
  for(let a=0;a<particlesArray.length;a++){
    for(let b=a;b<particlesArray.length;b++){
      let dx=particlesArray[a].x-particlesArray[b].x;
      let dy=particlesArray[a].y-particlesArray[b].y;
      let dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<120){
        ctx.strokeStyle='rgba(255,76,0,'+(1-dist/120)+')';
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(particlesArray[a].x,particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x,particlesArray[b].y);
        ctx.stroke();
      }
    }
  }
}
init();
animate();

// Particles repel from cursor
document.addEventListener('mousemove', e=>{
  particlesArray.forEach(p=>{
    let dx=e.clientX-p.x;
    let dy=e.clientY-p.y;
    let dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<100){
      let angle=Math.atan2(dy,dx);
      p.x-=Math.cos(angle)*2;
      p.y-=Math.sin(angle)*2;
    }
  });
});

// Resize
window.addEventListener('resize',()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Dynamically build model gallery
function loadModels(){
  const gallery = document.getElementById('model-gallery');
  if(!window.MOLTENTIC_MODELS) return;

  window.MOLTENTIC_MODELS.forEach(model => {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.innerHTML = `
      <model-viewer src="${model.src}" alt="${model.title}"
        camera-controls auto-rotate shadow-intensity="${model.shadowIntensity || 1}"
        exposure="${model.exposure || 1}">
      </model-viewer>
      <div class="model-title">${model.title}</div>
    `;
    gallery.appendChild(card);
  });
}
loadModels();
