import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import SidebarFilters from './components/SidebarFilters';
import ProductGrid from './components/ProductGrid';
import ProductConfigModal from './components/ProductConfigModal';
import AuthFlow from './components/AuthFlow';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import OrderConfirmation from './components/OrderConfirmation';
import AdminDashboard from './components/AdminDashboard';
import ContactUs from './components/ContactUs';
import VideoHero from './components/VideoHero';
import NeoBotChat from './components/NeoBotChat';
import LandingPage from './components/LandingPage';
import { Layers, Shield, FileText, Info, Code, Share2, Link2, ExternalLink } from 'lucide-react';

export default function App() {
  const { currentView, user, setCurrentView } = useApp();

  const [authOpen, setAuthOpen]         = useState(false);
  const [authInitTab, setAuthInitTab]   = useState('login');
  const [configProduct, setConfigProduct] = useState(null);

  const handleConfigureProduct = (product) => setConfigProduct(product);
  const handleCloseConfig = () => setConfigProduct(null);

  // Open auth modal with a pre-selected tab
  const openAuth = (tab = 'login') => {
    setAuthInitTab(tab);
    setAuthOpen(true);
  };

  const isStaff = user && (user.role === 'ADMIN' || user.role === 'VENDOR');
  const isLanding = currentView === 'landing';

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onOpenAuth={openAuth} />;

      case 'storefront':
        return (
          <>
            <VideoHero />
            <div className="flex flex-col lg:flex-row gap-8 mt-8">
              <SidebarFilters />
              <ProductGrid onConfigureProduct={handleConfigureProduct} />
            </div>
          </>
        );
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-confirmation':
        return <OrderConfirmation />;
      case 'admin':
        return isStaff ? <AdminDashboard /> : (
          <div className="text-center py-20 max-w-md mx-auto glass-premium rounded-2xl border border-[#1C2438]">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">Access Denied</h3>
            <p className="text-sm text-gray-400">Your account does not have operator credentials for the back-office dashboard.</p>
          </div>
        );
      case 'settings':
        return isStaff ? <AdminDashboard /> : (
          <div className="max-w-2xl mx-auto glass-premium rounded-2xl border border-[#1C2438] p-6 space-y-5">
            <h3 className="text-base font-extrabold text-white font-display border-b border-[#1C2438] pb-3">Customer Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-wider">Name</label>
                <input type="text" value={user?.name || 'Guest User'} disabled className="input-premium opacity-60" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-wider">Email</label>
                <input type="text" value={user?.email || 'guest@example.com'} disabled className="input-premium opacity-60" />
              </div>
            </div>
            <p className="text-[10px] text-gray-600">* Profile editing locked during hackathon simulation mode.</p>
          </div>
        );
      case 'contact':
        return <ContactUs />;
      case 'terms':
        return (
          <div className="max-w-3xl mx-auto glass-premium rounded-2xl border border-[#1C2438] p-8 space-y-6 text-sm leading-relaxed text-gray-300">
            <div className="flex items-center space-x-3 border-b border-[#1C2438] pb-4">
              <div className="h-10 w-10 rounded-xl glass-teal flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent-teal" />
              </div>
              <h2 className="text-xl font-extrabold text-white font-display">Terms & Conditions</h2>
            </div>
            <div className="space-y-5">
              <div><p className="font-bold text-white mb-1">1. Ownership and Lease Commencement</p>
                <p className="text-gray-400">All catalog commodities leased through the NeoRent network remain the absolute physical property of their respective vendors. Leases commence strictly at the configured pickup date.</p></div>
              <div><p className="font-bold text-white mb-1">2. Late Fees & Overdue Penalty</p>
                <p className="text-gray-400">Returned assets exceeding contract boundaries are subjected to late fee levies (standardized at $15.00/hour or per custom item rules).</p></div>
              <div><p className="font-bold text-white mb-1">3. Security Deposits & Warranties</p>
                <p className="text-gray-400">Product compliance requires a security deposit at check-out. Deposits are refunded within 48 business hours post return verification.</p></div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="max-w-3xl mx-auto glass-premium rounded-2xl border border-[#1C2438] p-8 space-y-6 text-sm leading-relaxed text-gray-300">
            <div className="flex items-center space-x-3 border-b border-[#1C2438] pb-4">
              <div className="h-10 w-10 rounded-xl glass-violet flex items-center justify-center">
                <Info className="h-5 w-5 text-accent-violet" />
              </div>
              <h2 className="text-xl font-extrabold text-white font-display">About NeoRent</h2>
            </div>
            <div className="space-y-4">
              <p className="font-bold text-white">The Premium Multi-Tenant Rental Protocol</p>
              <p className="text-gray-400">NeoRent is a cutting-edge, decentralized logistics framework enabling businesses and individual clients to check out high-ticket equipment, modular corporate furniture, and enterprise tech rigs in real-time.</p>
              <p className="text-gray-400">Our platform handles end-to-end leasing lifecycles, complete with automated quotation generation, invoice settlement pipelines, and localized scheduler logistics monitoring.</p>
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[['2,400+','Rental Items'],['50+','Verified Vendors'],['4.9★','Avg Rating']].map(([val,lab]) => (
                  <div key={lab} className="glass-teal rounded-xl p-4 text-center">
                    <p className="price-mono text-xl font-extrabold text-accent-teal">{val}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{lab}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <LandingPage onOpenAuth={openAuth} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#06070F] text-gray-100 flex flex-col font-sans">

      {/* Navbar — hidden on landing, visible everywhere else */}
      {!isLanding && <Navbar onOpenAuth={() => openAuth('login')} />}

      {/* Landing gets its own thin top bar */}
      {isLanding && (
        <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-[#06070F]/80 backdrop-blur-xl border-b border-[#1C2438]/50">
          {/* Logo */}
          <button onClick={() => setCurrentView('landing')} className="flex items-center space-x-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-accent-tealDark to-accent-teal shadow-glow-subtle group-hover:shadow-glow transition-all">
              <Layers className="h-4 w-4 text-darkBg" />
            </div>
            <span className="font-display text-base font-extrabold tracking-wider text-white">
              NEO<span className="text-gradient">RENT</span>
            </span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-gray-400">
            {[['Features','features-section'],['Pricing','pricing-section'],['About','about-section']].map(([label, id]) => (
              <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-white transition-colors uppercase tracking-wider">{label}</button>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-2 rounded-xl border border-[#2A3555] text-xs font-bold text-gray-300 hover:text-white hover:border-accent-teal/40 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth('register-user')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-teal to-accent-tealDark text-darkBg text-xs font-extrabold shadow-glow-subtle hover:shadow-glow transition-all"
            >
              Get Started
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${isLanding ? '' : 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8'}`}>
        {renderActiveView()}
      </main>

      {/* Modals */}
      <AuthFlow isOpen={authOpen} onClose={() => setAuthOpen(false)} initialTab={authInitTab} />
      {configProduct && (
        <ProductConfigModal product={configProduct} isOpen={!!configProduct} onClose={handleCloseConfig} />
      )}

      {/* NeoBot Chat Widget — not on landing page */}
      {!isLanding && <NeoBotChat />}

      {/* ── PREMIUM FOOTER (only on inner pages) ── */}
      {!isLanding && (
        <footer className="border-t border-[#1C2438] mt-16 bg-[#0D1117]/80 backdrop-blur no-print">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Brand */}
              <div>
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-tealDark to-accent-teal shadow-glow-subtle">
                    <Layers className="h-5 w-5 text-darkBg" />
                  </div>
                  <span className="font-display text-lg font-extrabold tracking-wider text-white">
                    NEO<span className="text-gradient">RENT</span>
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  Premium multi-tenant rental platform powered by AI and modern ERP infrastructure.
                </p>
                <div className="flex space-x-3">
                  {[Code, Share2, Link2].map((Icon, i) => (
                    <button key={i} className="h-8 w-8 rounded-lg glass flex items-center justify-center text-gray-500 hover:text-accent-teal hover:border-accent-teal/30 transition-all">
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>
              {/* Quick Links */}
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500 mb-4">Navigation</p>
                <div className="space-y-2.5">
                  {[['Products','storefront'],['Admin Panel','admin'],['Contact Us','contact'],['Terms & Conditions','terms'],['About','about']].map(([label, view]) => (
                    <button key={view} onClick={() => { setCurrentView(view); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="block text-sm text-gray-400 hover:text-accent-teal transition-colors">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tech Stack */}
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500 mb-4">Built With</p>
                <div className="flex flex-wrap gap-2">
                  {['React 19','FastAPI','SQLite','TailwindCSS','Vite','Python'].map(tech => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg text-[11px] font-bold glass text-gray-400 border border-[#1C2438]">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#1C2438]">
                  <p className="text-[11px] text-gray-600 flex items-center space-x-1">
                    <ExternalLink className="h-3 w-3" />
                    <span>Odoo Hackathon 2026 — Final Round</span>
                  </p>
                </div>
              </div>
            </div>
            {/* Bottom bar */}
            <div className="mt-10 pt-6 border-t border-[#1C2438] flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-600">
              <p>© 2026 NeoRent Network. Engineered for high-speed multi-tenant operations.</p>
              <div className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-teal animate-live-blink" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Landing page has its own minimal footer */}
      {isLanding && (
        <footer className="py-6 px-6 border-t border-[#1C2438]/50 bg-[#06070F] text-center text-[11px] text-gray-700">
          <p>© 2026 NeoRent · Odoo Hackathon 2026 Final Round · All rights reserved</p>
        </footer>
      )}
    </div>
  );
}
