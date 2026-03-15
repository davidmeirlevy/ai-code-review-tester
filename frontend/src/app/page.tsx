import Link from 'next/link';
import { ArrowRight, Package, BarChart2, ShoppingBag, Check, Zap, Shield, Globe } from 'lucide-react';

const features = [
  {
    icon: <Package size={24} className="text-indigo-600" />,
    title: 'Product Management',
    description:
      'Organize your entire catalog with ease. Add products, manage inventory, set pricing, and track stock levels in real time.',
  },
  {
    icon: <ShoppingBag size={24} className="text-violet-600" />,
    title: 'Order Tracking',
    description:
      'Follow every order from placement to delivery. Get instant updates on order status and manage fulfillment seamlessly.',
  },
  {
    icon: <BarChart2 size={24} className="text-indigo-600" />,
    title: 'Analytics Dashboard',
    description:
      'Turn data into decisions. Monitor revenue, user growth, and product performance with clear, actionable insights.',
  },
];

const stats = [
  { value: '10,000+', label: 'Products managed' },
  { value: '500+', label: 'Active stores' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '$2M+', label: 'Revenue processed' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Gradient blob */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-100/60 to-violet-100/40 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-50/80 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-indigo-100">
            <Zap size={12} />
            Built for modern commerce
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
            The modern way to{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              manage your store
            </span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            ShopDash gives you a powerful, intuitive platform to run your entire e-commerce
            operation — from inventory to orders to analytics, all in one place.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-sm shadow-indigo-200 hover:shadow-indigo-300 active:scale-95"
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-7 py-3.5 rounded-xl border border-slate-200 transition-all duration-200 active:scale-95"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-indigo-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Powerful tools built for every stage of your commerce journey.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card p-8 hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust indicators */}
      <section className="bg-white border-y border-slate-100 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-12">
            {[
              { icon: <Shield size={20} className="text-emerald-600" />, label: 'SOC 2 Compliant' },
              { icon: <Zap size={20} className="text-amber-500" />, label: 'Edge-optimized CDN' },
              { icon: <Globe size={20} className="text-indigo-600" />, label: 'Global infrastructure' },
              { icon: <Check size={20} className="text-emerald-600" />, label: '99.9% uptime guarantee' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-slate-600 text-sm font-medium">
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-slate-500 mb-8 text-lg">
            Join hundreds of stores already using ShopDash to grow their business.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-indigo-200 active:scale-95 text-lg"
          >
            Create your free account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">ShopDash</span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} ShopDash. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
