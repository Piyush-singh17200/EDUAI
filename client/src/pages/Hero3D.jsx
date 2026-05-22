import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileText,
  GraduationCap,
  Play,
  Route,
  Server,
  Sparkles,
  Wand2,
  Wifi,
} from 'lucide-react';

const productFeatures = [
  {
    icon: BrainCircuit,
    title: 'AI Tutor',
    text: 'Ask questions, break down concepts, and generate quizzes for any subject.',
    tone: 'from-cyan-400 to-blue-500',
  },
  {
    icon: CalendarClock,
    title: 'Smart Study Planner',
    text: 'Turn college classes into focused study blocks with AI recommendations.',
    tone: 'from-violet-400 to-fuchsia-500',
  },
  {
    icon: Route,
    title: 'Career Roadmap',
    text: 'Build weekly milestones, project ideas, and DSA plans around your target role.',
    tone: 'from-orange-300 to-rose-500',
  },
  {
    icon: FileText,
    title: 'Resume Analyzer',
    text: 'Upload your resume, get ATS scoring, skill gaps, and role-fit suggestions.',
    tone: 'from-emerald-300 to-teal-500',
  },
];

const workflowCards = [
  { label: 'Question answered', value: '2.8s', icon: BookOpen },
  { label: 'ATS score preview', value: '86%', icon: Award },
  { label: 'Roadmap sprint', value: '8 weeks', icon: Briefcase },
  { label: 'Study load balanced', value: '24h', icon: GraduationCap },
];

const insightRows = [
  'Prioritize Data Structures practice before interview week.',
  'Resume needs stronger quantified project outcomes.',
  'Physics and Math study blocks moved to peak focus hours.',
];

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2.6;
    this.vy = (Math.random() - 0.5) * 2.6 - 1;
    this.life = 1;
    this.decay = Math.random() * 0.014 + 0.01;
    this.size = Math.random() * 2.4 + 1.2;
    this.color = Math.random() > 0.5 ? '34, 211, 238' : '251, 191, 36';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.vy -= 0.025;
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(${this.color}, ${this.life * 0.42})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const Hero3D = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [backendStatus, setBackendStatus] = useState({
    state: 'checking',
    message: 'Checking backend',
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return undefined;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particlesRef.current.length - 1; i >= 0; i -= 1) {
        const particle = particlesRef.current[i];
        particle.update();
        particle.draw(ctx);

        if (particle.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animationFrameRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });

      if (Math.random() > 0.87 && particlesRef.current.length < 70) {
        particlesRef.current.push(new Particle(event.clientX, event.clientY));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      try {
        const response = await fetch('/health', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) throw new Error('Backend offline');

        if (isMounted) {
          setBackendStatus({
            state: 'online',
            message: data.status || 'Backend connected',
          });
        }
      } catch (error) {
        if (isMounted) {
          setBackendStatus({
            state: 'offline',
            message: 'Backend offline',
          });
        }
      }
    };

    checkBackend();
    const interval = window.setInterval(checkBackend, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const heroTransform = {
    transform: `perspective(1200px) rotateX(${(mousePosition.y - 0.5) * 3}deg) rotateY(${(mousePosition.x - 0.5) * 3}deg) translateZ(16px)`,
    transition: 'transform 0.16s ease-out',
  };

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-slate-950 text-white"
      style={{ background: 'hsl(var(--background))' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" style={{ mixBlendMode: 'screen' }} />
      <div className="hero-surface absolute inset-0 z-[1]" />

      <section className="relative z-10 min-h-screen">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-300 via-indigo-400 to-amber-200 text-slate-950 shadow-lg shadow-cyan-500/20">
              <BookOpen size={22} />
            </span>
            <span className="font-general-sans text-xl font-semibold">EduAI</span>
          </a>

          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md md:flex">
            <a href="#features" className="hero-nav-link">Features</a>
            <a href="#workspace" className="hero-nav-link">Workspace</a>
            <a href="#outcomes" className="hero-nav-link">Results</a>
          </div>

          <Link to="/login" className="btn-hero-secondary btn-hero-compact inline-flex items-center gap-2">
            Sign in
            <ArrowRight size={16} />
          </Link>
        </nav>

        <div
          id="top"
          className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:min-h-[calc(100vh-84px)] lg:grid-cols-[0.92fr_1.08fr]"
        >
          <div className="max-w-3xl" style={heroTransform}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-100">
              <Sparkles size={16} />
              AI study, career, and resume workspace
            </div>

            <h1 className="font-general-sans text-5xl font-semibold leading-none text-white sm:text-6xl lg:text-8xl">
              Study smarter. Build faster. Get career ready.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              EduAI brings an AI tutor, study planner, career roadmap, and resume analyzer into one polished student success platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="btn-hero-primary inline-flex items-center justify-center gap-2">
                Start learning
                <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-hero-secondary inline-flex items-center justify-center gap-2">
                Explore features
                <Play size={18} />
              </a>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ['4', 'AI tools'],
                ['24/7', 'tutor help'],
                ['ATS', 'resume score'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md">
                  <div className="font-general-sans text-2xl font-semibold text-amber-200">{value}</div>
                  <div className="mt-1 text-xs uppercase text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <ProductConsole backendStatus={backendStatus} />
        </div>
      </section>

      <section id="features" className="relative z-10 border-t border-white/10 bg-slate-950/80 py-20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Everything In One Place</p>
              <h2 className="mt-3 max-w-3xl font-general-sans text-4xl font-semibold text-white sm:text-5xl">
                Real AI features students can use every day.
              </h2>
            </div>
            <Link to="/login" className="btn-hero-secondary inline-flex items-center justify-center gap-2">
              Open workspace
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {productFeatures.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section id="workspace" className="relative z-10 bg-slate-950 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="section-kicker">AI Workspace</p>
            <h2 className="mt-3 font-general-sans text-4xl font-semibold text-white sm:text-5xl">
              A clean dashboard for learning, planning, and applying.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              The platform is designed around action: ask, plan, analyze, and improve without jumping between tools.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {workflowCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <Icon size={20} className="text-cyan-200" />
                    <p className="mt-4 font-general-sans text-2xl font-semibold text-white">{card.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{card.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="guide-panel p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="font-semibold text-white">Live AI Insights</p>
                <p className="mt-1 text-sm text-slate-400">Personalized recommendations across your workflow</p>
              </div>
              <Wand2 className="text-amber-200" size={22} />
            </div>

            <div className="mt-5 space-y-3">
              {insightRows.map((row, index) => (
                <div key={row} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-300/10 text-xs font-bold text-emerald-200">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-200">{row}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatusTile icon={Wifi} label="Frontend" value="Online" />
              <StatusTile
                icon={Server}
                label="Backend"
                value={backendStatus.state === 'online' ? 'Connected' : backendStatus.state === 'checking' ? 'Checking' : 'Offline'}
                muted={backendStatus.state !== 'online'}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="outcomes" className="relative z-10 border-t border-white/10 bg-slate-950/90 py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="guide-panel p-6 sm:p-8">
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
                <p className="section-kicker">Built For Results</p>
                <h2 className="mt-3 font-general-sans text-3xl font-semibold text-white sm:text-4xl">
                  From classroom doubts to career-ready applications.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {['Learn faster', 'Plan better', 'Apply stronger'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
                    <CheckCircle2 size={18} className="text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const ProductConsole = ({ backendStatus }) => {
  const backendOnline = backendStatus.state === 'online';

  return (
    <div className="guide-panel relative overflow-hidden p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-sm font-semibold text-white">EduAI Command Center</p>
          <p className="mt-1 text-xs text-slate-400">Live preview of your learning workspace</p>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-5">
          <BrainCircuit size={24} className="text-cyan-100" />
          <p className="mt-5 text-sm uppercase text-cyan-100">AI Tutor</p>
          <p className="mt-2 text-3xl font-semibold text-white">Ready</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">Explain, quiz, and summarize concepts instantly.</p>
        </div>

        <div className="space-y-3">
          {productFeatures.slice(1).map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.tone}`}>
                  <Icon size={19} className="text-slate-950" />
                </span>
                <div>
                  <p className="font-semibold text-white">{feature.title}</p>
                  <p className="text-xs text-slate-400">Synced with AI backend</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatusTile icon={Wifi} label="React frontend" value="Online" />
        <StatusTile icon={Server} label="Express backend" value={backendOnline ? 'Connected' : backendStatus.message} muted={!backendOnline} />
      </div>
    </div>
  );
};

const FeatureCard = ({ feature }) => {
  const Icon = feature.icon;

  return (
    <article className="guide-panel p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.tone}`}>
        <Icon size={23} className="text-slate-950" />
      </div>
      <h3 className="mt-5 font-general-sans text-xl font-semibold text-white">{feature.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{feature.text}</p>
    </article>
  );
};

const StatusTile = ({ icon: Icon, label, value, muted = false }) => (
  <div className={`rounded-lg border p-4 ${muted ? 'border-amber-300/20 bg-amber-300/10' : 'border-emerald-300/20 bg-emerald-300/10'}`}>
    <div className="flex items-center justify-between gap-3">
      <Icon size={18} className={muted ? 'text-amber-100' : 'text-emerald-100'} />
      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${muted ? 'bg-amber-300/15 text-amber-100' : 'bg-emerald-300/15 text-emerald-100'}`}>
        {value}
      </span>
    </div>
    <p className="mt-3 text-xs uppercase text-slate-300">{label}</p>
  </div>
);

export default Hero3D;
