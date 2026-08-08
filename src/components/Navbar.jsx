import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Heart, ShoppingCart, Layers, LogOut, User, ClipboardList, BookOpen } from 'lucide-react';

export default function Navbar() {
  const {
    currentView,
    setCurrentView,
    user,
    setUser,
    cart,
    wishlist,
    searchQuery,
    setSearchQuery,
    selectedCurrency,
    setSelectedCurrency,
    userLocation,
    triggerNotification
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    setUser(null);
    setCurrentView('storefront');
    setDropdownOpen(false);
    triggerNotification('Logged out successfully', 'info');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-darkBg-border bg-darkBg/80 backdrop-blur-md transition-colors duration-300 no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & GeoIP Location Badge */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div 
              onClick={() => handleViewChange('storefront')} 
              className="flex cursor-pointer items-center space-x-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-accent-mintDark to-accent-mint shadow-glow">
                <Layers className="h-6 w-6 text-darkBg font-bold" />
              </div>
              <span className="font-sans text-xl font-extrabold tracking-wider text-white">
                NEO<span className="text-accent-mint text-shadow-glow">RENT</span>
              </span>
            </div>

            {/* GeoIP Auto Location Badge */}
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-darkBg-card border border-darkBg-border text-[10px] font-bold text-accent-mint">
              <span>📍</span>
              <span>{userLocation?.city || 'San Francisco'}, {userLocation?.countryCode || 'US'}</span>
            </div>
          </div>

          {/* Navigation Links (Excalidraw Image 17) */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleViewChange('storefront')}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                currentView === 'storefront' ? 'text-accent-mint font-extrabold' : 'text-gray-300 hover:text-white hover:bg-darkBg-hover'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => handleViewChange('terms')}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                currentView === 'terms' ? 'text-accent-mint font-extrabold' : 'text-gray-300 hover:text-white hover:bg-darkBg-hover'
              }`}
            >
              Terms &amp; Condition
            </button>
            <button
              onClick={() => handleViewChange('about')}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                currentView === 'about' ? 'text-accent-mint font-extrabold' : 'text-gray-300 hover:text-white hover:bg-darkBg-hover'
              }`}
            >
              About us
            </button>
            <button
              onClick={() => handleViewChange('contact')}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                currentView === 'contact' ? 'text-accent-mint font-extrabold' : 'text-gray-300 hover:text-white hover:bg-darkBg-hover'
              }`}
            >
              Contact Us
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium rentals..."
                className="w-full rounded-full border border-darkBg-border bg-darkBg-card py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 outline-none transition-all duration-300 focus:border-accent-mint focus:ring-1 focus:ring-accent-mint focus:shadow-glow-subtle"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Side Icons, Currency Switcher & Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Multi-Currency Switcher Dropdown */}
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => {
                  setSelectedCurrency(e.target.value);
                  triggerNotification(`Currency set to ${e.target.value}`, 'info');
                }}
                className="bg-darkBg-card border border-darkBg-border text-white text-xs font-extrabold rounded-md px-2 py-1 outline-none cursor-pointer hover:border-accent-mint transition-colors"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            {/* Wishlist */}
            <button 
              onClick={() => handleViewChange('storefront')}
              className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-darkBg-hover transition-colors"
              title="Wishlist"
            >
              <Heart className={`h-5 w-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500 animate-pulse' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Badge */}
            <button
              onClick={() => handleViewChange('cart')}
              className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-darkBg-hover transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className={`h-5 w-5 ${cartItemCount > 0 ? 'text-accent-mint' : ''}`} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent-mint text-[10px] font-extrabold text-darkBg shadow-glow-subtle">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Profile / Access with DiceBear Avatar */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-darkBg-hover focus:outline-none transition-colors border border-transparent hover:border-darkBg-border"
                >
                  <div className="h-8 w-8 rounded-full bg-darkBg border border-accent-mint overflow-hidden flex items-center justify-center text-darkBg font-bold text-sm shadow-glow-subtle">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>

                {/* Dropdown Menu (Excalidraw Image 17) */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-darkBg-card border border-darkBg-border shadow-glow-lg focus:outline-none z-50 animate-slide-down glass-premium">
                    <div className="p-3 border-b border-darkBg-border">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        user.role !== 'CUSTOMER' ? 'bg-accent-mint/20 text-accent-mint border border-accent-mint/30' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleViewChange('settings')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-darkBg-hover hover:text-white transition-colors"
                      >
                        <User className="mr-3 h-4 w-4 text-gray-400" />
                        My Account / My Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          if (user.role === 'CUSTOMER') {
                            triggerNotification('Visit Admin Hub to track your orders', 'info');
                          } else {
                            handleViewChange('admin');
                          }
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-darkBg-hover hover:text-white transition-colors"
                      >
                        <ClipboardList className="mr-3 h-4 w-4 text-gray-400" />
                        My Orders
                      </button>

                      {user.role !== 'CUSTOMER' && (
                        <button
                          onClick={() => handleViewChange('admin')}
                          className="flex w-full items-center px-4 py-2 text-sm text-accent-mint hover:bg-darkBg-hover hover:text-accent-mintLight transition-colors font-semibold border-t border-b border-darkBg-border/50"
                        >
                          <BookOpen className="mr-3 h-4 w-4 text-accent-mint" />
                          Settings (Admin Hub)
                        </button>
                      )}
                    </div>

                    <div className="py-1 border-t border-darkBg-border">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4 text-red-400" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1 px-4 py-1.5 rounded-full border border-accent-mint text-accent-mint hover:bg-accent-mint hover:text-darkBg font-semibold text-sm transition-all duration-300 hover:shadow-glow"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}
