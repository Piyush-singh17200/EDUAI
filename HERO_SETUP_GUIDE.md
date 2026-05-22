# 🚀 EduAI Platform with 3D Hero Section - Complete Setup Guide

## ✨ What's New

Your EduAI platform now includes:

### 🎨 **Advanced 3D Hero Section**
- ✅ Full-screen dark hero with looping background video
- ✅ Interactive navbar with smooth hover effects
- ✅ Animated headline with gradient text
- ✅ 3D parallax effect based on mouse position
- ✅ Particle system for dynamic visual effects
- ✅ Liquid glass logo marquee with infinite scroll
- ✅ Responsive grid pattern background
- ✅ CSS animations and transforms
- ✅ Smooth fade-in/fade-out video loops

### 🎯 **Key Features Implemented**
1. **Custom Color Variables** (CSS)
   - Background: Deep dark blue-purple (260 87% 3%)
   - Foreground: Off-white (40 6% 95%)
   - Hero subtitle: Lighter gray (40 6% 82%)

2. **Font Integration**
   - Body: Geist Sans (@fontsource/geist-sans)
   - Headlines: General Sans (via Fontshare API)

3. **Video Background**
   - Auto-looping with fade animation
   - requestAnimationFrame for smooth transitions
   - 0.5s fade-in, 0.5s fade-out, 100ms wait before replay

4. **Liquid Glass Effect**
   - Backdrop blur with luminosity blend mode
   - Gradient border effect
   - Inset shadows for depth

5. **3D Effects**
   - Perspective transforms based on mouse position
   - Parallax depth with 3D translation
   - Particle emission system
   - Float animations

6. **Interactive Elements**
   - Navbar with dropdown indicators
   - Hover animations on buttons and logos
   - Mouse-tracking parallax
   - Particle generation on mouse move

---

## 📦 Installation & Setup

### Step 1: Install Dependencies

```bash
cd eduai-platform/client
npm install
```

This will install the new dependency:
- `@fontsource/geist-sans` - For the Geist Sans font

### Step 2: Project Structure

The hero section files are located at:

```text
client/src/
├── pages/
│   ├── Hero3D.jsx          ← Main 3D hero component
│   └── Hero.jsx            ← Alternative simpler version
├── index.css               ← Updated with animations & effects
├── App.jsx                 ← Updated to use Hero3D
└── main.jsx
```

### Step 3: Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

---

## 🎨 Customization Guide

### Change Hero Text

Edit `client/src/pages/Hero3D.jsx`:

```jsx
<h1 className="hero-headline ...">
  Power{' '}
  <span className="bg-gradient-text">
    AI
  </span>
</h1>
```

### Change Colors

Edit `client/src/index.css` CSS variables:

```css
:root {
  --background: 260 87% 3%;      /* Deep dark blue-purple */
  --foreground: 40 6% 95%;       /* Off-white */
  --hero-sub: 40 6% 82%;         /* Subtitle gray */
}
```

Format: `hue saturation lightness`

### Change Video URL

Edit `Hero3D.jsx` video source:

```jsx
<source
  src="YOUR_VIDEO_URL_HERE"
  type="video/mp4"
/>
```

### Customize Logo Brands

Edit the logo array in `Hero3D.jsx`:

```jsx
{['Vortex', 'Nimbus', 'Prysma', 'Cirrus', 'Kynder', 'Halcyn'].map(
  (name, idx) => (
    <LogoItem key={`${name}-1-${idx}`} name={name} />
  )
)}
```

### Adjust 3D Parallax Intensity

In `Hero3D.jsx`, modify the parallax calculation:

```javascript
const parallaxTransform = {
  // Increase the multiplier (8 = strong, 3 = subtle)
  transform: `perspective(1200px) rotateX(${(mousePosition.y - 0.5) * 8}deg) rotateY(${(mousePosition.x - 0.5) * 8}deg) translateZ(50px)`,
};
```

### Modify Particle Settings

In `Particle` class, adjust:

```javascript
this.vx = (Math.random() - 0.5) * 4;      // Horizontal velocity
this.vy = (Math.random() - 0.5) * 4 - 2;  // Vertical velocity
this.decay = Math.random() * 0.02 + 0.01; // Fade speed
this.size = Math.random() * 3 + 2;        // Particle size
```

---

## 🎬 Animation Control

### Video Loop Animation

The video uses a custom `requestAnimationFrame` loop:

```javascript
// 0.5s fade-in
// 0.5s fade-out
// 100ms pause
// Repeat
```

To change the duration, edit:

```javascript
const elapsed = (Date.now() - startTime) % 1000; // 1000ms = 1s total
```

Change `1000` to your desired duration in milliseconds.

### Marquee Animation

Edit in `index.css`:

```css
@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  animation: marquee 20s linear infinite; /* 20s = duration */
}
```

Change `20s` to speed up/slow down the marquee.

---

## 🔧 Advanced Customization

### Adjust Blur Overlay

In `index.css`:

```css
.blur-overlay {
  width: 984px;           /* Adjust size */
  height: 527px;
  filter: blur(82px);     /* Blur amount */
  opacity: 0.9;           /* Opacity */
}
```

### Modify Liquid Glass Effect

In `index.css`:

```css
.liquid-glass {
  backdrop-filter: blur(4px);  /* Change blur strength */
  background: rgba(255, 255, 255, 0.01);  /* Change opacity */
}
```

### Change Button Styles

```css
.btn-hero-primary {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  /* Modify gradient colors */
}

.btn-hero-secondary {
  background: rgba(255, 255, 255, 0.1);
  /* Modify glass appearance */
}
```

---

## 📱 Responsive Breakpoints

The hero section is responsive and includes media queries for:

- **Desktop**: Full featured experience
- **Tablet** (768px): Scaled headline and blur
- **Mobile** (480px): Optimized headline size

All animations work on mobile with optimized performance.

---

## 🌟 Features in Detail

### 1. **Video Background**
- Auto-plays on load
- Loops with fade transitions
- Respects user device video autoplay policies

### 2. **3D Parallax**
- Mouse X/Y position tracked
- Applies perspective transforms
- Smooth 0.1s transition
- No jank or lag on modern browsers

### 3. **Particle System**
- Generated on mouse move (probabilistic)
- Physics-based movement (velocity, gravity)
- Fade-out over time
- Rendered on canvas layer

### 4. **Logo Marquee**
- Infinite scroll using CSS animation
- Duplicated for seamless loop
- Hover effects on individual items
- Liquid glass styling with glow

### 5. **Gradient Text**
- "AI" uses 3-color gradient (indigo → purple → amber)
- Text shadow glow effect
- Float animation
- Responsive sizing

### 6. **Navbar**
- Sticky positioning
- Gradient underline on hover
- Dropdown indicators
- Glass-morphism effect

---

## 🚀 Performance Tips

1. **Video Optimization**
   - Use compressed video format
   - Ensure video is at least 1920x1080p
   - Consider lazy-loading for first load

2. **Particle Optimization**
   - Particles are capped by the canvas rendering
   - Monitor FPS on low-end devices
   - Reduce particle frequency if needed

3. **CSS Animations**
   - GPU-accelerated transforms
   - No layout thrashing
   - Use `will-change` sparingly

4. **Browser Compatibility**
   - Works on all modern browsers
   - Firefox, Chrome, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Troubleshooting

### Video Not Playing
```text
Issue: Video not loading
Solution:
1. Check CORS headers on video URL
2. Ensure video format is supported (MP4)
3. Check browser video autoplay policies
```

### Particles Not Visible
```text
Issue: Particles not showing
Solution:
1. Check canvas ref is properly mounted
2. Verify canvas size matches window
3. Check z-index layering
```

### Parallax Lag
```text
Issue: 3D transforms causing lag
Solution:
1. Reduce parallax intensity
2. Disable on low-end devices
3. Use `transform: translateZ(0)` on parent
```

### Font Not Loading
```text
Issue: Fonts appearing as fallback
Solution:
1. Check @import statements in index.css
2. Verify font URLs are accessible
3. Check browser console for 404 errors
```

---

## 📚 Additional Resources

- **Framer Motion**: For advanced animations
- **Lucide Icons**: Icon library (already integrated)
- **Tailwind CSS**: Utility classes
- **Canvas API**: For particle system
- **RequestAnimationFrame**: For smooth animations

---

## ✅ Checklist Before Deployment

- [ ] Video URL is accessible and optimized
- [ ] Fonts are loading correctly
- [ ] Colors are brand-aligned
- [ ] Animations perform well on target devices
- [ ] Mobile responsive and tested
- [ ] All buttons are functional
- [ ] API endpoints are configured
- [ ] Environment variables set
- [ ] CORS headers configured
- [ ] Performance metrics acceptable

---

## 🎉 You're All Set!

Your EduAI platform now has a stunning, professional 3D hero section that will impress users and provide an incredible first impression.

**Key Takeaways:**
- ✨ Advanced 3D effects with parallax
- 🎨 Professional design with custom colors
- 🚀 High performance animations
- 📱 Fully responsive
- 🔧 Easy to customize
- 💪 Production-ready code

Enjoy your amazing hero section! 🚀

---

**For more help, check the code comments in:**
- `client/src/pages/Hero3D.jsx`
- `client/src/index.css`
- `client/src/App.jsx`
