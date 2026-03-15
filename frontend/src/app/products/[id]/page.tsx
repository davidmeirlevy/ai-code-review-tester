'use client';

// INTENTIONAL ISSUE #4: dangerouslySetInnerHTML with unescaped user input.
// The product description is rendered using dangerouslySetInnerHTML without
// any sanitization. If the description contains user-submitted HTML
// (e.g., <script>alert('xss')</script>), it will execute in the browser.
// Fix: use a sanitization library like DOMPurify before rendering:
//   dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';
import {
  Star,
  ShoppingCart,
  Package,
  Minus,
  Plus,
  Heart,
  ChevronRight,
  Truck,
  Shield,
  Home,
} from 'lucide-react';

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  electronics: 'from-indigo-400 to-indigo-600',
  clothing: 'from-violet-400 to-violet-600',
  food: 'from-amber-400 to-amber-600',
  books: 'from-emerald-400 to-emerald-600',
  home: 'from-sky-400 to-sky-600',
  sports: 'from-orange-400 to-orange-600',
  toys: 'from-pink-400 to-pink-600',
  other: 'from-slate-400 to-slate-600',
};

const CATEGORY_BADGE_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  electronics: 'info',
  clothing: 'default',
  food: 'success',
  books: 'success',
  home: 'warning',
  sports: 'success',
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, isInCart, updateQuantity, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      setIsLoading(true);
      try {
        const data = (await productsApi.getOne(params.id as string)) as Product;
        setProduct(data);
      } catch (err) {
        setError('Product not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const cartItem = product
    ? items.find((item) => item.product.id === product.id)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex gap-2 mb-8">
              <div className="h-4 bg-slate-200 rounded w-12" />
              <div className="h-4 bg-slate-200 rounded w-4" />
              <div className="h-4 bg-slate-200 rounded w-20" />
              <div className="h-4 bg-slate-200 rounded w-4" />
              <div className="h-4 bg-slate-200 rounded w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-slate-200 rounded-2xl" />
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-slate-200 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-8 bg-slate-200 rounded w-3/4" />
                <div className="h-5 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded w-1/3 mt-4" />
                <div className="space-y-2 mt-6">
                  <div className="h-4 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Package size={40} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Product not found</h2>
          <p className="text-slate-500 mb-6 text-sm">{error}</p>
          <button
            onClick={() => router.back()}
            className="btn-secondary text-sm"
          >
            Go back
          </button>
        </main>
      </div>
    );
  }

  const catGradient = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.other;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
            <Home size={14} />
            Home
          </Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link href="/products" className="hover:text-slate-900 transition-colors">
            Products
          </Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Image + gallery */}
          <div className="space-y-4">
            <div
              className={`aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${catGradient} flex items-center justify-center shadow-sm`}
            >
              <Package size={80} className="text-white/50" />
            </div>
            {/* Gallery thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${catGradient} opacity-60 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center`}
                >
                  <Package size={24} className="text-white/60" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div>
            {/* Category + SKU */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <Badge variant={CATEGORY_BADGE_VARIANT[product.category] || 'default'}>
                {product.category}
              </Badge>
              {product.sku && (
                <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Stars + stock */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    className={
                      i < Math.floor(product.rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-200'
                    }
                  />
                ))}
                <span className="text-sm text-slate-500 ml-1.5">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
              {product.stock > 0 ? (
                <Badge variant="success">
                  {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                </Badge>
              ) : (
                <Badge variant="error">Out of Stock</Badge>
              )}
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-indigo-600 mb-5">
              ${Number(product.price).toFixed(2)}
            </div>

            <div className="border-t border-slate-100 my-5" />

            {/* Description — INTENTIONAL ISSUE #4: dangerouslySetInnerHTML with user-supplied content.
                The product.description comes directly from the database (user input)
                and is rendered as HTML without sanitization. This is an XSS vector. */}
            <div
              className="text-slate-600 text-sm leading-relaxed mb-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Quantity + Add to cart */}
            {product.stock > 0 && (
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2.5 hover:bg-slate-50 transition-colors text-slate-600"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="px-4 py-2.5 font-semibold text-sm min-w-[3rem] text-center text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      className="px-3 py-2.5 hover:bg-slate-50 transition-colors text-slate-600"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <span className="text-sm text-slate-500">{product.stock} in stock</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-150 active:scale-95 ${
                      addedToCart
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
                    }`}
                  >
                    <ShoppingCart size={18} />
                    {addedToCart
                      ? 'Added!'
                      : cartItem
                      ? `Update Cart (${cartItem.quantity})`
                      : 'Add to Cart'}
                  </button>
                  <button className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors bg-white">
                    <Heart size={18} className="text-slate-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Shipping info */}
            <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-white">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Truck size={16} className="text-indigo-500 flex-shrink-0" />
                <span>Free shipping on orders over $100</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Shield size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Secure checkout with SSL encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products section */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div
                  className={`aspect-square bg-gradient-to-br ${catGradient} opacity-40 flex items-center justify-center`}
                >
                  <Package size={32} className="text-white/60" />
                </div>
                <div className="p-3">
                  <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
