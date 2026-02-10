import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtext, icon: Icon, trend, trendValue, color = "text-blue-500" }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg bg-slate-800 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      {(trend || subtext) && (
        <div className="flex items-center gap-2 text-sm">
          {trend && (
            <span className={`font-medium ${trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-emerald-400' : 'text-slate-400'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
            </span>
          )}
          {subtext && <span className="text-slate-500">{subtext}</span>}
        </div>
      )}
    </div>
  );
};

export default StatsCard;