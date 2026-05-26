'use client';

import React, { useMemo } from 'react';
import { AlertTriangle, TrendingUp, AlertCircle, CheckCircle, TrendingDown, Store, Star, Flame } from 'lucide-react';

interface SignalsAlertsProps {
  data: any[];
  selectedRegion: string;
}

export default function SignalsAlerts({ data, selectedRegion }: SignalsAlertsProps) {
  
  // 1. Immediate Attention Required (wastage > 8.5% AND customer rating < 3.9)
  const criticalStores = useMemo(() => {
    return data.filter((store: any) => {
      const wastage = parseFloat(store.fresh_wastage_pct || 0);
      const rating = parseFloat(store.avg_customer_rating || 0);
      return wastage > 8.5 && rating < 3.9;
    });
  }, [data]);

  // 2. Intervention Alerts (stockout_incidents > 35 OR pickup_fulfillment === 0)
  const interventionStores = useMemo(() => {
    return data.filter((store: any) => {
      const stockouts = parseInt(store.stockout_incidents || 0);
      const pickupFulfillment = parseFloat(store.pickup_fulfillment === undefined ? 100 : store.pickup_fulfillment);
      return stockouts > 35 || pickupFulfillment === 0;
    }).slice(0, 5); // Limit to 5 for layout symmetry
  }, [data]);

  // 3. Trend Signals (Dynamic Outliers/Successes in selected region)
  const highlights = useMemo(() => {
    if (!data.length) return null;
    
    // Find highest revenue store
    const topRevenueStore = [...data].sort((a, b) => 
      (b.revenue_inr_thousand || 0) - (a.revenue_inr_thousand || 0)
    )[0];

    // Find highest rated store
    const topRatedStore = [...data].sort((a, b) => 
      (b.avg_customer_rating || 0) - (a.avg_customer_rating || 0)
    )[0];

    // Find lowest wastage store
    const lowestWastageStore = [...data].sort((a, b) => 
      (a.fresh_wastage_pct || 0) - (b.fresh_wastage_pct || 0)
    )[0];

    return {
      revenue: topRevenueStore,
      rating: topRatedStore,
      wastage: lowestWastageStore,
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Column 1: Immediate Attention Required */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 md:p-6 backdrop-blur-xl flex flex-col h-full">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Immediate Attention</h3>
            <p className="text-[10px] text-slate-400">Critical Drift: Wastage &gt; 8.5% & Rating &lt; 3.9</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto max-h-[280px] pr-1">
          {criticalStores.length > 0 ? (
            criticalStores.map((store: any, idx: number) => (
              <div 
                key={idx} 
                className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-xs font-bold text-rose-300">{store.store_name || `Store ${store.store_id}`}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {store.store_format}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Wastage: <strong className="text-slate-200">{parseFloat(store.fresh_wastage_pct || 0).toFixed(1)}%</strong></span>
                  <span>Rating: <strong className="text-slate-200">{parseFloat(store.avg_customer_rating || 0).toFixed(2)} ★</strong></span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <p className="text-xs font-semibold text-slate-300">All Systems Stable</p>
              <p className="text-[10px] text-slate-500 max-w-[180px]">No stores meet critical drift limits in the active filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Trend Signals (Dynamic Outliers) */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 md:p-6 backdrop-blur-xl flex flex-col h-full">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Trend Signals</h3>
            <p className="text-[10px] text-slate-400">Key positive & negative operational performance</p>
          </div>
        </div>

        {highlights && (
          <div className="flex-1 space-y-3.5 text-xs">
            {/* Top Revenue */}
            <div className="flex items-start space-x-3 p-2.5 rounded-xl border border-slate-850 bg-slate-950/20">
              <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Top Market Contributor</span>
                <span className="font-bold text-slate-200">{highlights.revenue.store_name}</span>
                <p className="text-slate-400 mt-0.5">
                  Generates <span className="text-emerald-400 font-semibold">₹{(highlights.revenue.revenue_inr_thousand / 1000).toFixed(2)}M</span> this period ({highlights.revenue.region} Region).
                </p>
              </div>
            </div>

            {/* Top Rated */}
            <div className="flex items-start space-x-3 p-2.5 rounded-xl border border-slate-850 bg-slate-950/20">
              <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 mt-0.5">
                <Star className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Customer Satisfaction Anchor</span>
                <span className="font-bold text-slate-200">{highlights.rating.store_name}</span>
                <p className="text-slate-400 mt-0.5">
                  Peak rating at <span className="text-amber-400 font-semibold">{parseFloat(highlights.rating.avg_customer_rating).toFixed(2)} ★</span> with {highlights.rating.stockout_incidents || 0} stockouts.
                </p>
              </div>
            </div>

            {/* Lowest Wastage */}
            <div className="flex items-start space-x-3 p-2.5 rounded-xl border border-slate-850 bg-slate-950/20">
              <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 mt-0.5">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Freshness Operations Star</span>
                <span className="font-bold text-slate-200">{highlights.wastage.store_name}</span>
                <p className="text-slate-400 mt-0.5">
                  Maintained record-low wastage of <span className="text-blue-400 font-semibold">{parseFloat(highlights.wastage.fresh_wastage_pct).toFixed(1)}%</span>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Column 3: Intervention Alerts */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 md:p-6 backdrop-blur-xl flex flex-col h-full">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Intervention Alerts</h3>
            <p className="text-[10px] text-slate-400">High stockouts &amp; zero pickup fulfillment zones</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto max-h-[280px] pr-1">
          {interventionStores.length > 0 ? (
            interventionStores.map((store: any, idx: number) => {
              const isStockout = parseInt(store.stockout_incidents || 0) > 35;
              const isPickup = parseFloat(store.pickup_fulfillment === undefined ? 100 : store.pickup_fulfillment) === 0;
              return (
                <div 
                  key={idx} 
                  className="p-2.5 rounded-xl border border-slate-850 bg-slate-950/20 flex justify-between items-center"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-200">{store.store_name}</span>
                    <span className="text-[10px] text-slate-500 block">{store.region} • {store.store_format}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] uppercase font-semibold text-slate-500 block">
                      {isStockout ? 'Stockouts' : 'Fulfillment'}
                    </span>
                    <span className={`text-xs font-extrabold ${isStockout ? 'text-rose-500' : 'text-amber-500'}`}>
                      {isStockout ? `${store.stockout_incidents} Inc.` : '0% Pickup'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <p className="text-xs font-semibold text-slate-300">Operations in Spec</p>
              <p className="text-[10px] text-slate-500">All local stores are satisfying operational metrics.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
