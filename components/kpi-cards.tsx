'use client';

import React, { useMemo } from 'react';
import { Store, Users, Share2, DollarSign, Star, TrendingUp } from 'lucide-react';

interface KpiCardsProps {
  data: any[];
}

export default function KpiCards({ data }: KpiCardsProps) {
  const stats = useMemo(() => {
    if (!data.length) {
      return { stores: 0, footfall: '0.0M', demand: '0.0%', revenue: '₹0.0M', rating: '0.00' };
    }

    const uniqueStores = new Set(data.map(d => d.store_id || d.store_name)).size;
    
    const totalFootfall = data.reduce((sum, d) => sum + (d.monthly_footfall || 0), 0);
    const avgDemand = data.reduce((sum, d) => sum + (d.online_sales_pct || 0), 0) / data.length;
    
    // Revenue is in thousands, so sum * 1000 / 1,000,000 = sum / 1000
    const totalRevenue = data.reduce((sum, d) => sum + (d.revenue_inr_thousand || 0), 0);
    const avgRating = data.reduce((sum, d) => sum + (d.avg_customer_rating || 0), 0) / data.length;

    return {
      stores: uniqueStores,
      footfall: totalFootfall >= 1000000 
        ? `${(totalFootfall / 1000000).toFixed(2)}M` 
        : `${(totalFootfall / 1000).toFixed(0)}K`,
      demand: `${avgDemand.toFixed(1)}%`,
      revenue: `₹${(totalRevenue / 1000).toFixed(2)}M`,
      rating: avgRating.toFixed(2),
    };
  }, [data]);

  const cardConfig = [
    {
      title: 'Active Stores',
      value: stats.stores,
      desc: 'Live retail locations in scope',
      icon: Store,
      colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      glowColor: 'group-hover:shadow-indigo-500/10',
    },
    {
      title: 'Monthly Footfall',
      value: stats.footfall,
      desc: 'Total customer store visits',
      icon: Users,
      colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      glowColor: 'group-hover:shadow-blue-500/10',
    },
    {
      title: 'Omnichannel Share',
      value: stats.demand,
      desc: 'Online & delivery fulfillment',
      icon: Share2,
      colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      glowColor: 'group-hover:shadow-purple-500/10',
    },
    {
      title: 'Total Revenue',
      value: stats.revenue,
      desc: 'Operational sales intake',
      icon: DollarSign,
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      glowColor: 'group-hover:shadow-emerald-500/10',
      isAccent: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cardConfig.map((card, i) => {
        const Icon = card.icon;
        return (
          <div 
            key={i} 
            className={`group relative overflow-hidden rounded-2xl border bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80 ${card.glowColor} hover:shadow-2xl`}
          >
            {/* Top Glow Accent */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${card.isAccent ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} />

            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{card.title}</span>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-3xl font-extrabold tracking-tight ${card.isAccent ? 'text-emerald-400' : 'text-slate-50'}`}>
                    {card.value}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${card.colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>{card.desc}</span>
              <div className="flex items-center space-x-1 text-emerald-400">
                {card.title === 'Total Revenue' && <span className="flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-0.5" />+4.8% MoM</span>}
                {card.title === 'Active Stores' && <span className="text-slate-500">100% capacity</span>}
                {card.title === 'Monthly Footfall' && <span className="text-blue-400">Stable traffic</span>}
                {card.title === 'Omnichannel Share' && <span className="text-purple-400">Delivery active</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
