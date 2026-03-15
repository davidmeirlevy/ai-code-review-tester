'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Badge from '@/components/ui/Badge';
import { ordersApi } from '@/lib/api';
import type { Order, OrderStatus } from '@/types';
import { ShoppingBag, ChevronDown, ChevronUp, Package, Clock, Truck, Check } from 'lucide-react';

const STATUS_VARIANTS: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'error',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  confirmed: <Check size={14} />,
  processing: <Package size={14} />,
  shipped: <Truck size={14} />,
  delivered: <Check size={14} />,
};

function OrderCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">{order.orderNumber}</h3>
              <Badge variant={STATUS_VARIANTS[order.status] || 'default'}>
                <span className="flex items-center gap-1">
                  {STATUS_ICONS[order.status]}
                  {order.status}
                </span>
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
            <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>Subtotal: {formatCurrency(order.subtotal)}</p>
            <p>Tax: {formatCurrency(order.tax)}</p>
            <p>Shipping: {order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Hide items' : 'View items'}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && order.items && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product?.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <Package size={16} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.product?.name || 'Product unavailable'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {order.shippingAddress && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-1">Shipping to:</p>
              <p className="text-xs text-gray-500">
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersApi.getMyOrders() as Order[];
        setOrders(data);
      } catch (err) {
        setError('Failed to load your orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={56} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm">
              When you place orders, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
