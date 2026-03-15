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
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import type { DashboardStats } from '@/types';

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

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, {user?.firstName}. Here's what's happening.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              Last updated: {formatDate(lastRefreshed)}
            </span>
            <button
              onClick={fetchStats}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
            <AlertTriangle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <>
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Users</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.users.total.toLocaleString()}
                  icon={<Users size={20} />}
                  color="blue"
                  trend={{ value: 12, label: 'vs last month' }}
                />
                <StatCard
                  title="Active Users"
                  value={stats.users.active.toLocaleString()}
                  subtitle={`${((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total`}
                  icon={<CheckCircle size={20} />}
                  color="green"
                />
                <StatCard
                  title="Admin Users"
                  value={stats.users.admins}
                  icon={<Users size={20} />}
                  color="purple"
                />
                <StatCard
                  title="New This Month"
                  value={stats.users.newThisMonth}
                  icon={<TrendingUp size={20} />}
                  color="yellow"
                />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Products"
                  value={stats.products.total.toLocaleString()}
                  icon={<Package size={20} />}
                  color="blue"
                />
                <StatCard
                  title="In Stock"
                  value={stats.products.inStock.toLocaleString()}
                  icon={<CheckCircle size={20} />}
                  color="green"
                />
                <StatCard
                  title="Out of Stock"
                  value={stats.products.outOfStock.toLocaleString()}
                  icon={<AlertTriangle size={20} />}
                  color="red"
                />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Orders"
                  value={stats.orders.total.toLocaleString()}
                  icon={<ShoppingCart size={20} />}
                  color="blue"
                />
                <StatCard
                  title="Pending"
                  value={stats.orders.pending}
                  icon={<Clock size={20} />}
                  color="yellow"
                />
                <StatCard
                  title="Processing"
                  value={stats.orders.processing}
                  icon={<TrendingUp size={20} />}
                  color="purple"
                />
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(stats.orders.revenue)}
                  icon={<DollarSign size={20} />}
                  color="green"
                  trend={{ value: 8.2, label: 'vs last month' }}
                />
              </div>
            </section>

            {stats.products.byCategory && Object.keys(stats.products.byCategory).length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Products by Category
                </h2>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="space-y-3">
                    {Object.entries(stats.products.byCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center gap-4">
                          <span className="text-sm text-gray-600 capitalize w-24 flex-shrink-0">
                            {category}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(count / stats.products.total) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
