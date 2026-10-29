/**
 * Anupama Singh Portfolio - 3D Interactive WebGL Experiences
 * Includes:
 * 1. Hero 3D Celestial Core & Particle Galaxy with mouse interaction & pulse wave
 * 2. Passions 3D Interactive Sports Arena (Procedural 3D Shuttlecock & Basketball)
 * 3. Graceful Fallback for offline/low-spec devices
 */

(function () {
  'use strict';

  // Theme Color Presets for 3D materials
  const THEME_3D_COLORS = {
    'violet-glow': {
      primary: 0x8b5cf6,
      secondary: 0xec4899,
      tertiary: 0x06b6d4,
      particles: [0x8b5cf6, 0xec4899, 0x06b6d4, 0xffffff],
      ambient: 0x1f143d
    },
    'cyber-neon': {
      primary: 0x00f2fe,
      secondary: 0x4facfe,
      tertiary: 0x10b981,
      particles: [0x00f2fe, 0x4facfe, 0x10b981, 0xffffff],
      ambient: 0x0a1e30
    },
    'sunset-flare': {
      primary: 0xff4d6d,
      secondary: 0xf59e0b,
      tertiary: 0xc084fc,
      particles: [0xff4d6d, 0xf59e0b, 0xc084fc, 0xffffff],
      ambient: 0x2e1122
    },
    'emerald-matrix': {
      primary: 0x10b981,
      secondary: 0x06b6d4,
      tertiary: 0xa7f3d0,
      particles: [0x10b981, 0x06b6d4, 0x34d399, 0xffffff],
      ambient: 0x09241b
    }
  };

  let currentThemeKey = document.body.getAttribute('data-theme') || 'violet-glow';

  /* =========================================================================
     1. HERO 3D SCENE: CELESTIAL CORE & PARTICLE FIELD
     ========================================================================= */
  const Hero3D = {
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    coreGroup: null,
    particleSystem: null,
    particlePositions: null,
    particleOriginals: null,
    currentShape: 'torus',
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    targetRotationX: 0.1,
    targetRotationY: 0.2,
    mouseXNorm: 0,
    mouseYNorm: 0,
    pulseTime: 0,
    isPulsing: false,
    clock: null,
    animFrameId: null,

    init() {
      this.canvas = document.getElementById('hero-3d-canvas');
      if (!this.canvas) return;

      // Check if Three.js is loaded
      if (typeof THREE === 'undefined') {
        console.warn('Three.js CDN not available, initializing Canvas2D fallback for Hero.');
        this.initFallback();
        return;
      }

      const container = this.canvas.parentElement;
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 520;

      // Scene
      this.scene = new THREE.Scene();

      // Camera
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.camera.position.z = 18;

      // Renderer
      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
      } catch (e) {
        console.warn('WebGL initialization failed, falling back to 2D canvas', e);
        this.initFallback();
        return;
      }

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.clock = new THREE.Clock();

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      this.scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(THEME_3D_COLORS[currentThemeKey].primary, 2.2);
      dirLight1.position.set(10, 15, 10);
      this.scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(THEME_3D_COLORS[currentThemeKey].secondary, 1.8);
      dirLight2.position.set(-10, -10, -10);
      this.scene.add(dirLight2);

      const pointLight = new THREE.PointLight(THEME_3D_COLORS[currentThemeKey].tertiary, 2.5, 30);
      pointLight.position.set(0, 0, 8);
      this.scene.add(pointLight);

      // Create Group for the main centerpiece
      this.coreGroup = new THREE.Group();
      this.scene.add(this.coreGroup);

      // Build initial 3D Core
      this.buildCore(this.currentShape);

      // Build Ambient Particle Constellation
      this.buildParticleField();

      // Event Listeners
      this.attachEvents();

      // Start Animation Loop
      this.animate();
    },

    buildCore(shapeType) {
      // Clear previous core children
      while (this.coreGroup.children.length > 0) {
        const obj = this.coreGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
        this.coreGroup.remove(obj);
      }

      const colors = THEME_3D_COLORS[currentThemeKey] || THEME_3D_COLORS['violet-glow'];

      if (shapeType === 'torus') {
        // Torus Knot with Inner Hologram
        const geomOuter = new THREE.TorusKnotGeometry(3.6, 1.05, 128, 32, 2, 3);
        const matOuter = new THREE.MeshStandardMaterial({
          color: colors.primary,
          wireframe: true,
          roughness: 0.2,
          metalness: 0.9,
          emissive: colors.primary,
          emissiveIntensity: 0.25
        });
        const meshOuter = new THREE.Mesh(geomOuter, matOuter);
        this.coreGroup.add(meshOuter);

        // Inner glowing sphere
        const geomInner = new THREE.SphereGeometry(1.6, 32, 32);
        const matInner = new THREE.MeshStandardMaterial({
          color: colors.secondary,
          roughness: 0.1,
          metalness: 0.8,
          emissive: colors.secondary,
          emissiveIntensity: 0.45
        });
        const meshInner = new THREE.Mesh(geomInner, matInner);
        this.coreGroup.add(meshInner);

        // Orbiting rings
        const ringGeom = new THREE.RingGeometry(5.2, 5.35, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colors.tertiary,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 3;
        this.coreGroup.add(ring);

      } else if (shapeType === 'icosahedron') {
        // Multi-layered AI Crystal
        const geom1 = new THREE.IcosahedronGeometry(4.2, 1);
        const mat1 = new THREE.MeshStandardMaterial({
          color: colors.primary,
          wireframe: true,
          roughness: 0.1,
          metalness: 0.9
        });
        const mesh1 = new THREE.Mesh(geom1, mat1);
        this.coreGroup.add(mesh1);

        const geom2 = new THREE.IcosahedronGeometry(2.8, 0);
        const mat2 = new THREE.MeshStandardMaterial({
          color: colors.secondary,
          flatShading: true,
          roughness: 0.3,
          metalness: 0.7,
          emissive: colors.secondary,
          emissiveIntensity: 0.3
        });
        const mesh2 = new THREE.Mesh(geom2, mat2);
        this.coreGroup.add(mesh2);

        // Outer Octahedron halo
        const geom3 = new THREE.OctahedronGeometry(5.5, 0);
        const mat3 = new THREE.MeshBasicMaterial({
          color: colors.tertiary,
          wireframe: true,
          transparent: true,
          opacity: 0.35
        });
        const mesh3 = new THREE.Mesh(geom3, mat3);
        this.coreGroup.add(mesh3);

      } else if (shapeType === 'galaxy') {
        // Nebula Rings Sphere
        const geomCenter = new THREE.SphereGeometry(2.2, 32, 32);
        const matCenter = new THREE.MeshStandardMaterial({
          color: colors.tertiary,
          roughness: 0.2,
          metalness: 0.9,
          emissive: colors.tertiary,
          emissiveIntensity: 0.5
        });
        this.coreGroup.add(new THREE.Mesh(geomCenter, matCenter));

        // 3 Orthogonal Orbit Rings
        for (let i = 0; i < 3; i++) {
          const ringGeom = new THREE.TorusGeometry(4.2 + i * 0.8, 0.08, 16, 100);
          const ringMat = new THREE.MeshStandardMaterial({
            color: [colors.primary, colors.secondary, colors.tertiary][i],
            emissive: [colors.primary, colors.secondary, colors.tertiary][i],
            emissiveIntensity: 0.5
          });
          const ringMesh = new THREE.Mesh(ringGeom, ringMat);
          ringMesh.rotation.set((i * Math.PI) / 3, (i * Math.PI) / 4, (i * Math.PI) / 2);
          this.coreGroup.add(ringMesh);
        }
      }
    },

    buildParticleField() {
      const particleCount = 1200;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const originalPositions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const colorPalette = THEME_3D_COLORS[currentThemeKey].particles;
      const threeColors = colorPalette.map(c => new THREE.Color(c));

      for (let i = 0; i < particleCount; i++) {
        // Distribute in a spherical cloud around center
        const radius = 6 + Math.random() * 18;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        originalPositions[i * 3] = x;
        originalPositions[i * 3 + 1] = y;
        originalPositions[i * 3 + 2] = z;

        const c = threeColors[Math.floor(Math.random() * threeColors.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Circular particle texture generator
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 32;
      pCanvas.height = 32;
      const pCtx = pCanvas.getContext('2d');
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);

      const pTexture = new THREE.CanvasTexture(pCanvas);

      const material = new THREE.PointsMaterial({
        size: 0.35,
        map: pTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.particlePositions = positions;
      this.particleOriginals = originalPositions;
      this.particleSystem = new THREE.Points(geometry, material);
      this.scene.add(this.particleSystem);
    },

    triggerPulse() {
      this.isPulsing = true;
      this.pulseTime = 0;
      if (window.PortfolioAudio) {
        window.PortfolioAudio.playTone(520, 'sine', 0.25);
      }
    },

    attachEvents() {
      const container = this.canvas.parentElement;

      // Mouse drag to rotate 3D object
      const onMouseDown = (e) => {
        this.isDragging = true;
        this.prevMouseX = e.clientX || (e.touches && e.touches[0].clientX);
        this.prevMouseY = e.clientY || (e.touches && e.touches[0].clientY);
      };

      const onMouseMove = (e) => {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        if (this.isDragging && clientX && clientY) {
          const deltaX = clientX - this.prevMouseX;
          const deltaY = clientY - this.prevMouseY;

          this.targetRotationY += deltaX * 0.008;
          this.targetRotationX += deltaY * 0.008;

          this.prevMouseX = clientX;
          this.prevMouseY = clientY;
        }

        // Mouse Parallax normalization
        const rect = container.getBoundingClientRect();
        this.mouseXNorm = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouseYNorm = -(((clientY - rect.top) / rect.height) * 2 - 1);
      };

      const onMouseUp = () => {
        this.isDragging = false;
      };

      this.canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      this.canvas.addEventListener('touchstart', onMouseDown, { passive: true });
      window.addEventListener('touchmove', onMouseMove, { passive: true });
      window.addEventListener('touchend', onMouseUp);

      // Shape switcher buttons
      const chips = document.querySelectorAll('.scene-chip[data-shape]');
      chips.forEach((chip) => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const shape = chip.getAttribute('data-shape');
          this.currentShape = shape;
          this.buildCore(shape);
          if (window.PortfolioAudio) window.PortfolioAudio.playTone(440, 'triangle', 0.15);
        });
      });

      // Pulse Button
      const pulseBtn = document.getElementById('pulse-btn');
      if (pulseBtn) {
        pulseBtn.addEventListener('click', () => this.triggerPulse());
      }

      // Reset Camera Button
      const resetBtn = document.getElementById('reset-cam-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.targetRotationX = 0.1;
          this.targetRotationY = 0.2;
          this.camera.position.set(0, 0, 18);
          this.camera.lookAt(0, 0, 0);
          this.triggerPulse();
        });
      }

      // Window Resize
      window.addEventListener('resize', () => {
        if (!this.renderer || !this.camera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      });
    },

    updateTheme(newThemeKey) {
      currentThemeKey = newThemeKey;
      if (!this.scene) return;
      this.buildCore(this.currentShape);

      // Update particle colors
      if (this.particleSystem && this.particleSystem.geometry) {
        const colorPalette = THEME_3D_COLORS[newThemeKey].particles;
        const threeColors = colorPalette.map(c => new THREE.Color(c));
        const colorAttr = this.particleSystem.geometry.attributes.color;
        const count = colorAttr.count;

        for (let i = 0; i < count; i++) {
          const c = threeColors[Math.floor(Math.random() * threeColors.length)];
          colorAttr.setXYZ(i, c.r, c.g, c.b);
        }
        colorAttr.needsUpdate = true;
      }
    },

    animate() {
      this.animFrameId = requestAnimationFrame(() => this.animate());

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Smooth damping rotation of core
      if (this.coreGroup) {
        if (!this.isDragging) {
          this.targetRotationY += 0.005;
          this.targetRotationX += 0.002;
        }

        this.coreGroup.rotation.y += (this.targetRotationY - this.coreGroup.rotation.y) * 0.1;
        this.coreGroup.rotation.x += (this.targetRotationX - this.coreGroup.rotation.x) * 0.1;

        // Gentle floating bounce
        this.coreGroup.position.y = Math.sin(elapsed * 1.5) * 0.35;
      }

      // Camera parallax response to mouse
      if (this.camera) {
        this.camera.position.x += ((this.mouseXNorm || 0) * 2 - this.camera.position.x) * 0.05;
        this.camera.position.y += ((this.mouseYNorm || 0) * 2 - this.camera.position.y) * 0.05;
        this.camera.lookAt(0, 0, 0);
      }

      // Particle system gentle rotation & pulse animation
      if (this.particleSystem && this.particlePositions && this.particleOriginals) {
        this.particleSystem.rotation.y -= 0.0015;
        this.particleSystem.rotation.x -= 0.0008;

        if (this.isPulsing) {
          this.pulseTime += delta * 2.8;
          const posAttr = this.particleSystem.geometry.attributes.position;
          const waveRadius = this.pulseTime * 14;
          const count = posAttr.count;

          for (let i = 0; i < count; i++) {
            const ox = this.particleOriginals[i * 3];
            const oy = this.particleOriginals[i * 3 + 1];
            const oz = this.particleOriginals[i * 3 + 2];
            const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);

            const diff = Math.abs(dist - waveRadius);
            if (diff < 3.5) {
              const displacement = Math.sin((1 - diff / 3.5) * Math.PI) * 2.5;
              const scale = 1 + displacement / dist;
              posAttr.setXYZ(i, ox * scale, oy * scale, oz * scale);
            } else {
              posAttr.setXYZ(i, ox, oy, oz);
            }
          }
          posAttr.needsUpdate = true;

          if (this.pulseTime > 2.2) {
            this.isPulsing = false;
          }
        }
      }

      this.renderer.render(this.scene, this.camera);
    },

    initFallback() {
      // 2D Canvas graceful fallback if WebGL fails
      const ctx = this.canvas.getContext('2d');
      const w = (this.canvas.width = this.canvas.parentElement.clientWidth);
      const h = (this.canvas.height = this.canvas.parentElement.clientHeight);

      let angle = 0;
      const points = [];
      for (let i = 0; i < 90; i++) {
        points.push({
          x: (Math.random() - 0.5) * w * 0.8,
          y: (Math.random() - 0.5) * h * 0.8,
          z: Math.random() * 400 + 50,
          size: Math.random() * 3 + 1
        });
      }

      const drawFallback = () => {
        ctx.clearRect(0, 0, w, h);
        angle += 0.015;

        const cx = w / 2;
        const cy = h / 2;

        // Draw geometric rotating 3D illusion ring
        ctx.save();
        ctx.translate(cx, cy);
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.ellipse(0, 0, 160, 70, angle + (i * Math.PI) / 6, 0, Math.PI * 2);
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(139, 92, 246, 0.45)' : 'rgba(6, 182, 212, 0.45)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();

        // Draw star particles
        points.forEach(p => {
          const px = cx + p.x;
          const py = cy + p.y;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(236, 72, 153, 0.7)';
          ctx.fill();
        });

        requestAnimationFrame(drawFallback);
      };

      drawFallback();
    }
  };

  /* =========================================================================
     2. PASSIONS 3D SCENE: PROCEDURAL SHUTTLECOCK & BASKETBALL ARENA
     ========================================================================= */
  const Sports3D = {
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    modelGroup: null,
    currentSport: 'badminton',
    autoSpin: true,
    isWireframe: false,
    isDragging: false,
    prevX: 0,
    prevY: 0,
    rotX: 0.3,
    rotY: 0.4,

    init() {
      this.canvas = document.getElementById('sports-3d-canvas');
      if (!this.canvas) return;

      if (typeof THREE === 'undefined') {
        this.initFallback();
        return;
      }

      const container = this.canvas.parentElement;
      const width = container.clientWidth || 450;
      const height = container.clientHeight || 420;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 1, 9);

      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true
        });
      } catch (e) {
        this.initFallback();
        return;
      }

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Studio Lights for sports model
      const ambient = new THREE.AmbientLight(0xffffff, 0.9);
      this.scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2);
      keyLight.position.set(5, 8, 5);
      this.scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x8b5cf6, 1.4);
      fillLight.position.set(-6, -4, -4);
      this.scene.add(fillLight);

      const rimLight = new THREE.PointLight(0x06b6d4, 2.5, 20);
      rimLight.position.set(0, 5, -5);
      this.scene.add(rimLight);

      this.modelGroup = new THREE.Group();
      this.scene.add(this.modelGroup);

      // Load initial model (Badminton Shuttlecock)
      this.loadModel('badminton');

      // Attach interactions
      this.attachEvents();

      // Start loop
      this.animate();
    },

    loadModel(sportType) {
      this.currentSport = sportType;

      // Clear previous model
      while (this.modelGroup.children.length > 0) {
        const obj = this.modelGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
        this.modelGroup.remove(obj);
      }

      const hudName = document.getElementById('hud-model-name');

      if (sportType === 'badminton') {
        if (hudName) hudName.textContent = '3D Shuttlecock (Live WebGL)';
        this.createShuttlecock();
      } else {
        if (hudName) hudName.textContent = '3D Basketball Arena (Live WebGL)';
        this.createBasketball();
      }
    },

    createShuttlecock() {
      const group = new THREE.Group();

      // 1. Cork Base (Hemisphere bottom)
      const corkGeom = new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const corkMat = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.35,
        metalness: 0.15,
        wireframe: this.isWireframe
      });
      const cork = new THREE.Mesh(corkGeom, corkMat);
      cork.rotation.x = Math.PI; // Face downward
      cork.position.y = -1.6;
      group.add(cork);

      // Cork Cap band (red/black synthetic ribbon around cork top)
      const bandGeom = new THREE.CylinderGeometry(0.86, 0.86, 0.22, 32);
      const bandMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        roughness: 0.3,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.4,
        wireframe: this.isWireframe
      });
      const band = new THREE.Mesh(bandGeom, bandMat);
      band.position.y = -1.6;
      group.add(band);

      // 2. 16 Feathers in a flared cone
      const featherCount = 16;
      const featherLength = 3.2;

      for (let i = 0; i < featherCount; i++) {
        const angle = (i / featherCount) * Math.PI * 2;
        const featherGeom = new THREE.BoxGeometry(0.38, featherLength, 0.04);
        const featherMat = new THREE.MeshStandardMaterial({
          color: 0xfafafa,
          roughness: 0.4,
          wireframe: this.isWireframe
        });
        const feather = new THREE.Mesh(featherGeom, featherMat);

        // Position and flare outward
        const baseRadius = 0.8;
        const topRadius = 1.9;
        const x = Math.cos(angle) * baseRadius;
        const z = Math.sin(angle) * baseRadius;

        feather.position.set(x, -0.1, z);
        feather.rotation.y = -angle + Math.PI / 2;
        feather.rotation.z = 0.26; // Flare angle
        feather.rotation.x = 0.05; // Overlap twist

        group.add(feather);
      }

      // 3. Thread / String Rings tying feathers together
      const ring1Geom = new THREE.TorusGeometry(1.22, 0.035, 12, 48);
      const ring2Geom = new THREE.TorusGeometry(1.58, 0.035, 12, 48);
      const stringMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.6,
        wireframe: this.isWireframe
      });

      const ring1 = new THREE.Mesh(ring1Geom, stringMat);
      ring1.rotation.x = Math.PI / 2;
      ring1.position.y = -0.4;
      group.add(ring1);

      const ring2 = new THREE.Mesh(ring2Geom, stringMat);
      ring2.rotation.x = Math.PI / 2;
      ring2.position.y = 0.5;
      group.add(ring2);

      // Tilt slightly for attractive hero pose
      group.rotation.x = 0.4;
      group.rotation.z = -0.3;

      this.modelGroup.add(group);
    },

    createBasketball() {
      const group = new THREE.Group();

      // Basketball Sphere
      const ballGeom = new THREE.SphereGeometry(2.1, 48, 48);
      const ballMat = new THREE.MeshStandardMaterial({
        color: 0xe65c00,
        roughness: 0.7,
        metalness: 0.1,
        wireframe: this.isWireframe
      });
      const ball = new THREE.Mesh(ballGeom, ballMat);
      group.add(ball);

      // Ribbed Black Seams
      const seamMat = new THREE.MeshBasicMaterial({
        color: 0x111111,
        wireframe: this.isWireframe
      });

      // Horizontal Equator seam
      const seam1Geom = new THREE.TorusGeometry(2.11, 0.035, 12, 64);
      const seam1 = new THREE.Mesh(seam1Geom, seamMat);
      seam1.rotation.x = Math.PI / 2;
      group.add(seam1);

      // Vertical Meridian seam
      const seam2Geom = new THREE.TorusGeometry(2.11, 0.035, 12, 64);
      const seam2 = new THREE.Mesh(seam2Geom, seamMat);
      group.add(seam2);

      // Perpendicular Meridian seam
      const seam3Geom = new THREE.TorusGeometry(2.11, 0.035, 12, 64);
      const seam3 = new THREE.Mesh(seam3Geom, seamMat);
      seam3.rotation.y = Math.PI / 2;
      group.add(seam3);

      // Curved signature side ribs
      for (let s = -1; s <= 1; s += 2) {
        const curveGeom = new THREE.TorusGeometry(1.65, 0.03, 12, 48, Math.PI);
        const curveMesh = new THREE.Mesh(curveGeom, seamMat);
        curveMesh.position.x = s * 0.95;
        curveMesh.rotation.y = Math.PI / 2;
        group.add(curveMesh);
      }

      // Outer Glowing Ring / Energy Halo
      const haloGeom = new THREE.RingGeometry(2.6, 2.7, 48);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const halo = new THREE.Mesh(haloGeom, haloMat);
      halo.rotation.x = Math.PI / 3;
      group.add(halo);

      this.modelGroup.add(group);
    },

    attachEvents() {
      // Toggle sport buttons
      const badBtn = document.getElementById('sport-badminton-btn');
      const bballBtn = document.getElementById('sport-basketball-btn');
      const badContent = document.getElementById('sport-badminton-content');
      const bballContent = document.getElementById('sport-basketball-content');

      if (badBtn && bballBtn) {
        badBtn.addEventListener('click', () => {
          badBtn.classList.add('active');
          bballBtn.classList.remove('active');
          if (badContent) badContent.classList.remove('hidden');
          if (bballContent) bballContent.classList.add('hidden');
          this.loadModel('badminton');
          if (window.PortfolioAudio) window.PortfolioAudio.playTone(580, 'triangle', 0.12);
        });

        bballBtn.addEventListener('click', () => {
          bballBtn.classList.add('active');
          badBtn.classList.remove('active');
          if (bballContent) bballContent.classList.remove('hidden');
          if (badContent) badContent.classList.add('hidden');
          this.loadModel('basketball');
          if (window.PortfolioAudio) window.PortfolioAudio.playTone(380, 'triangle', 0.12);
        });
      }

      // HUD Action buttons
      const spinBtn = document.getElementById('spin-sport-btn');
      if (spinBtn) {
        spinBtn.addEventListener('click', () => {
          this.autoSpin = !this.autoSpin;
          spinBtn.style.color = this.autoSpin ? '#8b5cf6' : '#cbd5e1';
        });
      }

      const wireBtn = document.getElementById('wireframe-sport-btn');
      if (wireBtn) {
        wireBtn.addEventListener('click', () => {
          this.isWireframe = !this.isWireframe;
          this.loadModel(this.currentSport);
          wireBtn.style.color = this.isWireframe ? '#06b6d4' : '#cbd5e1';
        });
      }

      // Interactive Drag to Rotate
      const onMouseDown = (e) => {
        this.isDragging = true;
        this.prevX = e.clientX || (e.touches && e.touches[0].clientX);
        this.prevY = e.clientY || (e.touches && e.touches[0].clientY);
      };

      const onMouseMove = (e) => {
        if (!this.isDragging) return;
        const curX = e.clientX || (e.touches && e.touches[0].clientX);
        const curY = e.clientY || (e.touches && e.touches[0].clientY);
        if (!curX || !curY) return;

        const dx = curX - this.prevX;
        const dy = curY - this.prevY;

        this.rotY += dx * 0.01;
        this.rotX += dy * 0.01;

        this.prevX = curX;
        this.prevY = curY;
      };

      const onMouseUp = () => {
        this.isDragging = false;
      };

      this.canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      this.canvas.addEventListener('touchstart', onMouseDown, { passive: true });
      window.addEventListener('touchmove', onMouseMove, { passive: true });
      window.addEventListener('touchend', onMouseUp);

      // Resize
      window.addEventListener('resize', () => {
        if (!this.renderer || !this.camera) return;
        const container = this.canvas.parentElement;
        const w = container.clientWidth;
        const h = container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      });
    },

    animate() {
      requestAnimationFrame(() => this.animate());

      if (this.modelGroup) {
        if (this.autoSpin && !this.isDragging) {
          this.rotY += 0.012;
        }

        this.modelGroup.rotation.y += (this.rotY - this.modelGroup.rotation.y) * 0.1;
        this.modelGroup.rotation.x += (this.rotX - this.modelGroup.rotation.x) * 0.1;

        // Subtle floating
        this.modelGroup.position.y = Math.sin(Date.now() * 0.002) * 0.15;
      }

      this.renderer.render(this.scene, this.camera);
    },

    initFallback() {
      const ctx = this.canvas.getContext('2d');
      const w = (this.canvas.width = this.canvas.parentElement.clientWidth);
      const h = (this.canvas.height = this.canvas.parentElement.clientHeight);

      let angle = 0;
      const render = () => {
        ctx.clearRect(0, 0, w, h);
        angle += 0.02;

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.arc(0, 0, 70, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-70, 0);
        ctx.lineTo(70, 0);
        ctx.strokeStyle = '#111';
        ctx.stroke();

        ctx.restore();
        requestAnimationFrame(render);
      };
      render();
    }
  };

  // Expose global controller
  window.Portfolio3D = {
    Hero3D,
    Sports3D,
    setTheme(themeKey) {
      Hero3D.updateTheme(themeKey);
    }
  };

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    Hero3D.init();
    Sports3D.init();
  });
})();

