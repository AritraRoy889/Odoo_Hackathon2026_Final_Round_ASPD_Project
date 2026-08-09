import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Plus, Minus, CreditCard, Sparkles, X } from 'lucide-react';

export default function CartView() {
  const {
    cart,
    user,
    updateCartQty,
    removeFromCart,
    couponCode,
    setCouponCode,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    deliveryCharge,
    discountAmount,
    totalAmount,
    setCurrentView,
    setSelectedOrderId,
    finalizeOrder,
    triggerNotification
  } = useApp();

  const isStaff = user && (user.role === 'ADMIN' || user.role === 'VENDOR');

  // Express Checkout Popup State (pre-populated for 1-click payment)
  const [expressOpen, setExpressOpen] = useState(false);
  const [expCard, setExpCard] = useState('4242 4242 4242 4242');
  const [expName, setExpName] = useState(user?.name || 'Alex Mercer');
  const [expEmail, setExpEmail] = useState(user?.email || 'alex.m@example.com');
  const [expAddress, setExpAddress] = useState('123 Main Street Address');
  const [expZip, setExpZip] = useState('94103');
  const [expCity, setExpCity] = useState('San Francisco');
  const [expCountry, setExpCountry] = useState('United States');

  // Staged Rental Period selectors
  const [startDate, setStartDate] = useState('2026-01-05');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('2026-01-11');
  const [endTime, setEndTime] = useState('18:00');

  const handleStandardCheckoutNav = () => {
    setCurrentView('checkout');
  };

  const handleExpressSubmit = (e) => {
    e.preventDefault();

    const cardVal  = expCard.trim() || '4242 4242 4242 4242';
    const nameVal  = expName.trim() || user?.name || 'Alex Mercer';
    const emailVal = expEmail.trim() || user?.email || 'alex.m@example.com';
    const addrVal  = expAddress.trim() || '123 Main Street Address';
    const zipVal   = expZip.trim() || '94103';
    const cityVal  = expCity.trim() || 'San Francisco';

    const tempAddress = {
      fullName: nameVal,
      email: emailVal,
      phone: '+1 (555) 000-0000',
      addressLine: addrVal,
      city: cityVal,
      zipCode: zipVal,
      country: expCountry
    };

    const orderId = finalizeOrder(tempAddress, {
      cardNumber: cardVal,
      cardName: nameVal,
      expiry: '12/28',
      cvv: '123',
      saveCard: false
    });

    if (orderId) {
      setExpressOpen(false);
      setSelectedOrderId(orderId);
      triggerNotification('Payment successful! Order confirmed.', 'success');
      setCurrentView('order-confirmation');
    } else {
      triggerNotification('Failed to process payment. Please try again.', 'error');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-darkBg-border rounded-2xl bg-darkBg-card/50 text-center glass min-h-[420px] animate-fade-in text-gray-400 text-xs">
        <div className="h-16 w-16 bg-darkBg-hover rounded-2xl flex items-center justify-center border border-darkBg-border/60 mb-4 shadow-glow-subtle">
          <ShoppingBag className="h-8 w-8 text-accent-teal" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-display">Your Cart is Currently Empty</h3>
        <p className="text-xs text-gray-400 mb-6 max-w-md">
          No staged items in your cart. Add products from the catalog to build a new quotation or order.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setCurrentView('storefront')}
            className="rounded-xl bg-accent-teal px-6 py-2.5 font-extrabold text-darkBg hover:bg-accent-tealLight transition-all shadow-glow-subtle uppercase tracking-wider text-xs cursor-pointer"
          >
            Explore Catalog
          </button>
          {isStaff && (
            <button
              onClick={() => setCurrentView('admin')}
              className="rounded-xl border border-darkBg-border bg-darkBg px-6 py-2.5 font-bold text-gray-300 hover:text-white hover:border-gray-500 transition-all uppercase tracking-wider text-xs cursor-pointer"
            >
              Back to Admin Panel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-xs text-gray-300">
      
      {/* LEFT COLUMN: ORDER SUMMARY & CONTINUE SHOPPING (Excalidraw Image 4) */}
      <div className="lg:col-span-8 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-darkBg-border pb-2 flex justify-between items-center uppercase tracking-wider">
          <span>Order Summary</span>
          <span className="text-xs text-gray-500">({cart.length} Products)</span>
        </h3>
        
        <div className="space-y-4">
          {cart.map((item) => (
            <div 
              key={item.cartItemId}
              className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-darkBg-border bg-darkBg-card hover:border-darkBg-border/80 glass transition-all sm:items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-darkBg border border-darkBg-border/50 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Product Name & Date rentals */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{item.product.name}</h4>
                  <p className="text-accent-mint font-bold">${item.priceRate || item.product?.price?.day || item.product?.sales_price || 0}/day</p>
                  
                  <div className="text-[10px] text-gray-400">
                    <span className="block">Date and time for which the product is rented:</span>
                    <span className="font-semibold text-gray-300">
                      {item.rentalPeriod?.start || '2026-01-05'} &rarr; {item.rentalPeriod?.end || '2026-01-11'}
                    </span>
                  </div>

                  {/* Remove and Save for Later links below the item details (Image 4) */}
                  <div className="flex items-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        removeFromCart(item.cartItemId);
                        triggerNotification('Item removed from cart', 'info');
                      }}
                      className="text-[10px] text-gray-500 hover:text-red-400 font-bold uppercase transition-colors mr-3.5 hover:underline"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerNotification('Saved for Later staging!', 'info')}
                      className="text-[10px] text-gray-500 hover:text-accent-mint font-bold uppercase transition-colors hover:underline"
                    >
                      Save for Later
                    </button>
                  </div>
                </div>
              </div>

              {/* Quantity Counter in the middle-right */}
              <div className="flex items-center space-x-2 border border-darkBg-border rounded-lg bg-darkBg p-1 w-fit">
                <button
                  type="button"
                  onClick={() => updateCartQty(item.cartItemId, -1)}
                  className="p-1 text-gray-400 hover:text-white rounded hover:bg-darkBg-hover"
                >
                  <Minus className="h-2.5 w-2.5" />
                </button>
                <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateCartQty(item.cartItemId, 1)}
                  className="p-1 text-gray-400 hover:text-white rounded hover:bg-darkBg-hover"
                >
                  <Plus className="h-2.5 w-2.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Continue Shopping button matching Image 4 */}
        <button
          type="button"
          onClick={() => setCurrentView('storefront')}
          className="px-6 py-2.5 border border-darkBg-border bg-darkBg hover:bg-darkBg-hover rounded text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          Continue Shopping &gt;
        </button>
      </div>

      {/* RIGHT COLUMN: RENTAL PERIOD SELECTORS & CALCULATIONS (Excalidraw Image 4) */}
      <div className="lg:col-span-4 space-y-6">
        <h3 className="text-sm font-bold text-white border-b border-darkBg-border pb-2 uppercase tracking-wider">
          Rental Configuration
        </h3>

        <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-5 space-y-5 glass">
          
          {/* Date pickers (Image 4) */}
          <div className="space-y-3.5 border-b border-darkBg-border/50 pb-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Rental Period
            </label>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold block">Start Date &amp; Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded border border-darkBg-border bg-darkBg p-1.5 text-[11px] text-white outline-none focus:border-accent-mint"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded border border-darkBg-border bg-darkBg p-1.5 text-[11px] text-white outline-none focus:border-accent-mint"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold block">End Date &amp; Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded border border-darkBg-border bg-darkBg p-1.5 text-[11px] text-white outline-none focus:border-accent-mint"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="rounded border border-darkBg-border bg-darkBg p-1.5 text-[11px] text-white outline-none focus:border-accent-mint"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing calculations */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-400 font-semibold">
              <span>Delivery Charges:</span>
              <span className="text-white font-bold">{deliveryCharge === 0 ? 'Free' : `$${Number(deliveryCharge || 0).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-400 font-semibold">
              <span>Sub Total:</span>
              <span className="text-white font-bold">${Number(subtotal || 0).toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-accent-mint font-bold">
                <span>Discount deductions:</span>
                <span>-${Number(discountAmount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-darkBg-border/50 pt-2.5 mt-2 flex justify-between items-center text-sm font-extrabold">
              <span className="text-white">Total:</span>
              <span className="text-accent-mint">${Number(totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Dynamic Apply Coupon input forms */}
          <div className="border-t border-darkBg-border/50 pt-4 space-y-3">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-accent-mint/10 border border-accent-mint/30 p-3 rounded-lg text-xs text-accent-mint font-bold animate-fade-in shadow-glow-subtle">
                <span className="flex items-center space-x-1.5">
                  <span>🎉</span>
                  <span>Code: {appliedCoupon.code} ({appliedCoupon.discountPercent}% OFF)</span>
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-red-400 hover:text-red-300 underline text-[11px] font-extrabold uppercase transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="COUPON CODE (E.G. SAVINGS)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyCoupon(couponCode);
                    }
                  }}
                  className="w-full rounded-lg border border-darkBg-border bg-darkBg p-2.5 text-xs text-white uppercase outline-none focus:border-accent-mint tracking-wider font-semibold"
                />
                
                {/* Apply Coupon green button */}
                <button
                  type="button"
                  onClick={() => applyCoupon(couponCode)}
                  className="w-full text-center py-2.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs text-white font-extrabold tracking-wider transition-all shadow-glow-subtle uppercase cursor-pointer"
                >
                  Apply Coupon
                </button>
              </div>
            )}
          </div>

          {/* Checkout action buttons */}
          <div className="space-y-2.5 pt-2 border-t border-darkBg-border/40">
            <button
              type="button"
              onClick={() => setExpressOpen(true)}
              className="w-full flex items-center justify-center space-x-1.5 rounded border border-darkBg-border hover:border-accent-mint py-2.5 font-bold transition-colors text-xs text-white uppercase"
            >
              <Sparkles className="h-4 w-4 text-accent-mint" />
              <span>Pay with Save Card</span>
            </button>

            <button
              type="button"
              onClick={handleStandardCheckoutNav}
              className="w-full flex items-center justify-center space-x-1.5 rounded border border-darkBg-border hover:border-accent-mint py-2.5 font-bold transition-colors text-xs text-white uppercase bg-darkBg-card hover:bg-darkBg-hover"
            >
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span>Checkout</span>
            </button>
          </div>

        </div>
      </div>

      {/* --- EXPRESS CHECKOUT POPUP BOX (Excalidraw Image 1) --- */}
      {expressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm animate-fade-in no-print">
          <div className="relative w-full max-w-lg rounded-xl border border-darkBg-border bg-darkBg-card p-6 shadow-glow-lg animate-slide-up glass-premium text-xs text-gray-300">
            
            {/* Header */}
            <button
              type="button"
              onClick={() => setExpressOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-extrabold text-white">Express Checkout</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Fill in credentials to settle billing instantly.</p>
            </div>

            <form onSubmit={handleExpressSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Card Details</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={expCard}
                  onChange={(e) => setExpCard(e.target.value)}
                  className="w-full rounded bg-darkBg border border-darkBg-border p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Name</label>
                  <input
                    type="text"
                    placeholder="Alex Mercer"
                    value={expName}
                    onChange={(e) => setExpName(e.target.value)}
                    className="w-full rounded bg-darkBg border border-darkBg-border p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Email</label>
                  <input
                    type="email"
                    placeholder="alex@company.com"
                    value={expEmail}
                    onChange={(e) => setExpEmail(e.target.value)}
                    className="w-full rounded bg-darkBg border border-darkBg-border p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Address</label>
                <input
                  type="text"
                  placeholder="123 Main Street Address"
                  value={expAddress}
                  onChange={(e) => setExpAddress(e.target.value)}
                  className="w-full rounded bg-darkBg border border-darkBg-border p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Zip Code</label>
                  <input
                    type="text"
                    placeholder="94103"
                    value={expZip}
                    onChange={(e) => setExpZip(e.target.value)}
                    className="w-full rounded bg-darkBg border border-darkBg-border p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">City</label>
                  <input
                    type="text"
                    placeholder="San Francisco"
                    value={expCity}
                    onChange={(e) => setExpCity(e.target.value)}
                    className="w-full rounded bg-darkBg border border-darkBg-border p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Country</label>
                  <input
                    type="text"
                    value={expCountry}
                    onChange={(e) => setExpCountry(e.target.value)}
                    className="w-full rounded bg-darkBg border border-darkBg-border p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  />
                </div>
              </div>

              {/* Total calculations & pay */}
              <div className="flex justify-between items-center border-t border-darkBg-border/40 pt-4 mt-5">
                <div>
                  <p className="text-gray-400 text-[10px]">Due amount:</p>
                  <p className="text-sm font-extrabold text-accent-mint">${Number(totalAmount || 0).toFixed(2)}</p>
                </div>
                
                <button
                  type="submit"
                  className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-glow-subtle uppercase text-xs tracking-wider"
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
