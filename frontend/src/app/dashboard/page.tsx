'use client';

// INTENTIONAL ISSUE #3: useEffect with missing dependency array.
// The useEffect at the bottom of this file is missing its dependency array entirely.
// This causes it to run after every single render. Combined with the fact that it
// calls setStats() (a state setter), it creates an infinite re-render loop:
// render → effect runs → setStats → re-render → effect runs → setStats → ...

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/context/AuthContext';
import { usersApi, productsApi, ordersApi } from '@/lib/api';
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import type { DashboardStats } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  electronics: 'bg-indigo-500',
  clothing: 'bg-violet-500',
  food: 'bg-amber-500',
  books: 'bg-emerald-500',
  home: 'bg-sky-500',
  sports: 'bg-orange-500',
  toys: 'bg-pink-500',
  other: 'bg-slate-400',
};

const FAKE_ORDERS = [
  { id: '#ORD-1042', status: 'delivered', amount: 249.99, date: 'Mar 14, 2026', customer: 'Alex Johnson' },
  { id: '#ORD-1041', status: 'processing', amount: 89.00, date: 'Mar 14, 2026', customer: 'Sarah Miller' },
  { id: '#ORD-1040', status: 'pending', amount: 419.50, date: 'Mar 13, 2026', customer: 'James Wilson' },
  { id: '#ORD-1039', status: 'shipped', amount: 74.99, date: 'Mar 13, 2026', customer: 'Emily Chen' },
  { id: '#ORD-1038', status: 'cancelled', amount: 199.00, date: 'Mar 12, 2026', customer: 'David Brown' },
];

const ORDER_STATUS_STYLES: Record<string, string> = {
  delivered: 'bg-emerald-50 text-emerald-700',
  processing: 'bg-indigo-50 text-indigo-700',
  pending: 'bg-amber-50 text-amber-700',
  shipped: 'bg-sky-50 text-sky-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [userStats, productStats, orderStats] = await Promise.all([
        usersApi.getStats() as Promise<DashboardStats['users']>,
        productsApi.getStats() as Promise<DashboardStats['products']>,
        ordersApi.getStats() as Promise<DashboardStats['orders']>,
      ]);

      setStats({
        users: userStats,
        products: productStats,
        orders: orderStats,
      });
    } catch (err) {
      setError('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Correct usage — runs once on mount with dependency array
  useEffect(() => {
    fetchStats();
  }, []);

  // INTENTIONAL ISSUE #3: Missing dependency array on this useEffect.
  // Without [], this runs after EVERY render, not just on mount.
  // Calling setLastRefreshed inside triggers a re-render, causing an infinite loop.
  useEffect(() => {
    setLastRefreshed(new Date());
  }); // <-- Missing [] here!

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);

  const maxCategory =
    stats?.products?.byCategory
      ? Math.max(...Object.values(stats.products.byCategory))
      : 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back, {user?.firstName}. Here&apos;s what&apos;s happening.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:block">
              Updated {formatTime(lastRefreshed)}
            </span>
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <AlertTriangle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isLoading && !stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="flex justify-between mb-4">
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-6 animate-fade-in">
            {/* Top stats row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.users.total.toLocaleString()}
                icon={<Users size={20} />}
                color="blue"
                trend={{ value: 12, label: 'vs last month' }}
              />
              <StatCard
                title="Total Products"
                value={stats.products.total.toLocaleString()}
                icon={<Package size={20} />}
                color="violet"
              />
              <StatCard
                title="Total Orders"
                value={stats.orders.total.toLocaleString()}
                icon={<ShoppingBag size={20} />}
                color="amber"
                trend={{ value: 5.4, label: 'vs last month' }}
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats.orders.revenue)}
                icon={<DollarSign size={20} />}
                color="emerald"
                trend={{ value: 8.2, label: 'vs last month' }}
              />
            </div>

            {/* Middle row: Categories + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Products by Category */}
              <div className="lg:col-span-2 card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-slate-900">Products by Category</h2>
                  <span className="text-xs text-slate-400">{stats.products.total} total</span>
                </div>
                {stats.products.byCategory &&
                Object.keys(stats.products.byCategory).length > 0 ? (
                  <div className="space-y-3.5">
                    {Object.entries(stats.products.byCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, count]) => {
                        const pct = Math.round((count / maxCategory) * 100);
                        const barColor = CATEGORY_COLORS[category] || 'bg-slate-400';
                        return (
                          <div key={category} className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 capitalize w-24 flex-shrink-0">
                              {category}
                            </span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                              <div
                                className={`${barColor} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 w-8 text-right tabular-nums">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No category data available.</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="card p-6">
                <h2 className="font-semibold text-slate-900 mb-5">Quick Actions</h2>
                <div className="space-y-2.5">
                  {[
                    { label: 'Add New Product', href: '/products', icon: <Package size={15} />, color: 'text-indigo-600 bg-indigo-50' },
                    { label: 'View All Orders', href: '/orders', icon: <ShoppingBag size={15} />, color: 'text-violet-600 bg-violet-50' },
                    { label: 'Manage Users', href: '/users', icon: <Users size={15} />, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Analytics Report', href: '/dashboard', icon: <TrendingUp size={15} />, color: 'text-emerald-600 bg-emerald-50' },
                  ].map((action) => (
                    <a
                      key={action.label}
                      href={action.href}
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all duration-150 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                          {action.icon}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{action.label}</span>
                      </div>
                      <ArrowUpRight
                        size={14}
                        className="text-slate-300 group-hover:text-slate-500 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom row: Recent Orders + User breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <div className="lg:col-span-2 card overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {FAKE_ORDERS.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="text-sm font-semibold text-slate-900">{order.id}</p>
                            <p className="text-xs text-slate-400">{order.date}</p>
                          </td>
                          <td className="px-6 py-3.5 text-sm text-slate-600">{order.customer}</td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                ORDER_STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right text-sm font-semibold text-slate-900">
                            {formatCurrency(order.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Breakdown */}
              <div className="card p-6">
                <h2 className="font-semibold text-slate-900 mb-5">User Breakdown</h2>
                <div className="space-y-5">
                  {/* Active vs Inactive */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Active users</span>
                      <span className="font-semibold text-slate-900">
                        {stats.users.active.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div
                        className="h-2 bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${((stats.users.active / stats.users.total) * 100).toFixed(0)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Inactive users</span>
                      <span className="font-semibold text-slate-900">
                        {(stats.users.total - stats.users.active).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div
                        className="h-2 bg-red-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${(
                            ((stats.users.total - stats.users.active) / stats.users.total) *
                            100
                          ).toFixed(0)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {(
                        ((stats.users.total - stats.users.active) / stats.users.total) *
                        100
                      ).toFixed(1)}% of total
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Admins</span>
                      <span className="font-semibold text-slate-900">{stats.users.admins}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">New this month</span>
                      <span className="font-semibold text-emerald-600">
                        +{stats.users.newThisMonth}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Active Users"
                value={stats.users.active.toLocaleString()}
                subtitle={`${((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total`}
                icon={<CheckCircle size={20} />}
                color="green"
              />
              <StatCard
                title="Pending Orders"
                value={stats.orders.pending}
                icon={<Clock size={20} />}
                color="amber"
              />
              <StatCard
                title="In Stock"
                value={stats.products.inStock.toLocaleString()}
                subtitle={`${stats.products.outOfStock} out of stock`}
                icon={<Package size={20} />}
                color="indigo"
              />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
