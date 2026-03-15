'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/lib/api';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Package,
  Truck,
  Lock,
  Tag,
  X,
} from 'lucide-react';

// Category color mapping
const CATEGORY_GRADIENTS: Record<string, string> = {
  electronics: 'from-indigo-400 to-indigo-600',
  clothing: 'from-violet-400 to-violet-600',
  food: 'from-amber-400 to-amber-600',
  books: 'from-emerald-400 to-emerald-600',
  home: 'from-sky-400 to-sky-600',
  sports: 'from-orange-400 to-orange-600',
  toys: 'from-pink-400 to-pink-600',
  other: 'from-slate-400 to-slate-600',
};

export default function CartPage() {
  const { items, total, updateQuantity, removeFromCart, clearCart, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [promoCode, setPromoCode] = useState('');

  const TAX_RATE = 0.1;
  const FREE_SHIPPING_THRESHOLD = 100;
  const SHIPPING_COST = 9.99;

  const subtotal = total;
  const tax = subtotal * TAX_RATE;
  const shippingCost = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const orderTotal = subtotal + tax + shippingCost;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      await ordersApi.create({
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94102',
          country: 'US',
        },
      });

      clearCart();
      router.push('/orders');
    } catch (err: any) {
      setCheckoutError(err?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <ShoppingBag size={40} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8 text-sm">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 btn-primary text-sm"
          >
            Browse Products
            <ArrowRight size={15} />
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Cart</h1>
            <p className="text-sm text-slate-500 mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
          >
            <X size={14} />
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const catGradient =
                CATEGORY_GRADIENTS[item.product.category] || CATEGORY_GRADIENTS.other;
              return (
                <div
                  key={item.product.id}
                  className="card p-5 flex gap-4 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Image placeholder */}
                  <div
                    className={`w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br ${catGradient} flex items-center justify-center`}
                  >
                    <Package size={28} className="text-white/60" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600 text-sm leading-tight line-clamp-2 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0 rounded-lg hover:bg-red-50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-slate-100 text-slate-500`}
                    >
                      {item.product.category}
                    </span>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="px-3 py-2 hover:bg-slate-50 transition-colors text-slate-500"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 py-2 text-sm font-semibold min-w-[2.5rem] text-center text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              Math.min(item.product.stock, item.quantity + 1),
                            )
                          }
                          disabled={item.quantity >= item.product.stock}
                          className="px-3 py-2 hover:bg-slate-50 transition-colors disabled:opacity-40 text-slate-500"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-base font-bold text-indigo-600">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatCurrency(item.product.price)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-semibold text-slate-900 mb-5 text-base">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (10%)</span>
                  <span className="font-medium text-slate-900">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 font-semibold">Free</span>
                    ) : (
                      <span className="text-slate-900">{formatCurrency(shippingCost)}</span>
                    )}
                  </span>
                </div>
                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <div className="flex items-center gap-2 p-2.5 bg-indigo-50 rounded-xl">
                    <Truck size={13} className="text-indigo-500 flex-shrink-0" />
                    <p className="text-xs text-indigo-700">
                      Add{' '}
                      <strong>{formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}</strong>{' '}
                      more for free shipping
                    </p>
                  </div>
                )}
              </div>

              {/* Promo code */}
              <div className="flex gap-2 mb-5">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="input pl-9 text-sm py-2"
                  />
                </div>
                <button className="btn-secondary text-sm px-3 py-2">Apply</button>
              </div>

              {/* Total */}
              <div className="border-t border-slate-100 pt-4 mb-5">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-xl text-slate-900">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>
              </div>

              {checkoutError && (
                <p className="text-sm text-red-600 mb-3 p-3 bg-red-50 rounded-xl">
                  {checkoutError}
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isCheckingOut ? (
                  'Processing...'
                ) : (
                  <>
                    {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Secure checkout badge */}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
                <Lock size={11} />
                <span>Secure checkout with SSL encryption</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 text-center">
                <p className="text-xs text-slate-400">We accept</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Visa · Mastercard · Amex · PayPal
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
