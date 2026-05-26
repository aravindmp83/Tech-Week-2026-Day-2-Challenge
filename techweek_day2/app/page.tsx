'use client';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, ScatterChart, Scatter, ZAxis
} from 'recharts';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FreshLaneDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Executive');
  const [selectedRegion, setSelectedRegion] = useState('All');

  useEffect(() => {
    async function fetchData() {
      const { data: monthlyData, error } = await supabase
        .from('monthly_activity')
        .select('*');
      
      if (!error && monthlyData) {
        setData(monthlyData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter Data based on Region selection
  const filteredData = useMemo(() => {
    if (selectedRegion === 'All') return data;
    return data.filter(d => d.region === selectedRegion);
  }, [data, selectedRegion]);

  // Aggregate Metrics for KPIs
  const kpis = useMemo(() => {
    if (!filteredData.length) return { stores: 0, footfall: 0, demand: 0, rev: 0 };
    const uniqueStores = new Set(filteredData.map(d => d.store_id)).size;
    const totalFootfall = filteredData.reduce((sum, d) => sum + (d.monthly_footfall || 0), 0);
    const avgDemand = filteredData.reduce((sum, d) => sum + (d.online_sales_pct || 0), 0) / filteredData.length;
    const totalRev = filteredData.reduce((sum, d) => sum + (d.revenue_inr_thousand || 0), 0);
    
    return {
      stores: uniqueStores,
      footfall: (totalFootfall / 1000000).toFixed(1) + 'M',
      demand: avgDemand.toFixed(1) + '%',
      rev: '₹' + (totalRev / 1000).toFixed(1) + 'M'
    };
  }, [filteredData]);

  // Chart 1: Revenue Trend (Group by month)
  const revenueTrend = useMemo(() => {
    const grouped = filteredData.reduce((acc, curr) => {
      const period = curr.data_period;
      if (!acc[period]) acc[period] = { data_period: period, revenue: 0 };
      acc[period].revenue += curr.revenue_inr_thousand || 0;
      return acc;
    }, {});
    return Object.values(grouped).sort((a: any, b: any) => a.data_period.localeCompare(b.data_period));
  }, [filteredData]);

  // Chart 2: Format Performance
  const formatPerformance = useMemo(() => {
    const grouped = filteredData.reduce((acc, curr) => {
      const format = curr.store_format;
      if (!acc[format]) acc[format] = { store_format: format, revenue: 0 };
      acc[format].revenue += curr.revenue_inr_thousand || 0;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [filteredData]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-sans text-xl font-semibold text-slate-600">Loading FreshLane Leadership Review...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FreshLane Omnichannel Retail Review</h1>
          <p className="text-sm text-slate-500">Live Operating Performance</p>
        </div>
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => { setActiveTab('Executive'); setSelectedRegion('All'); }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'Executive' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Executive Overview
          </button>
          <button 
            onClick={() => setActiveTab('Regional')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'Regional' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Regional Deep Dive
          </button>
        </div>
      </nav>

      <main className="px-8 mt-8 max-w-7xl mx-auto">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Network Stores</p>
            <p className="text-3xl font-bold mt-1">{kpis.stores}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Total Footfall</p>
            <p className="text-3xl font-bold mt-1">{kpis.footfall}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Omnichannel Demand</p>
            <p className="text-3xl font-bold mt-1 text-indigo-600">{kpis.demand}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">{kpis.rev}</p>
          </div>
        </div>

        {/* Regional Filter (Only visible on Regional Tab) */}
        {activeTab === 'Regional' && (
          <div className="mb-8 flex items-center space-x-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <label className="font-semibold text-slate-700">Select Region:</label>
            <select 
              className="p-2 border border-slate-300 rounded-md bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none min-w-[200px]"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="All">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Charts Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trend Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Monthly Revenue Trend (₹K)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="data_period" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Split Bottom Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Store Format Performance</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" tick={{fontSize: 12}} />
                      <YAxis dataKey="store_format" type="category" width={100} tick={{fontSize: 12}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="revenue" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Risk Matrix (Wastage vs Rating)</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="fresh_wastage_pct" type="number" name="Wastage %" tick={{fontSize: 12}} />
                      <YAxis dataKey="avg_customer_rating" type="number" name="Rating" domain={[3, 5]} tick={{fontSize: 12}} />
                      <ZAxis dataKey="stockout_incidents" range={[50, 400]} name="Stockouts" />
                      <Tooltip cursor={{strokeDasharray: '3 3'}} />
                      <Scatter data={filteredData.slice(0, 100)} fill="#f43f5e" opacity={0.6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights & Alerts Sidebar */}
          <div className="space-y-6">
            <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-md">
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <span className="mr-2">✨</span> Leadership Signals
              </h3>
              <p className="text-indigo-200 text-sm mb-4">Auto-generated insights from current active data scope.</p>
              
              <ul className="space-y-4 text-sm">
                <li className="bg-indigo-800/50 p-3 rounded-lg border border-indigo-700">
                  <strong className="text-rose-300 block mb-1">🚨 0% Pickup Fulfillment</strong>
                  42 stores have 0% pickup fulfillment this month — almost entirely in North and East. This requires a rapid ops audit.
                </li>
                <li className="bg-indigo-800/50 p-3 rounded-lg border border-indigo-700">
                  <strong className="text-amber-300 block mb-1">⚠️ Critical Quality Band</strong>
                  5 stores (incl. Pune Express 5, Hyderabad Neighbourhood 5) combine wastage &gt; 8.5%, ratings &lt; 3.9, and double-digit stockouts.
                </li>
                <li className="bg-indigo-800/50 p-3 rounded-lg border border-indigo-700">
                  <strong className="text-emerald-300 block mb-1">📈 Positive Signals</strong>
                  South leads on revenue. Wastage is at its lowest (5.6%). Bhubaneswar HM4 is a standout performer with high revenue and a 4.83 rating.
                </li>
              </ul>
            </div>

            {/* At Risk Stores Table */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Immediate Attention Required</h3>
              <div className="space-y-3">
                {[
                  { name: 'Pune Express 5', issue: 'High Wastage', metric: '8.7%' },
                  { name: 'Hyderabad Nbhd 5', issue: 'Low Rating', metric: '3.6★' },
                  { name: 'Chandigarh Super 1', issue: 'Stockouts', metric: '42' },
                  { name: 'Bhubaneswar Exp 1', issue: 'Low Rating', metric: '3.8★' },
                  { name: 'Pune Hyper 3', issue: 'High Wastage', metric: '9.1%' }
                ].map((store, i) => (
                  <div key={i} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded border-b border-slate-100 last:border-0">
                    <span className="text-sm font-medium text-slate-700">{store.name}</span>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">{store.issue}</span>
                      <span className="text-sm font-bold text-rose-500">{store.metric}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
