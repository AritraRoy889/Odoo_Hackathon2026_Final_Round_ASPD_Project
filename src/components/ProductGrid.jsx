import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

export default function ProductGrid({ onConfigureProduct }) {
  const { products, searchQuery, filters } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Kept at 3 to demonstrate pagination with our 4-item catalog

  // Apply filters dynamically
  const filteredProducts = products.filter((product) => {
    // 1. Search Query filter (matches name, brand, or category)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match = 
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. Brand Checkboxes filter
    if (filters.brands.length > 0) {
      if (!filters.brands.includes(product.brand)) return false;
    }

    // 3. Color Swatches filter (matches any color variant on the card)
    if (filters.colors.length > 0) {
      const hasMatchingColor = product.colors && product.colors.some((color) => 
        filters.colors.includes(color)
      );
      if (!hasMatchingColor) return false;
    }

    // 4. Price slider filter (against selected rate tier: hour, day, month)
    const activeRatePrice = (product.price && product.price[filters.duration] !== undefined)
      ? product.price[filters.duration]
      : (product.sales_price || 0);
    if (activeRatePrice < filters.priceRange[0] || activeRatePrice > filters.priceRange[1]) {
      return false;
    }

    return true;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Pagination bounds calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex-1 space-y-6">
      
      {/* Search status bar */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <p>
          Showing <span className="text-white font-semibold">{totalItems === 0 ? 0 : startIndex + 1}</span>-
          <span className="text-white font-semibold">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
          <span className="text-white font-semibold">{totalItems}</span> matching products
        </p>
        {filters.brands.length > 0 || filters.colors.length > 0 || searchQuery !== '' ? (
          <span className="text-accent-mint animate-pulse font-medium">Filters Active</span>
        ) : null}
      </div>

      {/* Grid of Product Cards */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onConfigure={onConfigureProduct} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-darkBg-border rounded-xl bg-darkBg-card/50 text-center glass min-h-[300px]">
          <HelpCircle className="h-10 w-10 text-gray-500 mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Matching Items</h4>
          <p className="text-xs text-gray-400 max-w-xs">
            Adjust your price sliders, colors, or brands in the left sidebar to discover available rentals.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-darkBg-border/50">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border border-darkBg-border text-gray-400 transition-colors ${
              currentPage === 1 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:text-white hover:bg-darkBg-hover hover:border-accent-mint'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-xs text-gray-300 font-medium">
            Page <span className="text-white font-bold">{currentPage}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border border-darkBg-border text-gray-400 transition-colors ${
              currentPage === totalPages 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:text-white hover:bg-darkBg-hover hover:border-accent-mint'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
}
