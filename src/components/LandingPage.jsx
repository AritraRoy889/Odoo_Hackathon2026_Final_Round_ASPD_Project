import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRight, Play, Shield, Zap, Package, Star, ChevronDown,
  CheckCircle, Clock, BarChart2, Layers, Building2, Users, Globe
} from 'lucide-react';

// ── Counter animation hook ──
function useCounter(target, duration = 1600, suffix = '') {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 50;
    const step = target / steps;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val + suffix;
}

const FEATURES = [
  {
    icon: Package,
    title: 'Smart Catalogue',
    desc: 'AI-curated inventory with real-time availability, multi-rate pricing and holographic product cards.',
    color: 'teal',
  },
  {
    icon: Clock,
    title: 'Live Countdown Timers',
    desc: 'Every rental comes with a live return countdown that switches to an accruing late-fee meter if overdue.',
    color: 'violet',
  },
  {
    icon: Shield,
    title: 'AI Risk Oracle',
    desc: 'Proprietary 6-factor risk scoring engine flags high-risk orders before they become problems.',
    color: 'gold',
  },
  {
    icon: BarChart2,
    title: 'Executive Reports',
    desc: 'One-click dark-mode PDF export of your entire order & revenue data, beautifully formatted.',
    color: 'teal',
  },
  {
    icon: Zap,
    title: 'Voice Commands',
    desc: 'Hands-free admin control. Say "show late orders" or "switch to reports" — Chrome Web Speech API.',
    color: 'violet',
  },
  {
    icon: Globe,
    title: 'Multi-Currency',
    desc: 'Toggle between USD, EUR, GBP and INR with live exchange rates displayed across the entire app.',
    color: 'gold',
  },
];

const STEPS = [
  { num: '01', title: 'Create Account', desc: 'Sign up as a Customer or Vendor in under 60 seconds.' },
  { num: '02', title: 'Browse Catalogue', desc: 'Filter by brand, color, price, and rental period instantly.' },
  { num: '03', title: 'Configure & Checkout', desc: 'Pick your rental period, add-ons, and pay securely.' },
  { num: '04', title: 'Track & Return', desc: 'Monitor your rental with live timers and receive your deposit back.' },
];

const PLANS = [
  {
    name: 'Customer',
    price: 'Free',
    sub: 'Forever',
    perks: ['Browse full catalogue', 'Multi-currency view', 'NeoBot AI assistant', 'QR rental pass', 'Order tracking'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Vendor',
    price: '$49',
    sub: '/ month',
    perks: ['Everything in Customer', 'Back-office dashboard', 'Voice command panel', 'AI risk scoring', 'PDF report export', 'IoT telemetry view'],
    cta: 'Start Vendor Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    sub: 'Contact us',
    perks: ['Unlimited orders', 'Priority support', 'Custom integrations', 'White-label option', 'Dedicated SLA'],
    cta: 'Talk to Sales',
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Rahul Sharma',
    role: 'Operations Head, TechRig India',
    text: 'NeoRent cut our equipment idle time by 40%. The AI risk oracle alone saved us ₹2L in bad-faith returns.',
    avatar: 'RS',
  },
  {
    name: 'Sofia Alvarez',
    role: 'Event Manager, FrameWorks EU',
    text: 'The countdown timers are genius. Clients return on time now — late fees dropped to near zero.',
    avatar: 'SA',
  },
  {
    name: 'James Park',
    role: 'CTO, NomadDesk Global',
    text: 'Voice commands in the admin panel feel like the future. I manage 200+ orders without touching my mouse.',
    avatar: 'JP',
  },
];

export default function LandingPage({ onOpenAuth }) {
  const { setCurrentView } = useApp();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const cnt1 = useCounter(2400, 1800, '+');
  const cnt2 = useCounter(50, 1500, '+');
  const cnt3 = useCounter(98, 1600, '%');

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.8;
  }, []);

  const colorMap = {
    teal: { border: 'border-accent-teal/20', bg: 'bg-accent-teal/8', icon: 'text-accent-teal', badge: 'bg-accent-teal/10 text-accent-teal' },
    violet: { border: 'border-accent-violet/20', bg: 'bg-accent-violet/8', icon: 'text-accent-violet', badge: 'bg-accent-violet/10 text-accent-violet' },
    gold: { border: 'border-accent-gold/20', bg: 'bg-accent-gold/8', icon: 'text-accent-gold', badge: 'bg-accent-gold/10 text-accent-gold' },
  };

  return (
    <div className="w-full overflow-x-hidden">

      {/* ═══════════════════════════════════════════════
          HERO — Video Background + CTA
      ═══════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '100vh' }}>

        {/* Video layer */}
        <video
          ref={videoRef}
          autoPlay loop muted playsInline
          onCanPlay={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          src="/hero-bg.mp4"
        />

        {/* Fallback gradient */}
        {!videoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#06070F] to-[#0D1117]">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 10%, rgba(0,229,176,0.14) 0%, transparent 70%)' }} />
          </div>
        )}

        {/* Overlay layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06070F]/80 via-[#06070F]/65 to-[#06070F]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070F]/70 via-transparent to-[#06070F]/60" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#06070F] to-transparent" />
        <div className="absolute inset-0 scanline-overlay opacity-40" />

        {/* Floating grid pattern */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'linear-gradient(rgba(0,229,176,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,176,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20" style={{ minHeight: '100vh' }}>

          {/* Eyebrow badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-accent-teal/30 bg-accent-teal/8 mb-8 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-teal animate-live-blink" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent-teal">Odoo Hackathon 2026 · Final Round</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 animate-fade-in-up max-w-5xl"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            Rent Smarter.<br />
            <span className="text-gradient">Track Faster.</span><br />
            <span className="text-white/80">Return on Time.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            NeoRent is the AI-powered, multi-tenant rental management platform with live countdowns,
            risk scoring, voice commands, and a stunning dashboard — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>

            {/* Primary: Sign Up */}
            <button
              onClick={() => onOpenAuth('register-user')}
              className="group flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-teal to-accent-tealDark text-darkBg font-extrabold text-base shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.03]"
            >
              <Users className="h-5 w-5" />
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Secondary: Sign In */}
            <button
              onClick={() => onOpenAuth('login')}
              className="group flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl border border-[#2A3555] glass-premium text-white font-bold text-base hover:border-accent-teal/40 hover:bg-accent-teal/5 transition-all duration-300"
            >
              <Shield className="h-5 w-5 text-gray-400 group-hover:text-accent-teal transition-colors" />
              <span>Sign In</span>
            </button>

            {/* Watch demo */}
            <button
              onClick={() => { const el = document.getElementById('features-section'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl text-gray-400 font-semibold text-sm hover:text-accent-violet transition-colors"
            >
              <div className="h-8 w-8 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-accent-violet transition-colors">
                <Play className="h-3 w-3 ml-0.5" />
              </div>
              <span>Explore Features</span>
            </button>
          </div>

          {/* Live stats row */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 animate-fade-in-up"
            style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            {[
              { icon: Package, val: cnt1, label: 'Rental Items' },
              { icon: Building2, val: cnt2, label: 'Verified Vendors' },
              { icon: Star, val: cnt3, label: 'Customer Satisfaction' },
            ].map(({ icon: Icon, val, label }) => (
              <div key={label} className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-accent-teal" />
                </div>
                <div className="text-left">
                  <p className="price-mono text-xl font-extrabold text-white">{val}</p>
                  <p className="text-[11px] text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <button
            onClick={() => { const el = document.getElementById('features-section'); el?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex flex-col items-center text-gray-600 hover:text-gray-400 transition-colors animate-bounce"
          >
            <span className="text-[10px] uppercase tracking-widest mb-2">Scroll to explore</span>
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════════════ */}
      <section id="features-section" className="py-24 px-4 bg-[#06070F]">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-accent-violet/30 bg-accent-violet/8 mb-4">
              <Zap className="h-3 w-3 text-accent-violet" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent-violet">WOW Features</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Built to <span className="text-gradient">Impress</span> from Day One
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Every feature was designed to be unique, functional, and visually stunning — not just another CRUD app.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              const c = colorMap[feat.color];
              return (
                <div
                  key={feat.title}
                  className={`glass-premium rounded-2xl p-6 border ${c.border} hover:border-opacity-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-card animate-fade-in-up group`}
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className={`h-11 w-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${c.icon}`} />
                  </div>
                  <h3 className="font-display text-sm font-extrabold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#0D1117]">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-accent-teal/30 bg-accent-teal/8 mb-4">
              <CheckCircle className="h-3 w-3 text-accent-teal" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent-teal">How It Works</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Rental in <span className="text-gradient">4 Simple Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-accent-teal/30 to-transparent" />
                )}
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-2xl glass-teal border border-accent-teal/30 flex items-center justify-center mb-4 shadow-glow-subtle">
                    <span className="price-mono text-lg font-extrabold text-accent-teal">{step.num}</span>
                  </div>
                  <h4 className="font-display text-sm font-extrabold text-white mb-2">{step.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[160px]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#06070F]" id="pricing-section">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-accent-gold/30 bg-accent-gold/8 mb-4">
              <Star className="h-3 w-3 text-accent-gold" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent-gold">Pricing</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Start free. Scale when ready. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 animate-fade-in-up ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-accent-teal/10 to-accent-violet/5 border-accent-teal/40 shadow-glow-subtle'
                    : 'glass-premium border-[#1C2438] hover:border-[#2A3555]'
                }`}
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-accent-teal to-accent-tealDark text-darkBg text-[10px] font-extrabold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="mb-5">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500 mb-1">{plan.name}</p>
                  <div className="flex items-baseline space-x-1">
                    <span className="price-mono text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-gray-500">{plan.sub}</span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6">
                  {plan.perks.map(perk => (
                    <div key={perk} className="flex items-center space-x-2">
                      <CheckCircle className={`h-3.5 w-3.5 flex-shrink-0 ${plan.highlight ? 'text-accent-teal' : 'text-gray-600'}`} />
                      <span className="text-xs text-gray-400">{perk}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onOpenAuth(plan.name === 'Vendor' ? 'register-vendor' : plan.name === 'Enterprise' ? 'contact' : 'register-user')}
                  className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-accent-teal to-accent-tealDark text-darkBg shadow-glow hover:shadow-glow-lg'
                      : 'border border-[#2A3555] text-gray-300 hover:border-accent-teal/30 hover:text-accent-teal'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#0D1117]">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-accent-violet/30 bg-accent-violet/8 mb-4">
              <Users className="h-3 w-3 text-accent-violet" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent-violet">Testimonials</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
              Loved by <span className="text-gradient">Real Teams</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="glass-premium rounded-2xl p-5 border border-[#1C2438] hover:border-accent-violet/25 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-accent-violet to-accent-teal flex items-center justify-center text-darkBg text-xs font-extrabold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-gray-500">{t.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3 w-3 text-accent-gold fill-accent-gold" />
                  ))}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINAL CTA BAND
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#06070F] relative overflow-hidden">
        {/* Glow blob */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-96 w-96 rounded-full bg-accent-teal/8 blur-[80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-accent-teal/30 bg-accent-teal/8 mb-6">
            <Layers className="h-3 w-3 text-accent-teal" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent-teal">Ready to Start?</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Join the <span className="text-gradient">NeoRent</span> Network Today
          </h2>
          <p className="text-gray-500 text-sm mb-10 max-w-lg mx-auto">
            Create your account in seconds. No credit card required for customers.
            Vendors get 14 days free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onOpenAuth('register-user')}
              className="group flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-teal to-accent-tealDark text-darkBg font-extrabold text-base shadow-glow hover:shadow-glow-lg transition-all hover:scale-[1.03]"
            >
              <Users className="h-5 w-5" />
              <span>Register as Customer</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onOpenAuth('register-vendor')}
              className="group flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl border border-accent-violet/40 glass-violet text-accent-violet font-bold text-base hover:bg-accent-violet/10 transition-all hover:scale-[1.03]"
            >
              <Building2 className="h-5 w-5" />
              <span>Register as Vendor</span>
            </button>
          </div>

          {/* Already have account */}
          <p className="mt-8 text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => onOpenAuth('login')}
              className="text-accent-teal font-bold hover:underline"
            >
              Sign In →
            </button>
          </p>
        </div>
      </section>

    </div>
  );
}
