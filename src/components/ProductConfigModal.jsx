import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function ProductConfigModal({ product, isOpen, onClose }) {
  const { addToCart, convertPrice, triggerNotification } = useApp();

  // Track user variant selections
  const [selections, setSelections] = useState({});
  
  // Date time parameters
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('09:00');
  
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [endTime, setEndTime] = useState('18:00');

  // Rate tier toggle
  const [rateTier, setRateTier] = useState('day'); // hour, day, month
  
  // Real-time calculated duration and cost values
  const [duration, setDuration] = useState(1);
  const [totalCost, setTotalCost] = useState(0);

  // Initialize variants selections
  useEffect(() => {
    if (product.specs) {
      const initial = {};
      Object.keys(product.specs).forEach((key) => {
        initial[key] = product.specs[key][0];
      });
      setSelections(initial);
    }
  }, [product]);

  // Recalculate duration & pricing in real-time
  useEffect(() => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (isNaN(startDateTime) || isNaN(endDateTime)) return;

    const diffMs = endDateTime - startDateTime;
    if (diffMs <= 0) {
      setDuration(1);
      setTotalCost(0);
      return;
    }

    let calculatedDuration = 1;
    let baseRate = (product.price && product.price[rateTier] !== undefined)
      ? product.price[rateTier]
      : (product.sales_price || 0);

    // Check if variant has extra addon cost
    let addonCost = 0;
    Object.values(selections).forEach(val => {
      if (val && val.includes('(+ $')) {
        const match = val.match(/\(\+\s*\$(\d+)/);
        if (match) addonCost += Number(match[1]);
      }
    });

    const activeRate = baseRate + addonCost;

    if (rateTier === 'hour') {
      const diffHrs = diffMs / (1000 * 60 * 60);
      calculatedDuration = Math.max(1, Math.ceil(diffHrs));
    } else if (rateTier === 'day') {
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      calculatedDuration = Math.max(1, Math.ceil(diffDays));
    } else if (rateTier === 'month') {
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      calculatedDuration = Math.max(1, Math.ceil(diffDays / 30));
    }

    setDuration(calculatedDuration);
    setTotalCost(calculatedDuration * activeRate);
  }, [startDate, startTime, endDate, endTime, rateTier, selections, product]);

  const handleSelectOption = (specKey, optionVal) => {
    setSelections({ ...selections, [specKey]: optionVal });
  };

  const handleStagingSubmit = (e) => {
    e.preventDefault();

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    if (endDateTime <= startDateTime) {
      triggerNotification('End date & time must be after start date & time', 'error');
      return;
    }

    addToCart(
      product,
      selections,
      { start: `${startDate} ${startTime}`, end: `${endDate} ${endTime}` },
      duration,
      product.price[rateTier] + (totalCost / duration - product.price[rateTier]),
      totalCost
    );

    triggerNotification('Added configured variant item to cart', 'success');
    onClose();
  };

  // Guard: must come after all hooks
  if (!product || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-2xl rounded-xl border border-darkBg-border bg-darkBg-card p-6 shadow-glow-lg animate-slide-up glass-premium max-h-[90vh] overflow-y-auto text-xs text-gray-300">
        
        {/* Header (Image 2) */}
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-darkBg-border/55">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Configure</h3>
          
          {/* Boxed close button (Image 2) */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-2.5 rounded border border-darkBg-border bg-darkBg text-gray-400 hover:text-white hover:border-red-500 font-bold transition-all text-xs"
            title="Cancel"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleStagingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Variant details & Line-connected selectors */}
          <div className="space-y-6">
            
            <div className="aspect-video w-full rounded-lg bg-darkBg overflow-hidden border border-darkBg-border/50 relative flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-gray-300 font-bold">{product.name}</span>
            </div>

            {/* BWIP-JS Code128 Asset Barcode Tag */}
            <div className="p-2 rounded bg-white/90 text-center border border-darkBg-border">
              <img
                src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(product.id.toUpperCase())}`}
                alt="Code128 Asset Barcode"
                className="h-8 mx-auto"
              />
              <p className="text-[9px] font-mono text-gray-800 mt-1 font-bold">ASSET ID: {product.id.toUpperCase()}</p>
            </div>

            {/* Visual connected selectors block (Image 2) */}
            <div className="space-y-4">
              {product.specs && Object.keys(product.specs).map((specKey, specIdx) => {
                const specOptions = product.specs[specKey];
                
                // Style layout row 1 vs row 2 differently to match Image 2 connection styles
                const isLineConnectedCircle = specIdx === 0;

                return (
                  <div key={specKey} className="space-y-2 p-3 bg-darkBg/30 border border-darkBg-border/40 rounded-lg">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      {specKey} Selection
                    </label>

                    {isLineConnectedCircle ? (
                      /* Connected dots circle selector: O — O — O */
                      <div className="relative py-3 px-2 flex justify-between items-center">
                        <div className="absolute left-6 right-6 h-0.5 bg-darkBg-border/60 z-0 top-1/2 -translate-y-1/2"></div>
                        {specOptions.map((opt) => {
                          const isSelected = selections[specKey] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectOption(specKey, opt)}
                              className={`h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-extrabold border transition-all z-10 hover:scale-110 ${
                                isSelected
                                  ? 'bg-purple-600 border-purple-500 text-white shadow-glow-subtle'
                                  : 'bg-darkBg border-darkBg-border text-gray-400'
                              }`}
                              title={opt}
                            >
                              O
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Checkbox checkmark selector: ✓ — [ ] — ✓ */
                      <div className="relative py-3 px-2 flex justify-between items-center">
                        <div className="absolute left-6 right-6 h-0.5 bg-darkBg-border/60 z-0 top-1/2 -translate-y-1/2"></div>
                        {specOptions.map((opt) => {
                          const isSelected = selections[specKey] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectOption(specKey, opt)}
                              className={`h-7 w-7 rounded flex items-center justify-center text-[10px] font-extrabold border transition-all z-10 hover:scale-110 ${
                                isSelected
                                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-glow-subtle'
                                  : 'bg-darkBg border-darkBg-border text-gray-400'
                              }`}
                              title={opt}
                            >
                              {isSelected ? '✓' : ' '}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Selected option summary */}
                    <div className="text-[10px] text-gray-400 text-right font-semibold">
                      Selected: <span className="text-white">{selections[specKey] || 'None'}</span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Date Selection, Rate cards & Staging Cost calculations */}
          <div className="flex flex-col space-y-4 justify-between">
            
            {/* Rate Tiers */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Billing rate
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['hour', 'day', 'month'].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setRateTier(tier)}
                    className={`py-1.5 rounded text-xs font-bold uppercase transition-all border ${
                      rateTier === tier
                        ? 'bg-accent-mint/20 text-accent-mint border-accent-mint'
                        : 'bg-darkBg border-darkBg-border text-gray-400'
                    }`}
                  >
                    {tier === 'day' ? 'daily' : `${tier}ly`}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Period */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Commencement Start
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint"
                  required
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint"
                  required
                />
              </div>
            </div>

            {/* End Period */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Termination End
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint"
                  required
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint"
                  required
                />
              </div>
            </div>

            {/* Calculations review */}
            <div className="p-4 bg-darkBg border border-darkBg-border rounded-lg space-y-1 text-xs">
              <div className="flex justify-between items-center text-gray-400">
                <span>Calculated Duration:</span>
                <span className="text-white font-bold capitalize">
                  {duration} {rateTier}{duration > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Base price:</span>
                <span className="text-white font-bold">
                  {convertPrice(duration > 0 ? (totalCost / duration) : totalCost || 0).formatted} / {rateTier}
                </span>
              </div>
              <div className="border-t border-darkBg-border/50 my-2 pt-2 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-300">Total Cost:</span>
                <span className="text-base font-extrabold text-accent-mint flex items-center">
                  {convertPrice(totalCost || 0).formatted}
                </span>
              </div>
            </div>

            {/* Action buttons matching bottom left layout (Image 2) */}
            <div className="flex items-center space-x-3 pt-3 border-t border-darkBg-border/40">
              <button
                type="submit"
                className="px-6 py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-glow-subtle"
              >
                Configure
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded border border-darkBg-border bg-darkBg hover:bg-darkBg-hover text-gray-400 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
