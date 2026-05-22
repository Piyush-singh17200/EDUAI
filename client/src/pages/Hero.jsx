import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [videoOpacity, setVideoOpacity] = useState(0);

  // ============================================================================
  // LOOPING VIDEO WITH CUSTOM FADE ANIMATION
  // ============================================================================
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId;
    const startTime = Date.now();
    let lastOpacity = 0;

    const fadeVideo = () => {
      const elapsed = (Date.now() - startTime) % 1000; // 1000ms total duration
      let opacity;

      if (elapsed < 500) {
        // Fade in first 500ms
        opacity = elapsed / 500;
      } else {
        // Fade out last 500ms
        opacity = 1 - ((elapsed - 500) / 500);
      }

      if (Math.abs(opacity - lastOpacity) > 0.01) {
        setVideoOpacity(opacity);
        lastOpacity = opacity;
      }

      animationFrameId = requestAnimationFrame(fadeVideo);
    };

    const handleVideoEnded = () => {
      video.currentTime = 0;
      setVideoOpacity(0);
      setTimeout(() => {
        video.play().catch(err => console.log('Video play error:', err));
        fadeVideo();
      }, 100);
    };

    video.addEventListener('ended', handleVideoEnded);
    video.play().catch(err => console.log('Video play error:', err));
    fadeVideo();

    return () => {
      video.removeEventListener('ended', handleVideoEnded);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ============================================================================
  // MOUSE PARALLAX EFFECT
  // ============================================================================
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate parallax transform
  const parallaxTransform = {
    transform: `perspective(1000px) rotateX(${(mousePosition.y - 0.5) * 5}deg) rotateY(${(mousePosition.x - 0.5) * 5}deg)`,
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col bg-background overflow-hidden"
      style={{
        background: 'hsl(var(--background))',
      }}
    >
      {/* ========================================================================
          BACKGROUND VIDEO (looping with fade animation)
          ======================================================================== */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: videoOpacity,
          transition: 'opacity 0.03s linear',
        }}
        muted
        playsInline
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
          type="video/mp4"
        />
      </video>

      {/* ========================================================================
          BLUR OVERLAY SHAPE (animated, centered)
          ======================================================================== */}
      <div className="blur-overlay"></div>

      {/* ========================================================================
          NAVBAR
          ======================================================================== */}
      <nav
        className="relative z-20 py-5 px-8 flex items-center justify-between"
        style={{
          borderBottom: '1px solid transparent',
          backgroundImage:
            'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.05), transparent)',
        }}
      >
        {/* Logo */}
        <div className="flex-shrink-0 h-8 flex items-center">
          <svg
            className="w-8 h-8"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="6" fill="url(#grad)" />
            <text
              x="16"
              y="22"
              fontSize="20"
              fontWeight="bold"
              textAnchor="middle"
              fill="white"
              fontFamily="General Sans"
            >
              AI
            </text>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Center Navigation Items */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Solutions', 'Plans', 'Learning'].map((item, idx) => (
            <button
              key={item}
              className="flex items-center gap-1 transition-colors duration-300"
              style={{
                color: 'hsl(var(--foreground) / 0.9)',
              }}
            >
              <span className="text-sm font-medium">{item}</span>
              {(idx === 0 || idx === 3) && <ChevronDown size={16} />}
            </button>
          ))}
        </div>

        {/* Sign Up Button */}
        <button
          className="btn-hero-secondary px-4 py-2"
          style={{
            color: 'hsl(var(--foreground))',
          }}
        >
          Sign Up
        </button>
      </nav>

      {/* ========================================================================
          HERO CONTENT (centered with 3D parallax)
          ======================================================================== */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center"
        style={parallaxTransform}
      >
        <div className="hero-content max-w-4xl mx-auto px-8 text-center">
          {/* Headline with animated gradient */}
          <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <h1
              className="hero-headline font-general-sans font-normal leading-[1.02] tracking-[-0.024em] animate-glow"
              style={{
                fontSize: 'clamp(3.5rem, 15vw, 13.75rem)',
                color: 'hsl(var(--foreground))',
                textShadow: `
                  0 0 20px rgba(99, 102, 241, 0.3),
                  0 0 40px rgba(168, 85, 247, 0.2)
                `,
              }}
            >
              Power{' '}
              <span className="bg-gradient-text text-glow inline-block">
                AI
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div
            className="animate-slide-in-up mt-[9px]"
            style={{ animationDelay: '0.2s' }}
          >
            <p
              className="text-lg leading-8 max-w-md mx-auto opacity-80 font-geist"
              style={{
                color: 'hsl(var(--hero-sub))',
              }}
            >
              The most powerful AI ever deployed in talent acquisition
            </p>
          </div>

          {/* CTA Button */}
          <div
            className="animate-scale-in mt-[25px]"
            style={{ animationDelay: '0.3s' }}
          >
            <button className="btn-hero-secondary px-[29px] py-[24px]">
              Schedule a Consult
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================
          LOGO MARQUEE (pinned to bottom)
          ======================================================================== */}
      <div
        className="relative z-10 py-10 px-8 overflow-hidden"
        style={{
          borderTop: '1px solid transparent',
          backgroundImage:
            'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.02), transparent)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-12">
            {/* Left side text */}
            <div
              className="flex-shrink-0 text-sm font-geist whitespace-nowrap"
              style={{
                color: 'hsl(var(--foreground) / 0.5)',
              }}
            >
              Relied on by brands<br />
              across the globe
            </div>

            {/* Marquee */}
            <div className="flex-1 overflow-hidden">
              <div className="flex gap-16 animate-marquee">
                {/* First set of logos */}
                {['Vortex', 'Nimbus', 'Prysma', 'Cirrus', 'Kynder', 'Halcyn'].map(
                  (name, idx) => (
                    <LogoItem key={`${name}-1-${idx}`} name={name} />
                  )
                )}
                {/* Duplicated for seamless loop */}
                {['Vortex', 'Nimbus', 'Prysma', 'Cirrus', 'Kynder', 'Halcyn'].map(
                  (name, idx) => (
                    <LogoItem key={`${name}-2-${idx}`} name={name} />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// LOGO ITEM COMPONENT (with liquid glass effect)
// ============================================================================
const LogoItem = ({ name }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-3 flex-shrink-0 group cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* Logo Icon - Liquid Glass */}
      <div
        className="liquid-glass w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span
          className="text-xs font-bold font-general-sans"
          style={{
            color: 'hsl(var(--foreground))',
          }}
        >
          {name.charAt(0)}
        </span>
      </div>

      {/* Logo Name */}
      <span
        className="text-base font-semibold font-geist whitespace-nowrap transition-colors duration-300"
        style={{
          color: isHovered
            ? 'hsl(var(--foreground))'
            : 'hsl(var(--foreground) / 0.8)',
        }}
      >
        {name}
      </span>
    </div>
  );
};

export default Hero;
