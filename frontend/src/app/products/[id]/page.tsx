'use client';

// INTENTIONAL ISSUE #4: dangerouslySetInnerHTML with unescaped user input.
// The product description is rendered using dangerouslySetInnerHTML without
// any sanitization. If the description contains user-submitted HTML
// (e.g., <script>alert('xss')</script>), it will execute in the browser.
// Fix: use a sanitization library like DOMPurify before rendering:
//   dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';
import { Star, ShoppingCart, ArrowLeft, Package, Minus, Plus, Heart, Share2 } from 'lucide-react';

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
        const data = await productsApi.getOne(params.id as string) as Product;
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

  const cartItem = product ? items.find((item) => item.product.id === product.id) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-10 bg-gray-200 rounded w-1/3 mt-4" />
                <div className="space-y-2 mt-6">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline font-medium"
          >
            Go back
          </button>
        </main>
      </div>
    );
  }

  const categoryBadgeVariant: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
    electronics: 'info',
    clothing: 'default',
    food: 'success',
    books: 'default',
    home: 'warning',
    sports: 'success',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl border border-gray-200 overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <Package size={96} />
                </div>
              )}
            </div>
          </div>

          {/* Product details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <Badge variant={categoryBadgeVariant[product.category] || 'default'}>
                {product.category}
              </Badge>
              {product.sku && (
                <span className="text-xs text-gray-400">SKU: {product.sku}</span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="text-4xl font-bold text-gray-900 mb-6">
              ${Number(product.price).toFixed(2)}
            </div>

            {/* INTENTIONAL ISSUE #4: dangerouslySetInnerHTML with user-supplied content.
                The product.description comes directly from the database (user input)
                and is rendered as HTML without sanitization. This is an XSS vector. */}
            <div
              className="text-gray-600 text-sm leading-relaxed mb-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <Badge variant="success">
                    {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                  </Badge>
                ) : (
                  <Badge variant="error">Out of Stock</Badge>
                )}
              </div>

              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium text-sm min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                      addedToCart
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ShoppingCart size={18} />
                    {addedToCart ? 'Added to Cart!' : cartItem ? `Update Cart (${cartItem.quantity})` : 'Add to Cart'}
                  </button>

                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart size={18} className="text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
