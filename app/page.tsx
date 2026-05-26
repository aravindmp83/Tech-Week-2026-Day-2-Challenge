'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BarChart, Sparkles, AlertCircle, RefreshCw, LayoutDashboard, 
  MapPin, HelpCircle, Cpu, Eye, BookOpen, Layers, Terminal, Bot 
} from 'lucide-react';

import KpiCards from '@/components/kpi-cards';
import ChartsSection from '@/components/charts-section';
import SignalsAlerts from '@/components/signals-alerts';
import ChatWidget from '@/components/chat-widget';
import InfoModal from '@/components/info-modals';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Beautiful Local Mock Store Data (Fallback)
const fallbackStoreData = [
  // 2023-01
  { store_id: 1, store_name: "Delhi Super 1", region: "North", store_format: "Super", revenue_inr_thousand: 4800, monthly_footfall: 145000, online_sales_pct: 28, fresh_wastage_pct: 5.2, avg_customer_rating: 4.65, stockout_incidents: 12, pickup_fulfillment: 98, data_period: "2023-01" },
  { store_id: 2, store_name: "Noida Express 1", region: "North", store_format: "Express", revenue_inr_thousand: 2300, monthly_footfall: 75000, online_sales_pct: 35, fresh_wastage_pct: 8.9, avg_customer_rating: 3.82, stockout_incidents: 24, pickup_fulfillment: 0, data_period: "2023-01" },
  { store_id: 3, store_name: "Gurugram Hyper 1", region: "North", store_format: "Hyper", revenue_inr_thousand: 9800, monthly_footfall: 310000, online_sales_pct: 22, fresh_wastage_pct: 6.1, avg_customer_rating: 4.45, stockout_incidents: 8, pickup_fulfillment: 95, data_period: "2023-01" },
  { store_id: 4, store_name: "Bengaluru Hyper 1", region: "South", store_format: "Hyper", revenue_inr_thousand: 11500, monthly_footfall: 380000, online_sales_pct: 42, fresh_wastage_pct: 4.8, avg_customer_rating: 4.78, stockout_incidents: 5, pickup_fulfillment: 99, data_period: "2023-01" },
  { store_id: 5, store_name: "Chennai Super 2", region: "South", store_format: "Super", revenue_inr_thousand: 5100, monthly_footfall: 160000, online_sales_pct: 30, fresh_wastage_pct: 6.4, avg_customer_rating: 4.38, stockout_incidents: 15, pickup_fulfillment: 96, data_period: "2023-01" },
  { store_id: 6, store_name: "Hyderabad Nbhd 5", region: "South", store_format: "Neighbourhood", revenue_inr_thousand: 1800, monthly_footfall: 42000, online_sales_pct: 12, fresh_wastage_pct: 9.2, avg_customer_rating: 3.65, stockout_incidents: 39, pickup_fulfillment: 85, data_period: "2023-01" },
  { store_id: 7, store_name: "Kolkata Hyper 2", region: "East", store_format: "Hyper", revenue_inr_thousand: 8200, monthly_footfall: 245000, online_sales_pct: 18, fresh_wastage_pct: 7.5, avg_customer_rating: 4.25, stockout_incidents: 19, pickup_fulfillment: 0, data_period: "2023-01" },
  { store_id: 8, store_name: "Bhubaneswar Exp 1", region: "East", store_format: "Express", revenue_inr_thousand: 2100, monthly_footfall: 68000, online_sales_pct: 25, fresh_wastage_pct: 8.8, avg_customer_rating: 3.75, stockout_incidents: 28, pickup_fulfillment: 0, data_period: "2023-01" },
  { store_id: 9, store_name: "Mumbai Hyper 3", region: "West", store_format: "Hyper", revenue_inr_thousand: 12100, monthly_footfall: 410000, online_sales_pct: 45, fresh_wastage_pct: 5.0, avg_customer_rating: 4.82, stockout_incidents: 4, pickup_fulfillment: 97, data_period: "2023-01" },
  { store_id: 10, store_name: "Pune Express 5", region: "West", store_format: "Express", revenue_inr_thousand: 2900, monthly_footfall: 88000, online_sales_pct: 38, fresh_wastage_pct: 9.1, avg_customer_rating: 3.70, stockout_incidents: 31, pickup_fulfillment: 90, data_period: "2023-01" },

  // 2023-02
  { store_id: 1, store_name: "Delhi Super 1", region: "North", store_format: "Super", revenue_inr_thousand: 5100, monthly_footfall: 151000, online_sales_pct: 29, fresh_wastage_pct: 5.0, avg_customer_rating: 4.70, stockout_incidents: 10, pickup_fulfillment: 98, data_period: "2023-02" },
  { store_id: 2, store_name: "Noida Express 1", region: "North", store_format: "Express", revenue_inr_thousand: 2500, monthly_footfall: 78000, online_sales_pct: 36, fresh_wastage_pct: 8.5, avg_customer_rating: 3.90, stockout_incidents: 20, pickup_fulfillment: 0, data_period: "2023-02" },
  { store_id: 3, store_name: "Gurugram Hyper 1", region: "North", store_format: "Hyper", revenue_inr_thousand: 10200, monthly_footfall: 318000, online_sales_pct: 24, fresh_wastage_pct: 5.8, avg_customer_rating: 4.48, stockout_incidents: 7, pickup_fulfillment: 95, data_period: "2023-02" },
  { store_id: 4, store_name: "Bengaluru Hyper 1", region: "South", store_format: "Hyper", revenue_inr_thousand: 12200, monthly_footfall: 395000, online_sales_pct: 44, fresh_wastage_pct: 4.5, avg_customer_rating: 4.81, stockout_incidents: 4, pickup_fulfillment: 99, data_period: "2023-02" },
  { store_id: 5, store_name: "Chennai Super 2", region: "South", store_format: "Super", revenue_inr_thousand: 5400, monthly_footfall: 165000, online_sales_pct: 31, fresh_wastage_pct: 6.0, avg_customer_rating: 4.42, stockout_incidents: 13, pickup_fulfillment: 97, data_period: "2023-02" },
  { store_id: 6, store_name: "Hyderabad Nbhd 5", region: "South", store_format: "Neighbourhood", revenue_inr_thousand: 2000, monthly_footfall: 45000, online_sales_pct: 15, fresh_wastage_pct: 8.8, avg_customer_rating: 3.78, stockout_incidents: 33, pickup_fulfillment: 86, data_period: "2023-02" },
  { store_id: 7, store_name: "Kolkata Hyper 2", region: "East", store_format: "Hyper", revenue_inr_thousand: 8600, monthly_footfall: 252000, online_sales_pct: 20, fresh_wastage_pct: 7.2, avg_customer_rating: 4.30, stockout_incidents: 16, pickup_fulfillment: 0, data_period: "2023-02" },
  { store_id: 8, store_name: "Bhubaneswar Exp 1", region: "East", store_format: "Express", revenue_inr_thousand: 2300, monthly_footfall: 71000, online_sales_pct: 27, fresh_wastage_pct: 8.5, avg_customer_rating: 3.80, stockout_incidents: 25, pickup_fulfillment: 0, data_period: "2023-02" },
  { store_id: 9, store_name: "Mumbai Hyper 3", region: "West", store_format: "Hyper", revenue_inr_thousand: 12800, monthly_footfall: 425000, online_sales_pct: 46, fresh_wastage_pct: 4.8, avg_customer_rating: 4.85, stockout_incidents: 3, pickup_fulfillment: 97, data_period: "2023-02" },
  { store_id: 10, store_name: "Pune Express 5", region: "West", store_format: "Express", revenue_inr_thousand: 3100, monthly_footfall: 91000, online_sales_pct: 39, fresh_wastage_pct: 8.7, avg_customer_rating: 3.75, stockout_incidents: 28, pickup_fulfillment: 92, data_period: "2023-02" },

  // 2023-03
  { store_id: 1, store_name: "Delhi Super 1", region: "North", store_format: "Super", revenue_inr_thousand: 5400, monthly_footfall: 158000, online_sales_pct: 31, fresh_wastage_pct: 4.8, avg_customer_rating: 4.75, stockout_incidents: 9, pickup_fulfillment: 98, data_period: "2023-03" },
  { store_id: 2, store_name: "Noida Express 1", region: "North", store_format: "Express", revenue_inr_thousand: 2700, monthly_footfall: 81000, online_sales_pct: 38, fresh_wastage_pct: 8.1, avg_customer_rating: 4.02, stockout_incidents: 18, pickup_fulfillment: 0, data_period: "2023-03" },
  { store_id: 3, store_name: "Gurugram Hyper 1", region: "North", store_format: "Hyper", revenue_inr_thousand: 10800, monthly_footfall: 326000, online_sales_pct: 25, fresh_wastage_pct: 5.6, avg_customer_rating: 4.52, stockout_incidents: 6, pickup_fulfillment: 96, data_period: "2023-03" },
  { store_id: 4, store_name: "Bengaluru Hyper 1", region: "South", store_format: "Hyper", revenue_inr_thousand: 13000, monthly_footfall: 410000, online_sales_pct: 46, fresh_wastage_pct: 4.2, avg_customer_rating: 4.84, stockout_incidents: 3, pickup_fulfillment: 99, data_period: "2023-03" },
  { store_id: 5, store_name: "Chennai Super 2", region: "South", store_format: "Super", revenue_inr_thousand: 5800, monthly_footfall: 172000, online_sales_pct: 33, fresh_wastage_pct: 5.8, avg_customer_rating: 4.45, stockout_incidents: 11, pickup_fulfillment: 97, data_period: "2023-03" },
  { store_id: 6, store_name: "Hyderabad Nbhd 5", region: "South", store_format: "Neighbourhood", revenue_inr_thousand: 2200, monthly_footfall: 49000, online_sales_pct: 18, fresh_wastage_pct: 8.2, avg_customer_rating: 3.88, stockout_incidents: 29, pickup_fulfillment: 87, data_period: "2023-03" },
  { store_id: 7, store_name: "Kolkata Hyper 2", region: "East", store_format: "Hyper", revenue_inr_thousand: 9100, monthly_footfall: 260000, online_sales_pct: 22, fresh_wastage_pct: 6.9, avg_customer_rating: 4.35, stockout_incidents: 14, pickup_fulfillment: 0, data_period: "2023-03" },
  { store_id: 8, store_name: "Bhubaneswar Exp 1", region: "East", store_format: "Express", revenue_inr_thousand: 2500, monthly_footfall: 74000, online_sales_pct: 29, fresh_wastage_pct: 8.2, avg_customer_rating: 3.85, stockout_incidents: 22, pickup_fulfillment: 0, data_period: "2023-03" },
  { store_id: 9, store_name: "Mumbai Hyper 3", region: "West", store_format: "Hyper", revenue_inr_thousand: 13500, monthly_footfall: 440000, online_sales_pct: 48, fresh_wastage_pct: 4.5, avg_customer_rating: 4.88, stockout_incidents: 2, pickup_fulfillment: 98, data_period: "2023-03" },
  { store_id: 10, store_name: "Pune Express 5", region: "West", store_format: "Express", revenue_inr_thousand: 3400, monthly_footfall: 95000, online_sales_pct: 41, fresh_wastage_pct: 8.4, avg_customer_rating: 3.82, stockout_incidents: 24, pickup_fulfillment: 93, data_period: "2023-03" },

  // 2023-04
  { store_id: 1, store_name: "Delhi Super 1", region: "North", store_format: "Super", revenue_inr_thousand: 5800, monthly_footfall: 164000, online_sales_pct: 33, fresh_wastage_pct: 4.5, avg_customer_rating: 4.80, stockout_incidents: 8, pickup_fulfillment: 98, data_period: "2023-04" },
  { store_id: 2, store_name: "Noida Express 1", region: "North", store_format: "Express", revenue_inr_thousand: 2900, monthly_footfall: 85000, online_sales_pct: 40, fresh_wastage_pct: 7.8, avg_customer_rating: 4.10, stockout_incidents: 15, pickup_fulfillment: 0, data_period: "2023-04" },
  { store_id: 3, store_name: "Gurugram Hyper 1", region: "North", store_format: "Hyper", revenue_inr_thousand: 11500, monthly_footfall: 335000, online_sales_pct: 26, fresh_wastage_pct: 5.4, avg_customer_rating: 4.55, stockout_incidents: 5, pickup_fulfillment: 96, data_period: "2023-04" },
  { store_id: 4, store_name: "Bengaluru Hyper 1", region: "South", store_format: "Hyper", revenue_inr_thousand: 13800, monthly_footfall: 425000, online_sales_pct: 48, fresh_wastage_pct: 3.9, avg_customer_rating: 4.88, stockout_incidents: 2, pickup_fulfillment: 99, data_period: "2023-04" },
  { store_id: 5, store_name: "Chennai Super 2", region: "South", store_format: "Super", revenue_inr_thousand: 6200, monthly_footfall: 179000, online_sales_pct: 35, fresh_wastage_pct: 5.5, avg_customer_rating: 4.50, stockout_incidents: 9, pickup_fulfillment: 97, data_period: "2023-04" },
  { store_id: 6, store_name: "Hyderabad Nbhd 5", region: "South", store_format: "Neighbourhood", revenue_inr_thousand: 2500, monthly_footfall: 52000, online_sales_pct: 20, fresh_wastage_pct: 7.9, avg_customer_rating: 3.95, stockout_incidents: 25, pickup_fulfillment: 88, data_period: "2023-04" },
  { store_id: 7, store_name: "Kolkata Hyper 2", region: "East", store_format: "Hyper", revenue_inr_thousand: 9700, monthly_footfall: 270000, online_sales_pct: 24, fresh_wastage_pct: 6.5, avg_customer_rating: 4.40, stockout_incidents: 11, pickup_fulfillment: 0, data_period: "2023-04" },
  { store_id: 8, store_name: "Bhubaneswar Exp 1", region: "East", store_format: "Express", revenue_inr_thousand: 2800, monthly_footfall: 78000, online_sales_pct: 31, fresh_wastage_pct: 7.9, avg_customer_rating: 3.92, stockout_incidents: 18, pickup_fulfillment: 0, data_period: "2023-04" },
  { store_id: 9, store_name: "Mumbai Hyper 3", region: "West", store_format: "Hyper", revenue_inr_thousand: 14200, monthly_footfall: 455000, online_sales_pct: 50, fresh_wastage_pct: 4.2, avg_customer_rating: 4.90, stockout_incidents: 1, pickup_fulfillment: 98, data_period: "2023-04" },
  { store_id: 10, store_name: "Pune Express 5", region: "West", store_format: "Express", revenue_inr_thousand: 3800, monthly_footfall: 99000, online_sales_pct: 43, fresh_wastage_pct: 8.1, avg_customer_rating: 3.90, stockout_incidents: 21, pickup_fulfillment: 94, data_period: "2023-04" },
];

export default function FreshLaneDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Executive' | 'Regional'>('Executive');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [dbSource, setDbSource] = useState<string>('Local Fallback');
  
  // Info Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'use' | 'creation'>('use');

  // Trigger Modal
  const openModal = (type: 'use' | 'creation') => {
    setModalType(type);
    setModalOpen(true);
  };

  useEffect(() => {
    async function fetchSupabaseData() {
      setLoading(true);
      
      // Strict Check for valid Supabase Credentials
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
        console.log('Using Local Fallback Data Context (Keys not defined)');
        setData(fallbackStoreData);
        setDbSource('Local Demo Fallback');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        console.log("Attempting database fetch across potential tables...");
        
        // 1. Try querying 'Monthly_Activity_Data'
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('Monthly_Activity_Data')
          .select('*');
        
        if (!monthlyError && monthlyData && monthlyData.length > 0) {
          console.log(`Loaded ${monthlyData.length} records from 'Monthly_Activity_Data'`);
          setData(monthlyData);
          setDbSource('Supabase Live [Monthly_Activity_Data]');
        } else {
          console.log("Monthly_Activity_Data table fetch skipped or empty, trying monthly_activity...");
          // 2. Try querying 'monthly_activity' table
          const { data: monthlyData2, error: monthlyError2 } = await supabase
            .from('monthly_activity')
            .select('*');
          
          if (!monthlyError2 && monthlyData2 && monthlyData2.length > 0) {
            console.log(`Loaded ${monthlyData2.length} records from 'monthly_activity'`);
            setData(monthlyData2);
            setDbSource('Supabase Live [monthly_activity]');
          } else {
            console.log("monthly_activity table fetch skipped or empty, trying monthly_activity_data...");
            // 3. Try querying 'monthly_activity_data' alternative table
            const { data: altData, error: altError } = await supabase
              .from('monthly_activity_data')
              .select('*');

            if (!altError && altData && altData.length > 0) {
              console.log(`Loaded ${altData.length} records from 'monthly_activity_data'`);
              setData(altData);
              setDbSource('Supabase Live [monthly_activity_data]');
            } else {
              throw new Error(monthlyError?.message || monthlyError2?.message || altError?.message || 'Empty datasets returned');
            }
          }
        }
      } catch (err) {
        console.error('Supabase load failed, serving premium local fallback data:', err);
        setData(fallbackStoreData);
        setDbSource('Local Fallback (Active Connection Unresolved)');
      } finally {
        setLoading(false);
      }
    }

    fetchSupabaseData();
  }, []);

  // Filter Data scope
  const filteredData = useMemo(() => {
    if (selectedRegion === 'All') return data;
    return data.filter(d => d.region === selectedRegion);
  }, [data, selectedRegion]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 font-sans">
        <div className="relative flex items-center justify-center mb-6">
          <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500" />
          <Bot className="absolute w-6 h-6 text-indigo-400 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-slate-100 tracking-wide">Loading FreshLane Leadership Review...</h2>
        <p className="text-xs text-indigo-400/70 mt-1.5 font-medium uppercase tracking-wider animate-pulse">Initializing Antigravity 2.0 Engine</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans pb-16 relative">
      {/* Top Navbar */}
      <nav className="glass-panel border-b border-slate-800/80 sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left Side */}
        <div className="flex items-center space-x-3.5 text-center md:text-left">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/15 border border-indigo-400/20">
            <LayoutDashboard className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2 justify-center md:justify-start">
              <h1 className="text-lg md:text-xl font-black text-slate-50 tracking-tight leading-none">FreshLane Omni Review</h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] uppercase font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Live Operating Performance & Leadership Control</p>
          </div>
        </div>

        {/* Middle Navigation (Tabs) */}
        <div className="flex space-x-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/50">
          <button 
            onClick={() => { setActiveTab('Executive'); setSelectedRegion('All'); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all tracking-wide ${
              activeTab === 'Executive' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Executive Overview
          </button>
          <button 
            onClick={() => setActiveTab('Regional')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all tracking-wide ${
              activeTab === 'Regional' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Regional Deep Dive
          </button>
        </div>

        {/* Right Side (Judges & Credentials Links) */}
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={() => openModal('use')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>How to use</span>
          </button>
          <button 
            onClick={() => openModal('creation')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Created with AGY 2.0</span>
          </button>
        </div>
      </nav>

      {/* Main Core View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">
        
        {/* Connection Context Tag */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/10 backdrop-blur-xl gap-2">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span>Database Connection Source:</span>
            <span className="font-mono text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/15">
              {dbSource}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Vercel deployment: <a href="https://techweek2026day2.vercel.app" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">techweek2026day2.vercel.app</a>
          </div>
        </div>

        {/* Regional Filter Panel (Only active on Regional Deep Dive) */}
        {activeTab === 'Regional' && (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">Regional Targeting</h3>
                <p className="text-[10px] text-slate-400">Select a retail territory to isolate store metrics</p>
              </div>
            </div>

            <div className="relative min-w-[200px]">
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-2.5 pl-3 pr-8 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="All">All Regions</option>
                <option value="North">North Region</option>
                <option value="South">South Region</option>
                <option value="East">East Region</option>
                <option value="West">West Region</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: KPI Panels */}
        <KpiCards data={filteredData} />

        {/* Step 2: Charts Panel */}
        <ChartsSection 
          data={filteredData} 
          activeTab={activeTab} 
          selectedRegion={selectedRegion} 
        />

        {/* Step 3: Leadership Signals & Urgent Alerts */}
        <div className="mt-8">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-450 uppercase tracking-wider">Leadership Intelligence Signals</h3>
          </div>
          <SignalsAlerts data={filteredData} selectedRegion={selectedRegion} />
        </div>

      </main>

      {/* Step 4: Ask the Data conversational analyst Widget */}
      <ChatWidget />

      {/* Educational Modals */}
      <InfoModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        type={modalType} 
      />
    </div>
  );
}
