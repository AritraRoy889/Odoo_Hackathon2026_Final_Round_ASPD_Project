import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, ArrowLeft, Store } from 'lucide-react';

export default function CheckoutView() {
  const {
    cart,
    deliveryOption,
    setDeliveryOption,
    billingSameAsShipping,
    setBillingSameAsShipping,
    shippingAddress,
    setShippingAddress,
    paymentDetails,
    setPaymentDetails,
    subtotal,
    deliveryCharge,
    discountAmount,
    totalAmount,
    finalizeOrder,
    setCurrentView,
    setSelectedOrderId,
    convertPrice,
    triggerNotification
  } = useApp();

  // Payment popup modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Address states
  const [fullName] = useState(shippingAddress.fullName || 'Alex Mercer');
  const [phone] = useState(shippingAddress.phone || '+1 (555) 012-7711');
  const [addressLine, setAddressLine] = useState(shippingAddress.addressLine || '123 Cyberpunk Boulevard');
  const [city, setCity] = useState(shippingAddress.city || 'San Francisco, CA');
  const [zipCode, setZipCode] = useState(shippingAddress.zipCode || '94103');
  const [country, setCountry] = useState(shippingAddress.country || 'United States');

  // Payment & KYC states
  const [cardNumber, setCardNumber] = useState(paymentDetails.cardNumber || '4532 1111 2222 3333');
  const [cardName, setCardName] = useState(paymentDetails.cardName || 'Alex Mercer');
  const [emailAddress, setEmailAddress] = useState('customer@example.com');
  const [addressLine2, setAddressLine2] = useState('Suite 404');
  const [expiry] = useState(paymentDetails.expiry || '12/28');
  const [cvv] = useState(paymentDetails.cvv || '123');

  const handlePayNowSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !emailAddress) {
      triggerNotification('Please complete payment credentials.', 'error');
      return;
    }

    setShippingAddress({ fullName, phone, addressLine: `${addressLine}, ${addressLine2}`, city, zipCode, country });
    setPaymentDetails({ cardNumber, cardName, expiry, cvv, saveCard: true });

    const orderId = finalizeOrder();
    if (orderId) {
      setSelectedOrderId(orderId);
      setShowPaymentModal(false);
      setCurrentView('order-confirmation');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-xs text-gray-300 relative">
      
      {/* Breadcrumbs matching Image 2 */}
      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
        Breadcrumb &rarr; Order &rarr; Address &rarr; Payment
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: DELIVERY METHOD & ADDRESS (Excalidraw Image 1 & 2) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Delivery Method Selector */}
          <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Delivery Method</h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-lg border border-darkBg-border bg-darkBg cursor-pointer hover:border-accent-mint transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="delivery_option"
                    checked={deliveryOption === 'shipping'}
                    onChange={() => setDeliveryOption('shipping')}
                    className="text-accent-mint focus:ring-accent-mint h-4 w-4"
                  />
                  <div className="flex items-center text-xs text-white">
                    <Truck className="h-4 w-4 text-gray-400 mr-2.5" />
                    <span className="font-semibold">Standard Delivery</span>
                  </div>
                </div>
                <span className="text-xs text-accent-mint font-bold uppercase">Free</span>
              </label>

              <label className="flex items-center justify-between p-4 rounded-lg border border-darkBg-border bg-darkBg cursor-pointer hover:border-accent-mint transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="delivery_option"
                    checked={deliveryOption === 'pickup'}
                    onChange={() => setDeliveryOption('pickup')}
                    className="text-accent-mint focus:ring-accent-mint h-4 w-4"
                  />
                  <div className="flex items-center text-xs text-white">
                    <Store className="h-4 w-4 text-gray-400 mr-2.5" />
                    <span className="font-semibold">Pick up from Store</span>
                  </div>
                </div>
                <span className="text-xs text-accent-mint font-bold uppercase">Free</span>
              </label>
            </div>
          </div>

          {/* Delivery Address Card (Image 2) */}
          <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Delivery Address</h3>
            
            {/* Address display card mockup */}
            <div className="relative p-5 bg-darkBg border border-darkBg-border rounded-lg space-y-3">
              <div className="flex justify-between items-center border-b border-darkBg-border/40 pb-2">
                <span className="font-extrabold text-white text-sm">{fullName}</span>
                <span className="px-2.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/50 text-[10px] uppercase font-bold tracking-wider">
                  Main Address
                </span>
              </div>
              
              <div className="space-y-1 text-gray-400 leading-relaxed font-semibold">
                <p>{addressLine}, {city}, {zipCode}</p>
                <p>Contact: {phone}</p>
                <p>Region: {country}</p>
              </div>

              {/* Edit pencil icon at the bottom-right of the card */}
              <button
                type="button"
                onClick={() => triggerNotification('Opening Address Edit fields...', 'info')}
                className="absolute bottom-3.5 right-3.5 p-1.5 rounded-md border border-darkBg-border bg-darkBg-card text-gray-400 hover:text-white hover:border-accent-mint transition-colors"
                title="Edit Address"
              >
                ✏️
              </button>
            </div>
          </div>

          {/* Billing Address toggle (Image 2) */}
          <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Billing Address</h3>
            
            <div className="flex items-center justify-between p-2.5 bg-darkBg/30 border border-darkBg-border/40 rounded-lg">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 leading-relaxed block">
                  If enabled, it will make Billing and Delivery address the same
                </span>
              </div>
              
              {/* Sliding Switch representation */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-mint"></div>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RENTAL SUMMARY & CONFIRM CHECKOUT (Excalidraw Image 2) */}
        <div className="lg:col-span-5 rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass flex flex-col justify-between min-h-[480px]">
          
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-darkBg-border/50">
              Rental Summary
            </h3>

            {/* Cart item display with period dates (Image 2) */}
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.cartItemId} className="p-3.5 bg-darkBg border border-darkBg-border rounded-lg flex gap-3.5 relative">
                  
                  {/* Cart Item image placeholder block */}
                  <div className="h-14 w-14 rounded bg-darkBg-card border border-darkBg-border flex items-center justify-center text-gray-500 font-bold">
                    📦
                  </div>

                  <div className="flex-1 space-y-1 text-[11px]">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-white">{item.product.name}</span>
                      <span className="text-accent-mint font-extrabold">${item.priceRate || item.product?.price?.day || item.product?.sales_price || 0}/day</span>
                    </div>
                    
                    <div className="text-[10px] text-gray-400 space-y-0.5">
                      <p>Rental Period: <span className="font-bold text-gray-300">{item.rentalPeriod?.start || '2026-01-01'} to {item.rentalPeriod?.end || '2026-01-08'}</span></p>
                      <p>Today and time to end date and time: <span className="font-semibold text-gray-400">Jan 1, 2026 10:00 AM &rarr; Jan 8, 2026 10:00 AM</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stripe Pre-Authorization Security Deposit Hold Indicator */}
            <div className="rounded-lg bg-indigo-950/40 border border-indigo-500/30 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-white">Stripe Pre-Authorization</span>
              </div>
              <span className="text-[11px] font-mono text-indigo-300 font-semibold bg-indigo-900/50 px-2 py-0.5 rounded border border-indigo-400/30">
                $150.00 Security Deposit Hold
              </span>
            </div>

            {/* Billing details grid */}
            <div className="border-t border-darkBg-border/40 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Delivery Charges:</span>
                <span className="text-white font-bold">{deliveryCharge === 0 ? 'Free' : convertPrice(deliveryCharge).formatted}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Sub Total:</span>
                <span className="text-white font-bold">{convertPrice(subtotal).formatted}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-accent-mint font-bold">
                  <span>Discount:</span>
                  <span>-{convertPrice(discountAmount).formatted}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-extrabold text-sm border-t border-darkBg-border/40 pt-2.5">
                <span>Total:</span>
                <span className="text-accent-mint">{convertPrice(totalAmount).formatted}</span>
              </div>
            </div>
          </div>

          {/* Action Confirmed button and Separator back to cart (Image 2) */}
          <div className="space-y-4 pt-4">
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="w-full text-center py-3 bg-accent-mint hover:bg-accent-mintLight text-darkBg font-extrabold rounded-lg text-xs tracking-wider uppercase transition-colors shadow-glow-subtle"
            >
              Confirmed &gt;
            </button>

            {/* Separator OR */}
            <div className="flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase tracking-widest gap-3">
              <span className="h-px bg-darkBg-border/60 flex-1"></span>
              <span>OR</span>
              <span className="h-px bg-darkBg-border/60 flex-1"></span>
            </div>

            {/* Back to Cart link */}
            <button
              type="button"
              onClick={() => setCurrentView('cart')}
              className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-center space-x-1.5 py-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Cart</span>
            </button>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* ============ EXPRESS CHECKOUT MODAL POPUP ============ */}
      {/* ======================================================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          
          <div className="w-full max-w-xl bg-darkBg border border-darkBg-border rounded-xl shadow-2xl glass overflow-hidden text-xs text-gray-300">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4.5 border-b border-darkBg-border bg-darkBg-card">
              <span className="text-sm font-extrabold text-white uppercase tracking-wider">Express Checkout</span>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePayNowSubmit} className="p-6 space-y-4">
              
              {/* Card Details input (Image 1) */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Card Details</label>
                <input
                  type="text"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  required
                />
              </div>

              {/* Form Grid columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Inputs */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Address</label>
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="123 Cyberpunk Boulevard"
                      className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      required
                    />
                  </div>
                </div>

                {/* Right Inputs */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Email</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Address (Line 2)</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Suite 404"
                      className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom 3-column row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Zip Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="94103"
                    className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                    required
                  />
                </div>
              </div>

              {/* Pay Now Submit Button (Image 1) */}
              <div className="flex justify-end pt-3 border-t border-darkBg-border/40">
                <button
                  type="submit"
                  className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-glow-subtle"
                >
                  Pay Now
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}
