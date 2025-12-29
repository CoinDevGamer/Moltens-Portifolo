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
     SECTION TITLES — Glow sweep on reveal
     ========================= */
  const titleEls = document.querySelectorAll(".section-title");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (titleEls.length && !prefersReducedMotion) {
    const titleObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("glow-sweep");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );

    titleEls.forEach((title) => titleObserver.observe(title));
  }

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

  /* =========================
     MODEL STAGE — Cursor-following light
     ========================= */
  const modelStage = document.getElementById("model-stage");
  if (modelStage && !prefersReducedMotion) {
    const setStageLight = (x, y) => {
      const clampedX = Math.min(100, Math.max(0, x));
      const clampedY = Math.min(100, Math.max(0, y));
      modelStage.style.setProperty("--light-x", `${clampedX}%`);
      modelStage.style.setProperty("--light-y", `${clampedY}%`);
    };

    setStageLight(50, 35);

    modelStage.addEventListener("mousemove", (e) => {
      const rect = modelStage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setStageLight(x, y);
    });

    modelStage.addEventListener("mouseleave", () => {
      setStageLight(50, 35);
    });
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
  let lastThumbRect = null;

  // Create build cards dynamically
  if (buildsEl) {
    BUILDS.forEach((b, i) => {
      const card = document.createElement("div");
      card.className = "build-card tilt-card";
      card.dataset.depth = "1.1";
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
        if (lightbox) lightbox.classList.add("active");
        const thumb = card.querySelector("img");
        lastThumbRect = thumb ? thumb.getBoundingClientRect() : null;
        showImage(true);
      });

      buildsEl.appendChild(card);
    });
  }

  // Function to display image in lightbox with captions
  function showImage(animateFromThumb = false) {
    if (isSwitching) return; // guard
    if (!lightboxImg) return;
    const build = BUILDS[currentIndex];
    if (!build) return;

    isSwitching = true;

    // fade out image
    lightboxImg.classList.remove("visible");
    lightboxImg.style.transform = "translate(0, 0) scale(1)";
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
      // update captions
      if (captionTitle) captionTitle.textContent = build.title;
      if (captionDesc) captionDesc.textContent = build.description;

      lightboxImg.onload = () => {
        const zoomFromThumb = animateFromThumb && lastThumbRect;
        lightboxImg.classList.add("visible");

        if (zoomFromThumb) {
          const targetRect = lightboxImg.getBoundingClientRect();
          const scaleX = lastThumbRect.width / targetRect.width;
          const scaleY = lastThumbRect.height / targetRect.height;
          const translateX = lastThumbRect.left - targetRect.left;
          const translateY = lastThumbRect.top - targetRect.top;

          lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
          requestAnimationFrame(() => {
            lightboxImg.style.transform = "translate(0, 0) scale(1)";
          });
        }

        const cap = document.getElementById("lightbox-caption");
        if (cap) {
          // retrigger pulse
          cap.classList.remove("pulse");
          // force reflow to restart animation
          void cap.offsetWidth;
          cap.classList.add("pulse");
        }
        // release lock a moment after visible to prevent stacking
        setTimeout(() => { isSwitching = false; }, 500);
      };

      // swap image
      lightboxImg.src = build.img;
      lightboxImg.alt = build.title;
    }, 150);
  }

  // Next / Previous navigation
  if (lightboxRight) {
    lightboxRight.addEventListener("click", () => {
      if (isSwitching) return; // guard
      currentIndex = (currentIndex + 1) % BUILDS.length;
      showImage(false);
    });
  }

  if (lightboxLeft) {
    lightboxLeft.addEventListener("click", () => {
      if (isSwitching) return; // guard
      currentIndex = (currentIndex - 1 + BUILDS.length) % BUILDS.length;
      showImage(false);
    });
  }

  // Close lightbox on background or close button click
  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => {
      lightbox && lightbox.classList.remove("active");
      lastThumbRect = null;
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove("active");
        lastThumbRect = null;
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

  /* =========================
     PRICING — Staggered reveal
     ========================= */
  const pricingCards = document.querySelectorAll(".pricing-big-box");
  if (pricingCards.length) {
    if (prefersReducedMotion) {
      pricingCards.forEach((card) => card.classList.add("in-view"));
    } else {
      const pricingObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
            setTimeout(() => {
              entry.target.style.transitionDelay = "0ms";
            }, 700);
          });
        },
        { threshold: 0.25 }
      );

      pricingCards.forEach((card, idx) => {
        card.style.transitionDelay = `${idx * 140}ms`;
        pricingObserver.observe(card);
      });
    }
  }
});





(function () {
  const cards = document.querySelectorAll(".tilt-card");
  if (!cards.length) return;

  function tiltFor(card, e) {
    const rect = card.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const depth = card.dataset.depth ? parseFloat(card.dataset.depth) : 1;
    const rotateY = (px - 0.5) * 16 * depth;
    const rotateX = (0.5 - py) * 12 * depth;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function reset(card) {
    card.style.transition = "transform 450ms ease";
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  }

  cards.forEach((card) => {
    let rafId = null;
    card.style.transition = "transform 120ms ease-out";

    const onMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => tiltFor(card, e));
    };

    card.addEventListener("mouseenter", () => {
      card.style.transition = "transform 120ms ease-out";
    });
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", () => reset(card));
    card.addEventListener("touchmove", onMove, { passive: true });
    card.addEventListener("touchend", () => reset(card));
  });

  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq.matches) {
    cards.forEach((card) => {
      card.style.transition = "none";
      card.style.transform = "none";
    });
  }
})();

