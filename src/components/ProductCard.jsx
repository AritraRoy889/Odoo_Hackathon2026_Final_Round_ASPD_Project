import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart, Zap, CheckCircle } from 'lucide-react';

export default function ProductCard({ product, onConfigure }) {
  const { wishlist, toggleWishlist, addToCart, filters, convertPrice } = useApp();
  const [addLoading, setAddLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  const currentRate = filters.duration;
  const ratePrice = product.price?.[currentRate] ?? product.sales_price ?? 0;
  const rateLabel = currentRate === 'hour' ? '/hr' : currentRate === 'day' ? '/day' : '/mo';
  const { formatted } = convertPrice(ratePrice);

  // Stock percentage
  const maxStock = 100;
  const stockPct = Math.min(((product.stock_quantity ?? 10) / maxStock) * 100, 100);
  const stockColor = stockPct > 30 ? 'from-accent-teal to-accent-tealDark' : stockPct > 10 ? 'from-accent-gold to-yellow-600' : 'from-red-500 to-red-700';

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock || addLoading) return;

    if (product.hasVariants) {
      onConfigure(product);
    } else {
      setAddLoading(true);
      setTimeout(() => {
        const start = new Date().toISOString().split('T')[0];
        const end = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        addToCart(product, {}, { start, end }, 1, ratePrice, ratePrice);
        setAddLoading(false);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }, 300);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[#1C2438] bg-[#0D1117] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-teal/30 hover:shadow-card-hover">

      {/* Shimmer overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shimmer-card z-10" />

      {/* Wishlist button */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-[#06070F]/70 backdrop-blur-sm border border-[#1C2438] text-gray-400 hover:border-red-500/50 hover:text-red-400 transition-all"
      >
        <Heart className={`h-3.5 w-3.5 transition-all ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
      </button>

      {/* Image area */}
      <div className="relative w-full overflow-hidden bg-[#06070F]" style={{ aspectRatio: '4/3' }}>
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Hover teal-violet gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070F] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(135deg, rgba(0,229,176,0.08) 0%, rgba(124,58,237,0.08) 100%)' }}
        />

        {/* Category badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold glass-teal text-accent-teal uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Out of Stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: 'rgba(6,7,15,0.85)', backdropFilter: 'blur(3px)' }}>
            <div className="flex flex-col items-center space-y-1">
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/40">
                <span className="text-lg">🚫</span>
              </div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Out of Stock</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">

        {/* Brand + Colors */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold tracking-wider text-accent-teal uppercase">
            {product.brand}
          </span>
          {product.colors?.length > 0 && (
            <div className="flex space-x-1">
              {product.colors.slice(0, 4).map(color => {
                const hexMap = { black: '#1F2937', silver: '#C4C4C4', white: '#F3F4F6', grey: '#6B7280', navy: '#1E3A8A', beige: '#D4C5A9', brown: '#92400E' };
                return (
                  <span key={color} className="h-3 w-3 rounded-full border border-white/10"
                    style={{ backgroundColor: hexMap[color] || '#4B5563' }} title={color} />
                );
              })}
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-white group-hover:text-accent-teal transition-colors line-clamp-1 mb-1 font-display">
          {product.name}
        </h4>

        {/* Multi-rate pills */}
        <div className="flex items-center flex-wrap gap-1 mb-3">
          {['hour', 'day', 'month'].map(unit => {
            const val = product.price?.[unit];
            if (!val) return null;
            const label = unit === 'hour' ? 'hr' : unit === 'day' ? 'day' : 'mo';
            const isActive = currentRate === unit;
            return (
              <span key={unit} className={`price-mono text-[10px] px-2 py-0.5 rounded-md transition-all ${
                isActive ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/30 font-bold' : 'text-gray-600 border border-[#1C2438]'
              }`}>
                ${val}/{label}
              </span>
            );
          })}
        </div>

        {/* Stock bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-gray-600 mb-1">
            <span>Stock</span>
            <span className={stockPct <= 10 ? 'text-red-400 font-bold' : stockPct <= 30 ? 'text-accent-gold' : 'text-gray-500'}>
              {product.stock_quantity ?? 10} units
            </span>
          </div>
          <div className="h-1 w-full bg-[#1C2438] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${stockColor} transition-all duration-500`}
              style={{ width: `${stockPct}%` }}
            />
          </div>
        </div>

        {/* Price + Action */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#1C2438]/50">
          <div>
            <p className="text-[10px] text-gray-500 mb-0.5">Rental Rate</p>
            <p className="price-mono text-base font-bold text-white">
              {formatted}
              <span className="text-xs font-medium text-gray-500 ml-0.5">{rateLabel}</span>
            </p>
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={isOutOfStock || addLoading}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all ${
              isOutOfStock
                ? 'bg-[#1C2438] text-gray-600 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : addLoading
                ? 'bg-accent-teal/20 text-accent-teal cursor-wait'
                : 'bg-gradient-to-r from-accent-teal to-accent-tealDark text-darkBg hover:shadow-glow hover:scale-105'
            }`}
          >
            {justAdded ? (
              <><CheckCircle className="h-3.5 w-3.5" /><span>Added!</span></>
            ) : addLoading ? (
              <><div className="h-3.5 w-3.5 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" /></>
            ) : (
              <>
                {product.hasVariants ? <Zap className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                <span>{product.hasVariants ? 'Configure' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
