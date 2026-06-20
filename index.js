/**
 * The K Closet — Main JavaScript
 * Glitter effects, scroll-based animations, navigation, and interactions
 */

// ===== Preloader =====
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.classList.add('hidden');
  }, 1500);
});

// ===== Glitter Canvas =====
(function initGlitter() {
  const canvas = document.getElementById('glitter-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = -1000;
  let mouseY = -1000;
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class GlitterParticle {
    constructor(x, y, isMouseParticle = false) {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      this.isMouseParticle = isMouseParticle;

      if (isMouseParticle) {
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3 - 1;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.015;
      } else {
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = Math.random() * 0.2 + 0.1;
        this.life = 1;
        this.decay = Math.random() * 0.003 + 0.001;
      }

      this.opacity = Math.random() * 0.8 + 0.2;
      this.twinkleSpeed = Math.random() * 0.05 + 0.02;
      this.twinkleOffset = Math.random() * Math.PI * 2;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 4;

      // Gold color palette
      const colors = [
        { r: 201, g: 168, b: 76 },   // Gold
        { r: 232, g: 212, b: 139 },   // Light gold
        { r: 255, g: 255, b: 255 },   // White sparkle
        { r: 212, g: 160, b: 160 },   // Rose
        { r: 200, g: 180, b: 140 },   // Warm gold
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(time) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= this.decay;
      this.rotation += this.rotationSpeed;

      // Twinkle effect
      const twinkle = Math.sin(time * this.twinkleSpeed + this.twinkleOffset);
      this.currentOpacity = this.opacity * this.life * (0.5 + twinkle * 0.5);

      // Wrap around for ambient particles
      if (!this.isMouseParticle) {
        if (this.y > canvas.height + 10) {
          this.y = -10;
          this.x = Math.random() * canvas.width;
          this.life = 1;
        }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
      }
    }

    draw(ctx) {
      if (this.currentOpacity <= 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.currentOpacity);

      // Draw a diamond/sparkle shape
      const s = this.size;
      ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;

      // Sparkle cross
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.5);
      ctx.lineTo(s * 0.3, 0);
      ctx.lineTo(0, s * 1.5);
      ctx.lineTo(-s * 0.3, 0);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-s * 1.5, 0);
      ctx.lineTo(0, s * 0.3);
      ctx.lineTo(s * 1.5, 0);
      ctx.lineTo(0, -s * 0.3);
      ctx.closePath();
      ctx.fill();

      // Center glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2);
      gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(-s * 2, -s * 2, s * 4, s * 4);

      ctx.restore();
    }
  }

  // Create ambient particles
  const ambientCount = Math.min(80, Math.floor(canvas.width * canvas.height / 20000));
  for (let i = 0; i < ambientCount; i++) {
    particles.push(new GlitterParticle());
  }

  // Mouse interaction
  let mouseThrottle = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseThrottle++;
    if (mouseThrottle % 3 === 0 && particles.length < 250) {
      for (let i = 0; i < 2; i++) {
        particles.push(new GlitterParticle(
          mouseX + (Math.random() - 0.5) * 30,
          mouseY + (Math.random() - 0.5) * 30,
          true
        ));
      }
    }
  });

  // Animation loop
  let time = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time++;

    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.update(time);
      p.draw(ctx);
    });

    // Respawn ambient particles
    while (particles.filter(p => !p.isMouseParticle).length < ambientCount) {
      particles.push(new GlitterParticle());
    }

    animationId = requestAnimationFrame(animate);
  }

  animate();
})();

// ===== Cursor Glow =====
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function update() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(update);
  }

  update();

  // Hide on mobile
  if ('ontouchstart' in window) {
    glow.style.display = 'none';
  }
})();

// ===== Navbar Scroll Effect =====
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('navHamburger');

  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }
})();

// ===== Scroll-Based Reveal Animations =====
(function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optionally unobserve after revealing
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
})();

// ===== Parallax Scroll Effect for Hero =====
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg img');
  const heroContent = document.querySelector('.hero-content');

  if (!heroBg || !heroContent) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = document.querySelector('.hero').offsetHeight;

    if (scrollY < heroHeight) {
      const parallaxVal = scrollY * 0.4;
      heroBg.style.transform = `translateY(${parallaxVal}px) scale(1.1)`;
      heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
      heroContent.style.opacity = 1 - scrollY / heroHeight;
    }
  });
})();

// ===== Smooth Scroll for Anchor Links =====
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    });
  });
})();

// ===== Counter Animation for Stats =====
(function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let counted = false;

  function animateCounter(el) {
    const text = el.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;

    const target = parseInt(match[1]);
    const suffix = text.replace(match[1], '');
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * easeOut);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const statsSection = document.querySelector('.story-stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          statNumbers.forEach(el => animateCounter(el));
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
  }
})();

// ===== Product Card Tilt Effect =====
(function initTilt() {
  const cards = document.querySelectorAll('.product-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 30;
      const rotateY = (centerX - x) / 30;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
})();

// ===== Scroll Progress Indicator =====
(function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg, #c9a84c, #e8d48b, #c9a84c);
    z-index: 10001;
    transition: width 0.1s linear;
    width: 0%;
  `;
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  });
})();

// ===== Active Nav Link Highlighting =====
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = '#c9a84c';
      }
    });
  });
})();

// ===== Image Lazy Load with Fade =====
(function initLazyFade() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
    }
  });
})();

// ===== Sparkle effect on product badges =====
(function initBadgeSparkle() {
  const badges = document.querySelectorAll('.product-badge');

  badges.forEach(badge => {
    setInterval(() => {
      badge.style.boxShadow = '0 0 15px rgba(201, 168, 76, 0.6)';
      setTimeout(() => {
        badge.style.boxShadow = 'none';
      }, 500);
    }, 3000 + Math.random() * 2000);
  });
})();

console.log('%c✨ The K Closet — Crafted with love ✨', 'color: #c9a84c; font-size: 16px; font-family: serif;');
