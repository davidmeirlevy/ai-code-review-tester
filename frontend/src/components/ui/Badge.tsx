import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  error: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  info: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
};

const sizeClasses = {
  sm: 'text-xs px-2.5 py-0.5',
  md: 'text-sm px-3 py-1',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}
