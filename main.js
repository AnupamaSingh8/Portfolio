/**
 * Anupama Singh Portfolio - Core UI, Interactions & Sound Synthesizer
 */

(function () {
  'use strict';

  /* =========================================================================
     1. WEB AUDIO SYNTHESIZER (Optional Subtle Sci-Fi Audio FX)
     ========================================================================= */
  const AudioFX = {
    ctx: null,
    enabled: true,

    init() {
      const stored = localStorage.getItem('as_portfolio_audio');
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
      this.updateUI();
    },

    getContext() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    },

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('as_portfolio_audio', this.enabled);
      this.updateUI();
      if (this.enabled) {
        this.playTone(660, 'sine', 0.12);
        showToast('Sound Effects Enabled 🔊');
      } else {
        showToast('Sound Effects Muted 🔇');
      }
    },

    updateUI() {
      const icon = document.getElementById('audio-icon');
      const status = document.getElementById('audio-status');
      if (icon) {
        icon.className = this.enabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
      }
      if (status) {
        status.textContent = this.enabled ? 'ON' : 'OFF';
      }
    },

    playTone(freq = 440, type = 'sine', duration = 0.1) {
      if (!this.enabled) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        // Audio error silent fallback
      }
    }
  };

  window.PortfolioAudio = AudioFX;

  /* =========================================================================
     2. COLOR THEME CYCLER
     ========================================================================= */
  const Themes = [
    { key: 'violet-glow', name: 'Violet Glow' },
    { key: 'cyber-neon', name: 'Cyber Neon' },
    { key: 'sunset-flare', name: 'Sunset Flare' },
    { key: 'emerald-matrix', name: 'Emerald Matrix' }
  ];

  let currentThemeIndex = 0;

  function initTheme() {
    const savedTheme = localStorage.getItem('as_portfolio_theme');
    if (savedTheme) {
      const foundIdx = Themes.findIndex(t => t.key === savedTheme);
      if (foundIdx !== -1) currentThemeIndex = foundIdx;
    }
    applyTheme(Themes[currentThemeIndex]);
  }

  function applyTheme(themeObj) {
    document.body.setAttribute('data-theme', themeObj.key);
    const themeNameEl = document.getElementById('theme-name');
    if (themeNameEl) themeNameEl.textContent = themeObj.name;
    localStorage.setItem('as_portfolio_theme', themeObj.key);

    if (window.Portfolio3D && typeof window.Portfolio3D.setTheme === 'function') {
      window.Portfolio3D.setTheme(themeObj.key);
    }
  }

  function cycleTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % Themes.length;
    const nextTheme = Themes[currentThemeIndex];
    applyTheme(nextTheme);
    AudioFX.playTone(720, 'sine', 0.15);
    showToast(`Color Theme: ${nextTheme.name} 🎨`);
  }

  /* =========================================================================
     3. TYPING EFFECT IN HERO
     ========================================================================= */
  const ROLES = [
    'B.Tech in CS & AI Student',
    'Python & Machine Learning Learner',
    'Badminton & Basketball Athlete',
    'Woodland Academy Alum',
    'Curious Ambivert & Problem Solver',
    'Newton School of Technology Scholar'
  ];

  function initTyping() {
    const target = document.getElementById('typed-text');
    if (!target) return;

    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const typeSpeed = 75;
    const deleteSpeed = 40;
    const pauseDelay = 1800;

    function tick() {
      const currentRole = ROLES[roleIdx];

      if (isDeleting) {
        target.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
      } else {
        target.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
      }

      let timeout = isDeleting ? deleteSpeed : typeSpeed;

      if (!isDeleting && charIdx === currentRole.length) {
        timeout = pauseDelay;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % ROLES.length;
        timeout = 400;
      }

      setTimeout(tick, timeout);
    }

    tick();
  }

  /* =========================================================================
     4. 3D CARD TILT EFFECT (Vanilla Smooth Tilt)
     ========================================================================= */
  function init3DTilt() {
    // Check if user prefers reduced motion or is mobile
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth <= 768) {
      return;
    }

    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /* =========================================================================
     5. CUSTOM CURSOR
     ========================================================================= */
  function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const trail = document.getElementById('cursor-trail');
    if (!cursor || !trail || window.innerWidth <= 768) return;

    let mouseX = -100;
    let mouseY = -100;
    let trailX = -100;
    let trailY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function renderTrail() {
      trailX += (mouseX - trailX) * 0.18;
      trailY += (mouseY - trailY) * 0.18;
      trail.style.transform = `translate(${trailX}px, ${trailY}px)`;
      requestAnimationFrame(renderTrail);
    }
    renderTrail();

    // Hover effect on interactable elements
    const hoverables = document.querySelectorAll('a, button, input, textarea, .tilt-card, .scene-chip, .sport-btn');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  /* =========================================================================
     6. NAVBAR & SCROLL SPY
     ========================================================================= */
  function initNavbar() {
    const navMenu = document.getElementById('nav-menu');
    const toggleBtn = document.getElementById('mobile-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Mobile Hamburger Toggle
    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });

      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
        });
      });
    }

    // Scroll Spy for highlighting active nav item
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;

      sections.forEach(sec => {
        const sectionHeight = sec.offsetHeight;
        const sectionTop = sec.offsetTop - 180;
        const sectionId = sec.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    });
  }

  /* =========================================================================
     7. TOAST NOTIFICATIONS & CLIPBOARD HELPER
     ========================================================================= */
  function showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-sparkles"></i><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function initClipboardAndForm() {
    // Copy Email Button
    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const email = 'anupama.singh@example.com';
        navigator.clipboard.writeText(email).then(() => {
          AudioFX.playTone(800, 'sine', 0.15);
          showToast('Email copied to clipboard! 📋');
        }).catch(() => {
          showToast('Email: anupama.singh@example.com');
        });
      });
    }

    // Contact Form submission
    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        const subject = document.getElementById('form-subject').value;
        const message = document.getElementById('form-message').value;

        if (!name || !email || !message) {
          showToast('Please fill out all required fields.');
          return;
        }

        AudioFX.playTone(600, 'triangle', 0.2);

        // Open user's email client with pre-filled content
        const mailtoUrl = `mailto:anupama.singh@example.com?subject=${encodeURIComponent(subject || 'Portfolio Inquiry')}&body=${encodeURIComponent(`Hi Anupama,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        window.location.href = mailtoUrl;

        showToast(`Thanks ${name}! Opening your email client... 🚀`);
        form.reset();
      });
    }
  }

  /* =========================================================================
     8. INITIALIZATION
     ========================================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    AudioFX.init();
    initTheme();
    initTyping();
    init3DTilt();
    initCustomCursor();
    initNavbar();
    initClipboardAndForm();

    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', cycleTheme);
    }

    // Audio toggle button
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => AudioFX.toggle());
    }

    // Subtle click sounds for interactive elements
    document.querySelectorAll('.btn, .nav-link, .scene-chip, .sport-btn, .ctrl-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioFX.playTone(500, 'sine', 0.08);
      });
    });
  });
})();

