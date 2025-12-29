document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     PARTICLES — white dots + polygon lines
     ========================= */
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");

  function fitCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", fitCanvas);
  fitCanvas();

  const COUNT = 90;
  const LINK_DIST = 120;
  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    sx: (Math.random() - 0.5) * 0.9,
    sy: (Math.random() - 0.5) * 0.9,
    r: Math.random() * 2 + 1,
  }));

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.sx;
      p.y += p.sy;
      if (p.x < 0 || p.x > canvas.width) p.sx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.sy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i],
          b = particles[j];
        const dx = a.x - b.x,
          dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(255,255,255,${1 - d / LINK_DIST})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }

  drawParticles();

  /* =========================
     MODELS — Carousel with fade + slide
     ========================= */
  const MODELS = window.MOLTENTIC_MODELS || [];
  const viewer = document.getElementById("active-model");
  const titleEl = document.getElementById("model-title");
  const descEl = document.getElementById("model-description");
  const prevBtn = document.getElementById("prevModel");
  const nextBtn = document.getElementById("nextModel");

  let index = 0;
  let isAnimating = false; // lock

  if (viewer) {
    viewer.style.transition = "transform 0.6s ease, opacity 0.6s ease";
    viewer.style.opacity = "1";
  }

  function setModelNavEnabled(enabled) {
    const method = enabled ? "removeAttribute" : "setAttribute";
    prevBtn && prevBtn[method]("disabled", "true");
    nextBtn && nextBtn[method]("disabled", "true");
  }

  function renderModel(i, direction = 1) {
    if (!MODELS.length || !viewer || isAnimating) return;
    const m = MODELS[i];
    if (!m) return;

    isAnimating = true;
    setModelNavEnabled(false);

    // slide out
    viewer.style.transform = `translateX(${direction * 80}px)`;
    viewer.style.opacity = "0";

    setTimeout(() => {
      // change model
      viewer.setAttribute("src", m.src);
      viewer.setAttribute("alt", m.title);
      viewer.setAttribute("environment-image", "legacy");
      viewer.setAttribute("exposure", "1.3");
      viewer.setAttribute("shadow-intensity", "1");
      viewer.setAttribute("camera-controls", "");
      viewer.setAttribute("auto-rotate", "");

      if (titleEl) titleEl.textContent = m.title;
      if (descEl) descEl.textContent = m.description;

      // slide in
      viewer.style.transform = `translateX(${-direction * 60}px)`;
      setTimeout(() => {
        viewer.style.transform = "translateX(0)";
        viewer.style.opacity = "1";
        setTimeout(() => {
          isAnimating = false;
          setModelNavEnabled(true);
        }, 600);
      }, 50);
    }, 300);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (isAnimating) return; // guard
      index = (index - 1 + MODELS.length) % MODELS.length;
      renderModel(index, -1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (isAnimating) return; // guard
      index = (index + 1) % MODELS.length;
      renderModel(index, 1);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (isAnimating) return; // guard
    if (e.key === "ArrowLeft" && prevBtn) prevBtn.click();
    if (e.key === "ArrowRight" && nextBtn) nextBtn.click();
  });

  renderModel(index);

  /* =========================
     BUILDS — Grid + Lightbox (with caption)
     ========================= */
  const BUILDS = window.MOLTENTIC_BUILDS || [];
  const buildsEl = document.getElementById("builds-carousel");

  // Lightbox elements
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxLeft = document.querySelector(".lightbox-arrow.left");
  const lightboxRight = document.querySelector(".lightbox-arrow.right");
  const captionTitle = document.getElementById("caption-title");
  const captionDesc = document.getElementById("caption-desc");

  let currentIndex = 0;
  let isSwitching = false; // lock

  // Create build cards dynamically
  if (buildsEl) {
    BUILDS.forEach((b, i) => {
      const card = document.createElement("div");
      card.className = "build-card";
      card.innerHTML = `
        <img src="${b.img}" alt="${b.title}">
        <div class="info">
          <h3>${b.title}</h3>
          <p>${b.description}</p>
        </div>
      `;

      // Open lightbox on click
      card.addEventListener("click", () => {
        currentIndex = i;
        showImage();
        if (lightbox) lightbox.classList.add("active");
      });

      buildsEl.appendChild(card);
    });
  }

  // Function to display image in lightbox with captions
  function showImage() {
    if (isSwitching) return; // guard
    if (!lightboxImg) return;
    const build = BUILDS[currentIndex];
    if (!build) return;

    isSwitching = true;

    // fade out image
    lightboxImg.classList.remove("visible");
    if (captionTitle && captionDesc) {
      // reset caption for re-entrance animation
      const cap = document.getElementById("lightbox-caption");
      if (cap) {
        cap.classList.remove("pulse");
        // ensure visibility for first open
        cap.classList.add("visible");
      }
    }

    setTimeout(() => {
      // swap image
      lightboxImg.src = build.img;
      lightboxImg.alt = build.title;

      // update captions
      if (captionTitle) captionTitle.textContent = build.title;
      if (captionDesc) captionDesc.textContent = build.description;

      // fade in image + animate caption
      lightboxImg.onload = () => {
        lightboxImg.classList.add("visible");
        const cap = document.getElementById("lightbox-caption");
        if (cap) {
          // retrigger pulse
          cap.classList.remove("pulse");
          // force reflow to restart animation
          void cap.offsetWidth;
          cap.classList.add("pulse");
        }
        // release lock a moment after visible to prevent stacking
        setTimeout(() => { isSwitching = false; }, 350);
      };
    }, 150);
  }

  // Next / Previous navigation
  if (lightboxRight) {
    lightboxRight.addEventListener("click", () => {
      if (isSwitching) return; // guard
      currentIndex = (currentIndex + 1) % BUILDS.length;
      showImage();
    });
  }

  if (lightboxLeft) {
    lightboxLeft.addEventListener("click", () => {
      if (isSwitching) return; // guard
      currentIndex = (currentIndex - 1 + BUILDS.length) % BUILDS.length;
      showImage();
    });
  }

  // Close lightbox on background or close button click
  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => {
      lightbox && lightbox.classList.remove("active");
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove("active");
      }
    });
  }

  // Keyboard controls for lightbox
  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("active")) return;
    if (isSwitching) return; // guard

    switch (e.key) {
      case "ArrowRight":
      case "Right":
        lightboxRight && lightboxRight.click();
        break;
      case "ArrowLeft":
      case "Left":
        lightboxLeft && lightboxLeft.click();
        break;
      case "Escape":
      case "Esc":
        lightbox.classList.remove("active");
        break;
      default:
        break;
    }
  });
});





(function () {
  const cards = document.querySelectorAll('.holo-card');

  function onMove(e, card) {
    const rect = card.getBoundingClientRect();
    const px = ((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) / rect.width;
    const py = ((e.touches ? e.touches[0].clientY : e.clientY) - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 16 * (card.dataset.depth ? parseFloat(card.dataset.depth) : 1);
    const rotateX = (0.5 - py) * 12 * (card.dataset.depth ? parseFloat(card.dataset.depth) : 1);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    // subtle inner parallax: nudge background sweep
    const sweep = card.querySelector('.holo-card::before');
  }

  function reset(card) {
    card.style.transform = '';
  }

  cards.forEach(card => {
    // mouse move
    card.addEventListener('mousemove', (e) => onMove(e, card));
    card.addEventListener('mouseleave', () => reset(card));
    // touch
    card.addEventListener('touchmove', (e) => { onMove(e, card); }, {passive:true});
    card.addEventListener('touchend', () => reset(card));
    // keyboard accessibility: simulate hover with focus
    card.addEventListener('focus', () => card.classList.add('focused'));
    card.addEventListener('blur', () => card.classList.remove('focused'));
  });

  // reduce motion respect
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    cards.forEach(c => {
      c.style.transition = 'none';
    });
  }
})();
