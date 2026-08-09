import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Heart, ShoppingCart, Layers, LogOut, User, Settings,
  ClipboardList, ChevronDown, Menu, X, Bell, Globe
} from 'lucide-react';
import Fuse from 'fuse.js';

const CURRENCIES = [
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧' },
  { code: 'INR', symbol: '₹', flag: '🇮🇳' },
];

export default function Navbar({ onOpenAuth }) {
  const {
    currentView, setCurrentView,
    user, setUser,
    cart, wishlist,
    searchQuery, setSearchQuery,
    selectedCurrency, setSelectedCurrency,
    userLocation, triggerNotification,
    products,
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [fuseResults, setFuseResults] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef(null);
  const currencyRef = useRef(null);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const currentCurrency = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

  // Scroll detection for navbar elevation
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) setCurrencyOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fuse.js search
  useEffect(() => {
    if (!searchQuery.trim() || !products?.length) { setFuseResults([]); return; }
    const fuse = new Fuse(products, {
      keys: ['name', 'brand', 'category'],
      threshold: 0.4,
      includeMatches: true,
    });
    const results = fuse.search(searchQuery).slice(0, 6);
    setFuseResults(results);
  }, [searchQuery, products]);

  const handleLogout = () => {
    setUser(null);
    setCurrentView('storefront');
    setDropdownOpen(false);
    triggerNotification('Logged out successfully', 'info');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearchSelect = (product) => {
    setSearchQuery(product.name);
    setFuseResults([]);
    setSearchFocused(false);
    setCurrentView('storefront');
  };

  const NAV_LINKS = [
    { label: 'Products', view: 'storefront' },
    { label: 'Terms', view: 'terms' },
    { label: 'About', view: 'about' },
    { label: 'Contact', view: 'contact' },
  ];

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 no-print ${
      isScrolled
        ? 'bg-[#06070F]/95 backdrop-blur-xl border-b border-[#1C2438] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
        : 'bg-[#06070F]/80 backdrop-blur-md border-b border-[#1C2438]/60'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── LOGO ── */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div
              onClick={() => handleViewChange('storefront')}
              className="flex cursor-pointer items-center space-x-2.5 group"
            >
              {/* Logo mark */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-tealDark to-accent-teal shadow-glow transition-all duration-300 group-hover:shadow-glow-lg">
                <Layers className="h-5 w-5 text-darkBg font-bold" />
                {/* Orbit ring */}
                <div className="absolute inset-[-3px] rounded-xl border border-accent-teal/30 animate-pulse-glow" />
              </div>
              {/* Wordmark */}
              <span className="font-display text-xl font-extrabold tracking-wider text-white">
                NEO<span className="text-gradient">RENT</span>
              </span>
            </div>

            {/* GeoIP badge */}
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full glass-teal text-[10px] font-bold text-accent-teal">
              <span className="animate-live-blink">📍</span>
              <span>{userLocation?.city || 'San Francisco'}, {userLocation?.countryCode || 'US'}</span>
            </div>
          </div>

          {/* ── NAV LINKS (desktop) ── */}
          <div className="hidden lg:flex items-center space-x-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.view}
                onClick={() => handleViewChange(link.view)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentView === link.view
                    ? 'text-accent-teal bg-accent-teal/8 font-extrabold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* ── SMART SEARCH ── */}
          <div ref={searchRef} className="relative flex-1 max-w-xs hidden md:block">
            <div className={`flex items-center rounded-xl border transition-all duration-200 ${
              searchFocused
                ? 'border-accent-teal/50 bg-[#0D1117] shadow-[0_0_0_3px_rgba(0,229,176,0.1)]'
                : 'border-[#1C2438] bg-[#0D1117]/60 hover:border-[#2A3555]'
            }`}>
              <svg className="ml-3 h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search rentals..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full bg-transparent py-2.5 pl-2.5 pr-3 text-sm text-white placeholder-gray-500 outline-none"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setFuseResults([]); }} className="mr-2 text-gray-500 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Fuzzy Results Dropdown */}
            {searchFocused && fuseResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full rounded-xl glass-premium border border-[#1C2438] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-slide-down">
                <div className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500 tracking-wider border-b border-[#1C2438]">
                  Results
                </div>
                {fuseResults.map(({ item }) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearchSelect(item)}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-accent-teal/5 transition-colors text-left"
                  >
                    <img src={item.image} alt="" className="h-8 w-8 rounded-md object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.category} · {item.brand}</p>
                    </div>
                    <span className="ml-auto price-mono text-xs text-accent-teal flex-shrink-0">
                      ${item.price?.day}/day
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {searchFocused && searchQuery.trim() && fuseResults.length === 0 && (
              <div className="absolute top-full mt-2 w-full rounded-xl glass-premium border border-[#1C2438] p-4 text-center z-50 animate-slide-down">
                <p className="text-xs text-gray-500">No results for "<span className="text-accent-teal">{searchQuery}</span>"</p>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDE CONTROLS ── */}
          <div className="flex items-center space-x-1 sm:space-x-2">

            {/* Currency Selector */}
            <div ref={currencyRef} className="relative hidden sm:block">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl glass hover:border-accent-teal/30 text-xs font-bold text-gray-300 hover:text-white transition-all"
              >
                <Globe className="h-3.5 w-3.5 text-gray-400" />
                <span>{currentCurrency.flag}</span>
                <span className="price-mono">{currentCurrency.code}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
              </button>

              {currencyOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 rounded-xl glass-premium border border-[#1C2438] overflow-hidden z-50 animate-slide-down">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => { setSelectedCurrency(c.code); setCurrencyOpen(false); triggerNotification(`Currency: ${c.code} ${c.symbol}`, 'info'); }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2.5 text-xs font-bold transition-colors ${
                        selectedCurrency === c.code
                          ? 'text-accent-teal bg-accent-teal/8'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="price-mono">{c.symbol}</span>
                      <span>{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => triggerNotification(`${wishlist.length} items in wishlist`, 'info')}
              className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <Heart className={`h-4.5 w-4.5 transition-colors ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : 'group-hover:text-red-400'}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center animate-bounce-subtle">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => handleViewChange('cart')}
              className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <ShoppingCart className="h-4.5 w-4.5 group-hover:text-accent-teal transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-teal text-[9px] font-bold text-darkBg flex items-center justify-center shadow-glow-subtle animate-bounce-subtle">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Menu / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl glass hover:border-accent-teal/30 transition-all"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-accent-tealDark to-accent-teal flex items-center justify-center text-[11px] font-extrabold text-darkBg flex-shrink-0">
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                  </div>
                  <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl glass-premium border border-[#1C2438] overflow-hidden z-50 animate-slide-down">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-[#1C2438]">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                      <span className="mt-1 inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-accent-teal/10 text-accent-teal border border-accent-teal/25">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'ADMIN' || user.role === 'VENDOR' ? (
                      <button onClick={() => handleViewChange('admin')} className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Settings className="h-3.5 w-3.5" /> <span>Admin Dashboard</span>
                      </button>
                    ) : null}
                    <button onClick={() => handleViewChange('settings')} className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      <User className="h-3.5 w-3.5" /> <span>Profile</span>
                    </button>
                    <button onClick={() => handleViewChange('contact')} className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      <Bell className="h-3.5 w-3.5" /> <span>Contact Support</span>
                    </button>
                    <div className="border-t border-[#1C2438]">
                      <button onClick={handleLogout} className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                        <LogOut className="h-3.5 w-3.5" /> <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-accent-violet/40 text-accent-violet hover:bg-accent-violet/10 hover:border-accent-violet transition-all"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-premium border-t border-[#1C2438] animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {/* Mobile search */}
            <div className="flex items-center rounded-xl border border-[#1C2438] bg-[#0D1117] mb-3">
              <svg className="ml-3 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search rentals..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-3 pl-2.5 pr-3 text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>

            {NAV_LINKS.map(link => (
              <button
                key={link.view}
                onClick={() => handleViewChange(link.view)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  currentView === link.view ? 'text-accent-teal bg-accent-teal/8' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Mobile currency */}
            <div className="flex items-center space-x-2 px-4 py-3">
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => { setSelectedCurrency(c.code); triggerNotification(`Currency: ${c.code}`, 'info'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCurrency === c.code
                      ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/30'
                      : 'text-gray-400 border border-[#1C2438] hover:text-white'
                  }`}
                >
                  {c.flag} {c.code}
                </button>
              ))}
            </div>

            {!user && (
              <button onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }} className="w-full btn-violet py-3 rounded-xl text-sm">
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
