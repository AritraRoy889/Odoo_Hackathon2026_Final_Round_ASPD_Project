import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, ArrowRight, Package, Building2, Star, Zap } from 'lucide-react';

const STATS = [
  { icon: Package, value: '2,400+', label: 'Rental Items', color: 'text-accent-teal' },
  { icon: Building2, value: '50+', label: 'Verified Vendors', color: 'text-accent-violet' },
  { icon: Star, value: '4.9', label: 'Avg Rating', color: 'text-accent-gold' },
  { icon: Zap, value: '<2min', label: 'Avg Booking Time', color: 'text-accent-teal' },
];

export default function VideoHero() {
  const { setCurrentView } = useApp();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [counters, setCounters] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85;
    }
  }, []);

  // Animate stat counters on load
  useEffect(() => {
    const targets = [2400, 50, 4.9, 2];
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounters(targets.map(t => +(t * eased).toFixed(t < 10 ? 1 : 0)));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const scrollToProducts = () => {
    const el = document.getElementById('product-grid-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '580px' }}>

      {/* ── VIDEO LAYER ── */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        src="/hero-bg.mp4"
      />

      {/* Fallback gradient when video loads */}
      {!videoLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0A0F1E] to-[#06070F]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,176,0.12) 0%, transparent 70%)'
          }} />
        </div>
      )}

      {/* ── OVERLAY LAYERS ── */}
      {/* Primary dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06070F]/65 via-[#06070F]/50 to-[#06070F]" />
      {/* Side vignettes */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#06070F]/70 via-transparent to-[#06070F]/70" />
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#06070F] to-transparent" />
      {/* Scanline texture */}
      <div className="absolute inset-0 scanline-overlay opacity-60" />
      {/* Noise */}
      <div className="absolute inset-0 noise-overlay" />

      {/* ── ANIMATED PARTICLES ── */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${[3,4,2,5,3,4][i]}px`,
            height: `${[3,4,2,5,3,4][i]}px`,
            background: i % 2 === 0 ? '#00E5B0' : '#7C3AED',
            left: `${[15,35,55,70,82,92][i]}%`,
            top: `${[60,30,70,25,55,40][i]}%`,
            opacity: 0.6,
            animation: `float ${[4,5,3.5,6,4.5,5.5][i]}s ease-in-out infinite`,
            animationDelay: `${[0,1.2,0.8,2,1.5,0.4][i]}s`,
            boxShadow: i % 2 === 0 ? '0 0 8px #00E5B0' : '0 0 8px #7C3AED'
          }}
        />
      ))}

      {/* ── LIVE BADGE (top-right) ── */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-1.5 glass-teal px-3 py-1.5 rounded-full">
        <span className="h-2 w-2 rounded-full bg-accent-teal animate-live-blink" />
        <span className="text-[10px] font-bold text-accent-teal uppercase tracking-widest">Live Platform</span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Eyebrow tag */}
        <div className="flex items-center space-x-2 mb-5 animate-stagger-1">
          <div className="h-px w-8 bg-accent-teal" />
          <span className="text-[11px] font-bold text-accent-teal uppercase tracking-[0.2em]">
            Premium Multi-Tenant Rental Protocol
          </span>
        </div>

        {/* Main heading */}
        <h1
          className="font-display font-bold leading-none mb-4 animate-stagger-2"
          style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
        >
          <span className="text-white">Rent </span>
          <span className="text-gradient">Anything.</span>
          <br />
          <span className="text-white">Instantly.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-base sm:text-lg max-w-xl mb-8 leading-relaxed animate-stagger-3">
          Enterprise-grade equipment, premium furniture, and tech rigs —
          available on-demand with <span className="text-accent-teal font-semibold">real-time inventory</span> and
          automated <span className="text-accent-violet font-semibold">lease management</span>.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-12 animate-stagger-4">
          <button
            onClick={scrollToProducts}
            className="btn-gradient flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-glow-violet transition-all"
          >
            <span>Browse Products</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </button>

          <button
            onClick={() => setCurrentView('about')}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-gray-300 glass hover:border-accent-teal/40 hover:text-white transition-all"
          >
            <span>How It Works</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-6 animate-stagger-5">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            const displayVal = i === 0
              ? `${counters[0].toLocaleString()}+`
              : i === 1
              ? `${counters[1]}+`
              : i === 2
              ? counters[2].toFixed(1)
              : `<${counters[3]}min`;
            return (
              <div key={stat.label} className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg glass-teal`}>
                  <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
                <div>
                  <p className={`price-mono text-sm font-bold ${stat.color}`}>{displayVal}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
                </div>
                {i < STATS.length - 1 && (
                  <div className="h-6 w-px bg-white/10 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM FADE INTO PAGE ── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#06070F] to-transparent pointer-events-none" />
    </div>
  );
}
