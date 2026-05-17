import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'primary' | 'emerald' | 'rose' | 'amber' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={clsx(
                "text-xs font-semibold px-1.5 py-0.5 rounded",
                trend.isUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              )}>
                {trend.isUp ? '+' : '-'}{trend.value}%
              </span>
              <span className="text-[11px] text-gray-400">so với tháng trước</span>
            </div>
          )}
        </div>
        <div className={clsx("p-3 rounded-lg", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
