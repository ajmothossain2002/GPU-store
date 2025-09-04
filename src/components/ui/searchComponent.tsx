"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "./button";
import { Product } from "../../type/product";

interface SearchComponentProps {
  allProducts: Product[];
  onSearchResults: (results: Product[]) => void;
  placeholder?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  allProducts,
  onSearchResults,
  placeholder = "Search products...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Perform client-side search and filtering
  const filteredProducts = useMemo(() => {
    let results = allProducts;

    if (searchTerm.trim()) {
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.category &&
            product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      results = results.filter((p) => p.price >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      results = results.filter((p) => p.price <= max);
    }

    return results;
  }, [searchTerm, minPrice, maxPrice, allProducts]);

  useEffect(() => {
    onSearchResults(filteredProducts);
  }, [filteredProducts, onSearchResults]);

  const clearSearch = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        {/* Search input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-2xl bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all duration-200"
        />

        {/* Clear search button */}
        {searchTerm && (
          <Button
            onClick={clearSearch}
            className="absolute inset-y-0 right-12 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </Button>
        )}

        {/* Filters toggle */}
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
            minPrice || maxPrice ? "text-cyan-600" : "text-gray-400"
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Min Price
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$0"
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-slate-700/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Max Price
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="$1000"
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-slate-700/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          {(minPrice || maxPrice) && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-cyan-400 hover:text-cyan-300"
            >
              Clear Price Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
