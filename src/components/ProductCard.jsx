import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onConfigure }) {
  const { wishlist, toggleWishlist, addToCart, filters, convertPrice } = useApp();

  const isWishlisted = wishlist.includes(product.id);
  const isOutOfStock = (product.stock !== undefined ? product.stock === 0 : (product.stock_quantity !== undefined ? product.stock_quantity <= 0 : false));

  // Choose rate based on selected filter
  const currentRate = filters.duration; // hour, day, month
  const ratePrice = (product.price && product.price[currentRate] !== undefined)
    ? product.price[currentRate]
    : (product.sales_price || 0);
  const rateLabel = currentRate === 'hour' ? '/ hr' : currentRate === 'day' ? '/ day' : '/ mo';

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    if (product.hasVariants) {
      onConfigure(product); // Trigger configuration modal
    } else {
      // Standard direct add
      // Default dummy date range (today to tomorrow)
      const start = new Date().toISOString().split('T')[0];
      const end = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      addToCart(
        product,
        {},
        { start, end },
        1, // 1 day
        ratePrice,
        ratePrice
      );
    }
  };

  // Color mapping helper
  const getColorHex = (c) => {
    const map = {
      black: '#1F2937',
      silver: '#D1D5DB',
      white: '#FFFFFF',
      grey: '#9CA3AF',
      navy: '#1E3A8A',
      beige: '#F5F5DC',
      brown: '#78350F'
    };
    return map[c] || '#4B5563';
  };

  return (
    <div className="relative flex flex-col rounded-xl border border-darkBg-border bg-darkBg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent-mint/40 hover:shadow-glow group">
      
      {/* Wishlist Button Overlay */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-darkBg/60 backdrop-blur-sm border border-darkBg-border text-gray-400 hover:text-white transition-colors"
      >
        <Heart className={`h-4.5 w-4.5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      {/* Image Area */}
      <div className="relative aspect-square w-full bg-darkBg overflow-hidden border-b border-darkBg-border/50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-[2px]">
            <span className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg animate-pulse">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-4">
        
        {/* Brand & Variant Indicator */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-accent-mint bg-accent-mint/10 px-2 py-0.5 rounded">
            {product.brand}
          </span>
          
          {/* Variant dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex space-x-1">
              {product.colors.map((color) => (
                <span
                  key={color}
                  className="h-2 w-2 rounded-full border border-darkBg/80 shadow-sm"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                ></span>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-white group-hover:text-accent-mint transition-colors line-clamp-1 mb-2">
          {product.name}
        </h4>

        {/* Info list */}
        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-4">
          <span className="capitalize">{product.category}</span>
          <span>•</span>
          <span>Stock: {product.stock_quantity ?? product.stock ?? 10} items</span>
        </div>

        {/* Pricing & Cart Action */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-darkBg-border/30">
          <div>
            <p className="text-[10px] text-gray-400 font-medium">Rental Rate</p>
            <p className="text-base font-extrabold text-white">
              {convertPrice(ratePrice).formatted}
              <span className="text-xs font-medium text-gray-400 ml-1">{rateLabel}</span>
            </p>
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
              isOutOfStock 
                ? 'bg-darkBg-border text-gray-500 cursor-not-allowed' 
                : 'bg-accent-mint text-darkBg hover:bg-accent-mintLight hover:shadow-glow-subtle'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{product.hasVariants ? 'Configure' : 'Add to Cart'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
