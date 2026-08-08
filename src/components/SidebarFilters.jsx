import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Filter, RotateCcw } from 'lucide-react';

const AVAILABLE_BRANDS = ['AetherWave', 'LuxeForm', 'Optix', 'ComfortMax'];
const AVAILABLE_COLORS = [
  { name: 'black', hex: '#111827', label: 'Carbon Black' },
  { name: 'silver', hex: '#D1D5DB', label: 'Silver' },
  { name: 'white', hex: '#FFFFFF', label: 'White' },
  { name: 'grey', hex: '#6B7280', label: 'Grey' },
  { name: 'navy', hex: '#1E3A8A', label: 'Navy' },
  { name: 'beige', hex: '#F5F5DC', label: 'Beige' },
  { name: 'brown', hex: '#78350F', label: 'Brown' }
];

export default function SidebarFilters() {
  const { filters, setFilters } = useApp();

  // Collapsible toggle states (Excalidraw Image 17)
  const [brandOpen, setBrandOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [durationOpen, setDurationOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  // Custom long term duration state (Excalidraw Image 17 "All Duration")
  const [longDuration, setLongDuration] = useState('1 Month');

  const handleBrandChange = (brand) => {
    const isChecked = filters.brands.includes(brand);
    const updatedBrands = isChecked
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    setFilters({ ...filters, brands: updatedBrands });
  };

  const handleColorToggle = (colorName) => {
    const isSelected = filters.colors.includes(colorName);
    const updatedColors = isSelected
      ? filters.colors.filter((c) => c !== colorName)
      : [...filters.colors, colorName];
    setFilters({ ...filters, colors: updatedColors });
  };

  const handleDurationChange = (e) => {
    setFilters({ ...filters, duration: e.target.value });
  };

  const handlePriceChange = (index, value) => {
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = Math.max(0, Math.min(25000, Number(value)));
    if (index === 0 && newPriceRange[0] > newPriceRange[1]) {
      newPriceRange[0] = newPriceRange[1];
    } else if (index === 1 && newPriceRange[1] < newPriceRange[0]) {
      newPriceRange[1] = newPriceRange[0];
    }
    setFilters({ ...filters, priceRange: newPriceRange });
  };

  const resetFilters = () => {
    setFilters({
      brands: [],
      colors: [],
      duration: 'day',
      priceRange: [0, 25000]
    });
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 bg-darkBg-card border border-darkBg-border rounded-xl p-5 shadow-glow-subtle glass h-fit text-xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-darkBg-border">
        <h3 className="text-sm font-bold text-white flex items-center">
          <Filter className="mr-1.5 h-3.5 w-3.5 text-accent-mint" />
          Filter Inventory
        </h3>
        <button
          onClick={resetFilters}
          className="text-[10px] text-gray-400 hover:text-accent-mint transition-colors flex items-center"
        >
          <RotateCcw className="mr-1 h-2.5 w-2.5" />
          Reset
        </button>
      </div>

      {/* Brand Checkboxes (Collapsible) */}
      <div className="border-b border-darkBg-border/50 pb-3">
        <button
          type="button"
          onClick={() => setBrandOpen(!brandOpen)}
          className="flex justify-between items-center w-full font-bold text-gray-300 uppercase tracking-wider mb-2"
        >
          <span>Brand</span>
          <span>{brandOpen ? '−' : '+'}</span>
        </button>
        
        {brandOpen && (
          <div className="space-y-2 pt-1 animate-fade-in">
            {AVAILABLE_BRANDS.map((brand) => (
              <label key={brand} className="flex items-center space-x-3 cursor-pointer group text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="rounded border-darkBg-border bg-darkBg text-accent-mint focus:ring-accent-mint h-3.5 w-3.5 accent-accent-mint"
                />
                <span className="transition-colors group-hover:text-white">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Color Swatches (Collapsible) */}
      <div className="border-b border-darkBg-border/50 pb-3">
        <button
          type="button"
          onClick={() => setColorOpen(!colorOpen)}
          className="flex justify-between items-center w-full font-bold text-gray-300 uppercase tracking-wider mb-2"
        >
          <span>Color</span>
          <span>{colorOpen ? '−' : '+'}</span>
        </button>

        {colorOpen && (
          <div className="flex flex-wrap gap-2 pt-1 animate-fade-in">
            {AVAILABLE_COLORS.map((color) => {
              const isSelected = filters.colors.includes(color.name);
              return (
                <button
                  key={color.name}
                  onClick={() => handleColorToggle(color.name)}
                  type="button"
                  className={`relative h-6.5 w-6.5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected 
                      ? 'border-accent-mint scale-110 shadow-glow-subtle' 
                      : 'border-darkBg-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                >
                  {color.name === 'white' && <span className="h-1.5 w-1.5 rounded-full bg-black"></span>}
                  {isSelected && <span className={`h-1.5 w-1.5 rounded-full ${color.name === 'white' ? 'bg-accent-mintDark' : 'bg-white'}`}></span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Duration Selector (Collapsible) */}
      <div className="border-b border-darkBg-border/50 pb-3">
        <button
          type="button"
          onClick={() => setDurationOpen(!durationOpen)}
          className="flex justify-between items-center w-full font-bold text-gray-300 uppercase tracking-wider mb-2"
        >
          <span>Duration</span>
          <span>{durationOpen ? '−' : '+'}</span>
        </button>

        {durationOpen && (
          <div className="space-y-2 pt-1 animate-fade-in">
            <select
              value={filters.duration}
              onChange={handleDurationChange}
              className="w-full rounded-lg border border-darkBg-border bg-darkBg py-1.5 px-2 text-white outline-none focus:border-accent-mint"
            >
              <option value="hour">Hourly Rates</option>
              <option value="day">Daily Rates</option>
              <option value="month">Monthly Rates</option>
            </select>
          </div>
        )}
      </div>

      {/* Price Range Slider (Collapsible) */}
      <div className="border-b border-darkBg-border/50 pb-3">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex justify-between items-center w-full font-bold text-gray-300 uppercase tracking-wider mb-2"
        >
          <span>Price Range</span>
          <span>{priceOpen ? '−' : '+'}</span>
        </button>

        {priceOpen && (
          <div className="space-y-3 pt-1 animate-fade-in">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold block">Min Price: ${filters.priceRange[0]}</label>
              <input
                type="range"
                min={0}
                max={25000}
                step={100}
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="w-full h-1 bg-darkBg rounded-lg appearance-none cursor-pointer accent-accent-mint focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold block">Max Price: ${filters.priceRange[1]}</label>
              <input
                type="range"
                min={0}
                max={25000}
                step={100}
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="w-full h-1 bg-darkBg rounded-lg appearance-none cursor-pointer accent-accent-mint focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Long-Term All Duration Dropdown (Excalidraw Image 17) */}
      <div className="pt-2">
        <label className="text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">All Duration</label>
        <select
          value={longDuration}
          onChange={(e) => {
            setLongDuration(e.target.value);
            setFilters({ ...filters, duration: 'month' });
          }}
          className="w-full rounded-lg border border-accent-mint/30 bg-accent-mint/5 py-1.5 px-2 text-accent-mint font-semibold outline-none focus:border-accent-mint"
        >
          <option value="1 Month">1 Month</option>
          <option value="6 Month">6 Month</option>
          <option value="1 Year">1 Year</option>
          <option value="2 Years">2 Years</option>
        </select>
      </div>

    </aside>
  );
}
