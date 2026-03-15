'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import { productsApi } from '@/lib/api';
import type { Product, ProductCategory, PaginatedResponse } from '@/types';
import {
  Search,
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  SlidersHorizontal,
  X,
} from 'lucide-react';

// Category color mapping
const CATEGORY_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  electronics: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    gradient: 'from-indigo-400 to-indigo-600',
  },
  clothing: {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    gradient: 'from-violet-400 to-violet-600',
  },
  food: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    gradient: 'from-amber-400 to-amber-600',
  },
  books: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    gradient: 'from-emerald-400 to-emerald-600',
  },
  home: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    gradient: 'from-sky-400 to-sky-600',
  },
  sports: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    gradient: 'from-orange-400 to-orange-600',
  },
  toys: {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    gradient: 'from-pink-400 to-pink-600',
  },
  other: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    gradient: 'from-slate-400 to-slate-600',
  },
};

const CATEGORIES: { value: ProductCategory | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home' },
  { value: 'sports', label: 'Sports' },
  { value: 'toys', label: 'Toys' },
  { value: 'other', label: 'Other' },
];

// INTENTIONAL ISSUE #2: Missing key prop on category filter buttons below.
// The CATEGORIES.map() renders buttons but omits the key={cat.value} prop.
// React cannot efficiently reconcile the list, causing potential rendering bugs
// and console warnings in development.

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isInCart: boolean;
}

function ProductCard({ product, onAddToCart, isInCart }: ProductCardProps) {
  const catColors = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.other;

  return (
    <div className="card overflow-hidden hover:shadow-lg transition-all duration-200 group flex flex-col">
      {/* Image placeholder */}
      <div className="relative aspect-square overflow-hidden">
        <div
          className={`w-full h-full bg-gradient-to-br ${catColors.gradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
        >
          <Package size={48} className="text-white/60" />
        </div>
        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${catColors.bg} ${catColors.text}`}
          >
            {product.category}
          </span>
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-3 right-3">
            <Badge variant="warning">Only {product.stock} left</Badge>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={11}
              className={
                i < Math.round(product.rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200 fill-slate-200'
              }
            />
          ))}
          <span className="text-xs text-slate-500 ml-1">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-lg font-bold text-indigo-600">
            ${Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 active:scale-95 ${
              isInCart
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : product.stock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [inStockOnly, setInStockOnly] = useState(false);
  const { addToCart, isInCart } = useCart();
  const ITEMS_PER_PAGE = 12;

  const hasActiveFilters = searchQuery || selectedCategory || inStockOnly;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = (await productsApi.getAll({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        inStock: inStockOnly || undefined,
      })) as PaginatedResponse<Product>;

      setProducts(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, inStockOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: ProductCategory | '') => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setInStockOnly(false);
    setCurrentPage(1);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
            <p className="text-sm text-slate-500 mt-1">
              {total > 0
                ? `${total.toLocaleString()} product${total !== 1 ? 's' : ''} found`
                : 'Browse our catalog'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="input pl-10"
              />
            </div>

            {/* In stock toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => {
                  setInStockOnly(!inStockOnly);
                  setCurrentPage(1);
                }}
                className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center relative cursor-pointer ${
                  inStockOnly ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 absolute ${
                    inStockOnly ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm text-slate-700 whitespace-nowrap font-medium">
                In stock only
              </span>
            </label>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>

          {/* Category pills — INTENTIONAL ISSUE #2: Missing key prop */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              // Missing key={cat.value} here — React will warn about this
              <button
                onClick={() => handleCategoryChange(cat.value)}
                className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all duration-150 active:scale-95 ${
                  selectedCategory === cat.value
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="card overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-200 rounded-lg w-full" />
                  <div className="h-3 bg-slate-200 rounded-lg w-4/5" />
                  <div className="flex justify-between mt-3">
                    <div className="h-6 bg-slate-200 rounded-lg w-1/4" />
                    <div className="h-7 bg-slate-200 rounded-lg w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isInCart={isInCart(product.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-white hover:shadow-sm transition-all bg-white"
                >
                  <ChevronLeft size={16} className="text-slate-600" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page =
                    i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-150 ${
                        page === currentPage
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-white hover:shadow-sm transition-all bg-white"
                >
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500 text-sm mb-4">
              Try adjusting your search or filter criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
