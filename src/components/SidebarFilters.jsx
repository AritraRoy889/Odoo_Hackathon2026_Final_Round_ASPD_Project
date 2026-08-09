import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Filter, RotateCcw, ChevronDown, ChevronUp, Tag, Palette, Clock, DollarSign } from 'lucide-react';

const AVAILABLE_BRANDS = ['AetherWave', 'LuxeForm', 'Optix', 'ComfortMax', 'SysMax'];
const AVAILABLE_COLORS = [
  { name: 'black',  hex: '#111827', label: 'Obsidian' },
  { name: 'silver', hex: '#C4C4C4', label: 'Silver' },
  { name: 'white',  hex: '#F3F4F6', label: 'White' },
  { name: 'grey',   hex: '#6B7280', label: 'Slate' },
  { name: 'navy',   hex: '#1E3A8A', label: 'Navy' },
  { name: 'beige',  hex: '#D4C5A9', label: 'Beige' },
  { name: 'brown',  hex: '#92400E', label: 'Cognac' },
];

const DURATION_OPTIONS = [
  { value: 'hour', label: 'Hour', icon: '⚡' },
  { value: 'day',  label: 'Day',  icon: '☀️' },
  { value: 'month',label: 'Month',icon: '📅' },
];

function Section({ icon: Icon, title, open, onToggle, children }) {
  return (
    <div className="border-b border-[#1C2438]/60 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3.5 text-left group"
      >
        <div className="flex items-center space-x-2">
          <Icon className="h-3.5 w-3.5 text-accent-teal" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300 group-hover:text-white transition-colors">
            {title}
          </span>
        </div>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
          : <ChevronDown className="h-3.5 w-3.5 text-gray-500" />}
      </button>
      {open && <div className="pb-4 animate-fade-in">{children}</div>}
    </div>
  );
}

export default function SidebarFilters() {
  const { filters, setFilters } = useApp();

  const [brandOpen,    setBrandOpen]    = useState(true);
  const [colorOpen,    setColorOpen]    = useState(true);
  const [durationOpen, setDurationOpen] = useState(true);
  const [priceOpen,    setPriceOpen]    = useState(true);

  const handleBrandChange = (brand) => {
    const updated = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    setFilters({ ...filters, brands: updated });
  };

  const handleColorToggle = (colorName) => {
    const updated = filters.colors.includes(colorName)
      ? filters.colors.filter(c => c !== colorName)
      : [...filters.colors, colorName];
    setFilters({ ...filters, colors: updated });
  };

  const handleDurationChange = (val) => setFilters({ ...filters, duration: val });

  const handlePriceChange = (index, value) => {
    const range = [...filters.priceRange];
    range[index] = Math.max(0, Math.min(25000, Number(value)));
    if (index === 0 && range[0] > range[1]) range[0] = range[1];
    if (index === 1 && range[1] < range[0]) range[1] = range[0];
    setFilters({ ...filters, priceRange: range });
  };

  const resetFilters = () => {
    setFilters({ brands: [], colors: [], duration: 'day', priceRange: [0, 25000] });
  };

  const activeCount = filters.brands.length + filters.colors.length +
    (filters.duration !== 'day' ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 25000 ? 1 : 0);

  const priceRangePct = [
    (filters.priceRange[0] / 25000) * 100,
    (filters.priceRange[1] / 25000) * 100,
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="glass-premium rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1C2438]">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-accent-teal" />
            <span className="text-sm font-bold text-white font-display">Filters</span>
            {activeCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-accent-violet text-white text-[10px] font-extrabold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 text-[10px] font-bold text-gray-500 hover:text-accent-teal transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="px-4">

          {/* ── BRAND ── */}
          <Section icon={Tag} title="Brand" open={brandOpen} onToggle={() => setBrandOpen(!brandOpen)}>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_BRANDS.map(brand => {
                const active = filters.brands.includes(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => handleBrandChange(brand)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      active
                        ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40 shadow-glow-subtle'
                        : 'bg-[#0D1117] text-gray-400 border border-[#1C2438] hover:text-white hover:border-[#2A3555]'
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ── COLOR ── */}
          <Section icon={Palette} title="Color" open={colorOpen} onToggle={() => setColorOpen(!colorOpen)}>
            <div className="flex flex-wrap gap-2.5">
              {AVAILABLE_COLORS.map(color => {
                const active = filters.colors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorToggle(color.name)}
                    title={color.label}
                    className={`relative h-7 w-7 rounded-full border-2 transition-all duration-200 ${
                      active
                        ? 'border-accent-teal scale-110 shadow-[0_0_8px_rgba(0,229,176,0.6)]'
                        : 'border-transparent hover:border-white/40 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {active && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke={color.name === 'white' || color.name === 'silver' || color.name === 'beige' ? '#06070F' : '#fff'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {filters.colors.length > 0 && (
              <p className="mt-2 text-[10px] text-gray-500">
                {filters.colors.map(c => AVAILABLE_COLORS.find(x => x.name === c)?.label).join(', ')}
              </p>
            )}
          </Section>

          {/* ── DURATION ── */}
          <Section icon={Clock} title="Duration" open={durationOpen} onToggle={() => setDurationOpen(!durationOpen)}>
            <div className="flex rounded-xl border border-[#1C2438] overflow-hidden bg-[#0D1117] p-0.5 gap-0.5">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleDurationChange(opt.value)}
                  className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all ${
                    filters.duration === opt.value
                      ? 'bg-accent-teal text-darkBg shadow-glow-subtle'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-base leading-none mb-0.5">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* ── PRICE RANGE ── */}
          <Section icon={DollarSign} title="Price Range" open={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
            {/* Gradient track */}
            <div className="slider-track mb-4 mt-1 mx-1">
              <div
                className="slider-range"
                style={{ left: `${priceRangePct[0]}%`, width: `${priceRangePct[1] - priceRangePct[0]}%` }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Min</label>
                <div className="flex items-center bg-[#0D1117] border border-[#1C2438] rounded-lg px-2.5 py-1.5 focus-within:border-accent-teal/50 transition-colors">
                  <span className="text-[10px] text-gray-500 mr-1">$</span>
                  <input
                    type="number"
                    min={0} max={25000}
                    value={filters.priceRange[0]}
                    onChange={e => handlePriceChange(0, e.target.value)}
                    className="w-full bg-transparent text-xs text-white price-mono outline-none"
                  />
                </div>
              </div>
              <div className="text-gray-600 text-xs mt-3">—</div>
              <div className="flex-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Max</label>
                <div className="flex items-center bg-[#0D1117] border border-[#1C2438] rounded-lg px-2.5 py-1.5 focus-within:border-accent-teal/50 transition-colors">
                  <span className="text-[10px] text-gray-500 mr-1">$</span>
                  <input
                    type="number"
                    min={0} max={25000}
                    value={filters.priceRange[1]}
                    onChange={e => handlePriceChange(1, e.target.value)}
                    className="w-full bg-transparent text-xs text-white price-mono outline-none"
                  />
                </div>
              </div>
            </div>
          </Section>

        </div>

        {/* Footer pill */}
        <div className="px-4 py-3 border-t border-[#1C2438]/60">
          <div className="text-[10px] text-gray-600 text-center font-medium">
            Filters applied in real-time
          </div>
        </div>
      </div>
    </aside>
  );
}
