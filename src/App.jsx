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
import { Layers, Shield, FileText, Info } from 'lucide-react';

export default function App() {
  const { currentView, user } = useApp();

  // Dialog overlays state
  const [authOpen, setAuthOpen] = useState(false);
  const [configProduct, setConfigProduct] = useState(null);

  const handleConfigureProduct = (product) => {
    setConfigProduct(product);
  };

  const handleCloseConfig = () => {
    setConfigProduct(null);
  };

  // Staff guard checker (case-insensitive)
  const isStaff = user && (
    user.role === 'ADMIN' || 
    user.role === 'VENDOR' || 
    user.role.toUpperCase() === 'ADMIN' || 
    user.role.toUpperCase() === 'VENDOR'
  );

  const renderActiveView = () => {
    switch (currentView) {
      case 'storefront':
        return (
          <div className="flex flex-col lg:flex-row gap-8">
            <SidebarFilters />
            <ProductGrid onConfigureProduct={handleConfigureProduct} />
          </div>
        );
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-confirmation':
        return <OrderConfirmation />;
      case 'admin':
        return isStaff ? <AdminDashboard /> : (
          <div className="text-center py-16 text-gray-400 max-w-md mx-auto border border-darkBg-border rounded-xl bg-darkBg-card/50 glass">
            <Shield className="mx-auto h-12 w-12 text-red-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
            <p className="text-xs">Your account role does not possess operator credentials for the back-office dashboard.</p>
          </div>
        );
      case 'settings':
        return isStaff ? <AdminDashboard /> : (
          <div className="max-w-2xl mx-auto rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-white uppercase border-b border-darkBg-border/40 pb-2">Customer Profile</h3>
            <div className="space-y-3">
              <p className="text-gray-400">Customer account management controls. Update your parameters here.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">NAME</label>
                  <input type="text" value={user?.name || 'Guest User'} disabled className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">EMAIL</label>
                  <input type="text" value={user?.email || 'guest@example.com'} disabled className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none" />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 pt-2 border-t border-darkBg-border/20">* Password change and card configurations are locked during hackathon simulations.</p>
            </div>
          </div>
        );
      case 'contact':
        return <ContactUs />;
      
      // Static customer informational routes (Excalidraw Image 17)
      case 'terms':
        return (
          <div className="max-w-3xl mx-auto rounded-xl border border-darkBg-border bg-darkBg-card p-8 glass space-y-6 text-xs leading-relaxed text-gray-300">
            <div className="flex items-center space-x-3 border-b border-darkBg-border pb-4">
              <FileText className="h-6 w-6 text-accent-mint" />
              <h2 className="text-lg font-extrabold text-white">Terms & Conditions</h2>
            </div>
            <div className="space-y-4">
              <p className="font-bold text-white">1. Ownership and Lease Commencement</p>
              <p>All catalog commodities leased through the NeoRent network remain the absolute physical property of their respective vendors. Leases commence strictly at the configured pickup date and terminate at the end time indicated in the quotation invoice.</p>
              
              <p className="font-bold text-white">2. Late Fees & Overdue Penalty</p>
              <p>In accordance with active node configurations, returned assets exceeding the contract termination boundaries are subjected to late fee levies (standardized at $15.00/hour or per custom item rules).</p>
              
              <p className="font-bold text-white">3. Security Deposits & Warranties</p>
              <p>Product compliance requires a security deposit at check-out. Security deposits are processed for refunds within 48 business hours post return verification checks.</p>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="max-w-3xl mx-auto rounded-xl border border-darkBg-border bg-darkBg-card p-8 glass space-y-6 text-xs leading-relaxed text-gray-300">
            <div className="flex items-center space-x-3 border-b border-darkBg-border pb-4">
              <Info className="h-6 w-6 text-accent-mint" />
              <h2 className="text-lg font-extrabold text-white">About Us</h2>
            </div>
            <div className="space-y-4">
              <p className="font-bold text-white">The Premium Multi-Tenant Rental Protocol</p>
              <p>NeoRent is a cutting-edge, decentralized logistics framework enabling businesses and individual clients to check out high-ticket equipment, modular corporate furniture, and enterprise tech rigs in real-time.</p>
              <p>Our platform handles end-to-end leasing lifecycles, complete with automated quotation generation, invoice settlement pipelines, and localized scheduler logistics monitoring.</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col lg:flex-row gap-8">
            <SidebarFilters />
            <ProductGrid onConfigureProduct={handleConfigureProduct} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Primary Header Navigation */}
      <Navbar onOpenAuth={() => setAuthOpen(true)} />

      {/* Main Page Layout Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveView()}
      </main>

      {/* Interactive Overlays (Modals) */}
      <AuthFlow isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      
      {configProduct && (
        <ProductConfigModal
          product={configProduct}
          isOpen={!!configProduct}
          onClose={handleCloseConfig}
        />
      )}

      {/* Corporate Footer */}
      <footer className="border-t border-darkBg-border py-6 mt-12 bg-darkBg-card/25 backdrop-blur no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-accent-mint" />
            <span className="font-semibold text-gray-400">NEORENT virtual platform hackathon demo</span>
          </div>
          <p>© 2026 NeoRent Network. Engineered for high-speed multi-tenant operations.</p>
        </div>
      </footer>

    </div>
  );
}
