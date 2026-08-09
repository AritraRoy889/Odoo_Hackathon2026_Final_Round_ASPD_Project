import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Photography'];

export default function ProductGrid({ onConfigureProduct }) {
  const { products, searchQuery, filters } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  const itemsPerPage = 6;

  const filteredProducts = products.filter((product) => {
    // Category tab filter
    if (activeCategory !== 'All' && product.category !== activeCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!product.name.toLowerCase().includes(q) &&
          !product.brand.toLowerCase().includes(q) &&
          !product.category.toLowerCase().includes(q)) return false;
    }

    // Brands
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;

    // Colors
    if (filters.colors.length > 0) {
      const match = product.colors?.some(c => filters.colors.includes(c));
      if (!match) return false;
    }

    // Price
    const price = product.price?.[filters.duration] ?? product.sales_price ?? 0;
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

    return true;
  });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters, activeCategory]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Count per category
  const getCategoryCount = (cat) =>
    cat === 'All' ? products.length : products.filter(p => p.category === cat).length;

  return (
    <div id="product-grid-section" className="flex-1 space-y-6 min-w-0">

      {/* ── Category Tabs ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 glass-premium rounded-xl p-1 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-accent-teal to-accent-tealDark text-darkBg shadow-glow-subtle'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                activeCategory === cat ? 'bg-darkBg/30 text-darkBg' : 'bg-[#1C2438] text-gray-500'
              }`}>
                {getCategoryCount(cat)}
              </span>
            </button>
          ))}
        </div>

        {/* Status info */}
        <div className="hidden sm:flex items-center space-x-2 text-[11px] text-gray-500">
          <SlidersHorizontal className="h-3 w-3" />
          <span>
            <span className="text-white font-bold">{totalItems}</span> results
            {searchQuery && <span className="text-accent-teal"> · "{searchQuery}"</span>}
          </span>
        </div>
      </div>

      {/* ── Product Grid ── */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginatedProducts.map((product, idx) => (
            <div
              key={product.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
            >
              <ProductCard
                product={product}
                onConfigure={onConfigureProduct}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[#1C2438] glass min-h-[300px] text-center animate-fade-in">
          <div className="h-16 w-16 rounded-2xl glass-teal flex items-center justify-center mb-4">
            <PackageSearch className="h-8 w-8 text-accent-teal" />
          </div>
          <h4 className="text-base font-bold text-white mb-2 font-display">No Items Found</h4>
          <p className="text-sm text-gray-500 max-w-xs">
            Try adjusting your filters or search query to find available rentals.
          </p>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#1C2438]/50">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-2.5 rounded-xl border transition-all ${
              currentPage === 1
                ? 'opacity-40 cursor-not-allowed border-[#1C2438] text-gray-600'
                : 'border-[#1C2438] text-gray-400 hover:text-white hover:border-accent-teal/40 hover:bg-accent-teal/5'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-accent-teal text-darkBg shadow-glow-subtle'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`p-2.5 rounded-xl border transition-all ${
              currentPage === totalPages
                ? 'opacity-40 cursor-not-allowed border-[#1C2438] text-gray-600'
                : 'border-[#1C2438] text-gray-400 hover:text-white hover:border-accent-teal/40 hover:bg-accent-teal/5'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
