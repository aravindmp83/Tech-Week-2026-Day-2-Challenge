'use client';

import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, CartesianGrid, ScatterChart, Scatter, ZAxis
} from 'recharts';

interface ChartsSectionProps {
  data: any[];
  activeTab: string;
  selectedRegion: string;
}

export default function ChartsSection({ data, activeTab, selectedRegion }: ChartsSectionProps) {
  
  // 1. Monthly Revenue Trend Data (Group by data_period)
  const revenueTrend = useMemo(() => {
    if (!data.length) return [];
    
    const grouped = data.reduce((acc: any, curr: any) => {
      const period = curr.data_period;
      if (!period) return acc;
      if (!acc[period]) {
        acc[period] = { period, revenue: 0, footfall: 0 };
      }
      // Sum in millions for display (divide by 1000 to convert from thousands to millions)
      acc[period].revenue += (curr.revenue_inr_thousand || 0) / 1000;
      acc[period].footfall += (curr.monthly_footfall || 0);
      return acc;
    }, {});
    
    return Object.values(grouped).sort((a: any, b: any) => a.period.localeCompare(b.period));
  }, [data]);

  // 2. Revenue by Region Data (Group by region)
  const revenueByRegion = useMemo(() => {
    if (!data.length) return [];
    
    const grouped = data.reduce((acc: any, curr: any) => {
      const region = curr.region || 'Unknown';
      if (!acc[region]) {
        acc[region] = { name: region, revenue: 0 };
      }
      acc[region].revenue += (curr.revenue_inr_thousand || 0) / 1000;
      return acc;
    }, {});
    
    return Object.values(grouped);
  }, [data]);

  // 3. Store Format Performance (Group by store_format)
  const formatPerformance = useMemo(() => {
    if (!data.length) return [];
    
    const grouped = data.reduce((acc: any, curr: any) => {
      const format = curr.store_format || 'General';
      if (!acc[format]) {
        acc[format] = { format, revenue: 0 };
      }
      acc[format].revenue += (curr.revenue_inr_thousand || 0) / 1000;
      return acc;
    }, {});
    
    return Object.values(grouped);
  }, [data]);

  // 4. Scatter Plot Data (Wastage vs Customer Rating vs Stockouts)
  const scatterData = useMemo(() => {
    if (!data.length) return [];
    // Limit to 80 points to keep the scatter plot readable and clean
    return data.slice(0, 80).map((d: any) => ({
      name: d.store_name || `Store ${d.store_id}`,
      wastage: parseFloat(d.fresh_wastage_pct || 0),
      rating: parseFloat(d.avg_customer_rating || 0),
      stockouts: parseInt(d.stockout_incidents || 0),
    }));
  }, [data]);

  // Custom Glass Tooltip for charts
  const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border-slate-700/80 rounded-xl p-3 shadow-xl">
          <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
          {payload.map((pld: any, idx: number) => (
            <p key={idx} className="text-sm font-bold" style={{ color: pld.color || pld.fill }}>
              {pld.name}: {prefix}{parseFloat(pld.value).toFixed(2)}{suffix}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {activeTab === 'Executive' ? (
        <>
          {/* Executive Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Monthly Trend (Spans 2 columns) */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 md:p-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Monthly Revenue Trend</h3>
                  <p className="text-xs text-slate-400">Aggregated revenue progression over time</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Total Corporate Scale
                </span>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 11, fill: '#94a3b8' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#94a3b8' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip prefix="₹" suffix="M" />} />
                    <Area 
                      type="monotone" 
                      name="Revenue"
                      dataKey="revenue" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Regional Contribution (Spans 1 column) */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 md:p-6 backdrop-blur-xl">
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-100">Regional Distribution</h3>
                <p className="text-xs text-slate-400">Total revenue generated by region</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByRegion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBarRegion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#94a3b8' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#94a3b8' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip prefix="₹" suffix="M" />} />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue"
                      fill="url(#colorBarRegion)" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      ) : (
        <>
          {/* Regional Deep Dive Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 3: Store Format Performance (Horizontal Bar Chart) */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 md:p-6 backdrop-blur-xl">
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-100">Format Performance ({selectedRegion})</h3>
                <p className="text-xs text-slate-400">Revenue split across store types in the region</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={formatPerformance} 
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBarFormat" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 11, fill: '#94a3b8' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      dataKey="format" 
                      type="category" 
                      width={100}
                      tick={{ fontSize: 11, fill: '#94a3b8' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip prefix="₹" suffix="M" />} />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue"
                      fill="url(#colorBarFormat)" 
                      radius={[0, 6, 6, 0]} 
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Risk Matrix Scatter Plot (Wastage vs Rating, Sized by Stockouts) */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 md:p-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Operational Risk Matrix ({selectedRegion})</h3>
                  <p className="text-xs text-slate-400">Wastage % vs Customer Rating (Bubble size = Stockouts)</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Critical Outliers
                </span>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      type="number" 
                      dataKey="wastage" 
                      name="Wastage %" 
                      unit="%" 
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="rating" 
                      name="Rating" 
                      domain={[3.0, 5.0]} 
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ZAxis 
                      type="number" 
                      dataKey="stockouts" 
                      range={[50, 450]} 
                      name="Stockouts" 
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3', stroke: '#ef4444' }} 
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload;
                          return (
                            <div className="glass-panel border-slate-700/80 rounded-xl p-3 shadow-xl text-xs space-y-1">
                              <p className="font-bold text-slate-100">{p.name}</p>
                              <p className="text-emerald-400">Wastage: <span className="font-bold">{p.wastage.toFixed(1)}%</span></p>
                              <p className="text-indigo-400">Rating: <span className="font-bold">{p.rating.toFixed(2)} ★</span></p>
                              <p className="text-rose-400">Stockouts: <span className="font-bold">{p.stockouts} incidents</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Stores" 
                      data={scatterData} 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                      stroke="#f87171"
                      strokeWidth={1}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
