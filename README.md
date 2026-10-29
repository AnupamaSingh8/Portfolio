# ✨ Anupama Singh - 3D Interactive Portfolio

A modern, high-performance, colorful and professional 3D portfolio website tailored for **Anupama Singh** (B.Tech in CS & AI @ Newton School of Technology - RU Campus).

---

## 🌟 Highlight Features

1. **Vibrant & Colorful Professional Aesthetics**:
   - **4 Live Color Themes**:
     - 🔮 **Violet Glow** (Default: Electric Violet, Deep Indigo, Cyber Pink & Cyan)
     - ⚡ **Cyber Neon** (Neon Teal, Matrix Emerald, Electric Blue)
     - 🌅 **Sunset Flare** (Solar Orange, Coral Pink, Warm Purple)
     - 🌲 **Emerald Matrix** (Mint, Cyber Cyan, Neon Emerald)
   - **Interactive Color Palette Switcher**: Click the floating palette icon in the bottom-right corner to cycle through themes live.
   - **Multi-layered Ambient Aurora**: Fluid animated mesh glow with floating radial orbs and dot-matrix background depth.
   - **Glassmorphic UI**: High-end frosted glass cards with animated border shimmer, high-contrast readable typography, and responsive layouts.

2. **3D Interactive WebGL Experiences (Three.js)**:
   - **Hero 3D Celestial Core**:
     - Central interactive 3D centerpiece featuring 3 switchable models:
       - **Quantum Core**: Morphing wireframe Torus Knot with inner glowing sphere.
       - **AI Crystal**: Multi-faceted geometric crystal with holographic outer shell.
       - **Nebula Sphere**: Multi-axis planetary orbit rings around a core.
     - **Dynamic Particle Constellation**: 1,200+ multi-colored star particles reacting to mouse movement with depth parallax.
     - **Interactive Shockwave Pulse**: Click "Pulse" to blast an energetic 3D wave through the particle nebula.
     - **Full 360° Mouse Orbit**: Click & drag to rotate the 3D model in all dimensions.
   - **Passions 3D Interactive Sports Arena**:
     - Custom 3D procedural models of **Badminton Shuttlecock** and **Basketball**!
     - Switch seamlessly between Badminton and Basketball.
     - Free interactive drag-to-rotate, auto-spin toggle, and wireframe mode toggle.
   - **Interactive 3D Card Tilt**:
     - All portfolio cards feature realistic 3D perspective tilt reacting to mouse position with smooth return damping.

3. **Tailored Content & Storytelling**:
   - **Hero Section**: Dynamic typing effect cycling through roles, quick stat badges (18 y/o, CS & AI @ NST-RU, UP India, Woodland Academy Alum), and quick CTA links.
   - **About Section**: "The Ambivert Advantage" — highlighting the synergy between deep coding focus and high-energy athletic collaboration.
   - **Technical Horizon**: Visual categorized progress bars for Python, AI/ML concepts, Algorithms, Web Technologies, and development workflows.
   - **Academic Journey**: Timeline tracing the journey from foundational schooling at Woodland Academy to current undergraduate studies in Computer Science & Artificial Intelligence at Newton School of Technology (RU Campus).
   - **Beyond Code (Sports & Energy)**: Highlighting Badminton (reflexes, precision) and Basketball (teamwork, spatial IQ).
   - **Featured Projects**: Showcase cards for Python AI prototypes, 3D algorithm visualizers, sports analytics trackers, and this 3D portfolio.
   - **Contact & Connect**: Direct copy-to-clipboard email button, pre-filled interactive email form, and social links.
   - **Web Audio FX**: Subtle sci-fi sound clicks synthesized natively using Web Audio API (toggleable on/off, zero external sound files required).

---

## 🚀 How to Run & View Locally

### Option 1: Direct File Open
You can simply double-click `index.html` or drag it into any web browser (Chrome, Safari, Edge, Firefox, Brave).

### Option 2: Local Python Server (Recommended)
Open Terminal in this folder and run:
```bash
python3 -m http.server 3000
```
Then visit [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🛠 Project Structure

```
portfolio/
├── index.html        # Main HTML5 structure with semantic sections
├── style.css         # Colorful glassmorphic styling, aurora glow, responsive rules
├── three-scene.js    # Three.js 3D WebGL hero core, particle system & sports arena
├── main.js           # Audio synthesizer, theme switcher, typing effect, 3D card tilt
├── myself            # Personal details & notes
└── README.md         # Documentation & guide
```

---

## 🎨 How to Customize

- **Updating Social Links & Email**:
  In [index.html](file:///Users/anupamasingh/portfolio%20-/index.html), search for `anupama.singh@example.com` or `https://github.com` and replace with your actual social links.
- **Adding New Projects**:
  In [index.html](file:///Users/anupamasingh/portfolio%20-/index.html), look for the `<div class="projects-grid">` section and duplicate any project card.
- **Modifying Colors**:
  In [style.css](file:///Users/anupamasingh/portfolio%20-/style.css), customize the CSS variables under `:root` and `body[data-theme="..."]`.

