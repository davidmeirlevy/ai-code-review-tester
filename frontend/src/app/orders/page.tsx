'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Badge from '@/components/ui/Badge';
import { ordersApi } from '@/lib/api';
import type { Order, OrderStatus } from '@/types';
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  Truck,
  Check,
  Circle,
  ArrowRight,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_VARIANTS: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> =
  {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'error',
  };

const FILTER_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Category gradient colors for item thumbnails
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

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Ordered', icon: <Clock size={12} /> },
  { key: 'confirmed', label: 'Confirmed', icon: <Check size={12} /> },
  { key: 'processing', label: 'Processing', icon: <Package size={12} /> },
  { key: 'shipped', label: 'Shipped', icon: <Truck size={12} /> },
  { key: 'delivered', label: 'Delivered', icon: <Check size={12} /> },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

function OrderCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));

  const currentStep = STATUS_ORDER[order.status] ?? -1;
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Order header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h3 className="font-bold text-slate-900 text-base">{order.orderNumber}</h3>
              <Badge variant={STATUS_VARIANTS[order.status] || 'default'}>
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-slate-900 text-lg">{formatCurrency(order.total)}</p>
            <p className="text-xs text-slate-400">
              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Item thumbnails */}
        {order.items && order.items.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {order.items.slice(0, 5).map((item, i) => {
              const catGradient =
                CATEGORY_GRADIENTS[item.product?.category ?? 'other'] ||
                CATEGORY_GRADIENTS.other;
              return (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${catGradient} flex items-center justify-center flex-shrink-0`}
                >
                  <Package size={14} className="text-white/70" />
                </div>
              );
            })}
            {order.items.length > 5 && (
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500">
                +{order.items.length - 5}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex gap-4">
            <span>Subtotal: {formatCurrency(order.subtotal)}</span>
            <span>Tax: {formatCurrency(order.tax)}</span>
            <span>
              Shipping:{' '}
              {order.shippingCost === 0 ? (
                <span className="text-emerald-600 font-medium">Free</span>
              ) : (
                formatCurrency(order.shippingCost)
              )}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {isExpanded ? 'Hide details' : 'View details'}
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          {/* Status timeline */}
          {!isCancelled && (
            <div className="px-6 pt-5 pb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Order Progress
              </p>
              <div className="flex items-center gap-0">
                {TIMELINE_STEPS.map((step, i) => {
                  const isDone = currentStep >= i;
                  const isActive = currentStep === i;
                  return (
                    <div key={step.key} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                            isDone
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-slate-200 text-slate-300'
                          }`}
                        >
                          {step.icon}
                        </div>
                        <span
                          className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                            isDone ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mb-5 mx-1 transition-colors ${
                            currentStep > i ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          {order.items && (
            <div className="px-6 pb-5 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Items
              </p>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                      CATEGORY_GRADIENTS[item.product?.category ?? 'other'] ||
                      CATEGORY_GRADIENTS.other
                    } flex items-center justify-center flex-shrink-0`}
                  >
                    <Package size={16} className="text-white/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {item.product?.name || 'Product unavailable'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900 flex-shrink-0">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="px-6 pb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Shipping to
              </p>
              <p className="text-sm text-slate-600">
                {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.state} {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = (await ordersApi.getMyOrders()) as Order[];
        setOrders(data);
      } catch (err) {
        setError('Failed to load your orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders =
    activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);

  const getTabCount = (status: OrderStatus | 'all') => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
            <p className="text-sm text-slate-500 mt-1">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link href="/products" className="btn-secondary text-sm flex items-center gap-1.5">
            Continue shopping
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Filter tabs */}
        {orders.length > 0 && (
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1.5 border border-slate-100 shadow-sm w-fit">
            {FILTER_TABS.map((tab) => {
              const count = getTabCount(tab.value);
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    activeTab === tab.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`text-xs rounded-full px-1.5 py-0.5 min-w-[1.2rem] text-center ${
                        activeTab === tab.value
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-32" />
                    <div className="h-3 bg-slate-200 rounded w-24" />
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-20" />
                </div>
                <div className="flex gap-2 mt-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="w-9 h-9 bg-slate-200 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {activeTab === 'all'
                ? 'When you place orders, they\'ll appear here.'
                : 'Try a different filter above.'}
            </p>
            {activeTab === 'all' && (
              <Link href="/products" className="btn-primary text-sm">
                Start shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
