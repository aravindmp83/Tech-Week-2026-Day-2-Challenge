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

import localStoreData from './data/monthly_activity.json';
import yearlyStoreMaster from './data/yearly_operations.json';

// Beautiful Local Mock Store Data (Fallback)
const fallbackStoreData = localStoreData;

// Utility to enrich monthly activity records with yearly store master configurations
const enrichStoreData = (monthlyData: any[]) => {
  if (!monthlyData || monthlyData.length === 0) return [];
  
  // Create a map of store_id to yearly master record
  const masterMap = new Map<string, any>();
  yearlyStoreMaster.forEach((store: any) => {
    if (store.store_id) {
      masterMap.set(store.store_id, store);
    }
  });

  return monthlyData.map((record: any) => {
    const storeId = record.store_id;
    const masterRecord = masterMap.get(storeId);
    if (masterRecord) {
      return {
        ...record,
        floor_area_sqft: masterRecord.floor_area_sqft,
        total_staff: masterRecord.total_staff,
        checkout_counters: masterRecord.checkout_counters,
        self_checkout_counters: masterRecord.self_checkout_counters,
        loyalty_members_enrolled: masterRecord.loyalty_members_enrolled,
        omnichannel_pickup_enabled: masterRecord.omnichannel_pickup_enabled,
        pickup_bays: masterRecord.pickup_bays,
        cold_storage_units: masterRecord.cold_storage_units,
        store_age_years: masterRecord.store_age_years,
        last_refurbishment_year: masterRecord.last_refurbishment_year,
        parking_slots: masterRecord.parking_slots,
        active_categories_count: masterRecord.active_categories_count,
        nps_score_baseline: masterRecord.nps_score_baseline,
      };
    }
    return record;
  });
};

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
        setData(enrichStoreData(fallbackStoreData));
        setDbSource('Local Demo Fallback');
        setLoading(false);
        return;
      }

      try {
        let sanitizedUrl = supabaseUrl.trim();
        if (sanitizedUrl.endsWith('/')) {
          sanitizedUrl = sanitizedUrl.slice(0, -1);
        }
        if (sanitizedUrl.endsWith('/rest/v1')) {
          sanitizedUrl = sanitizedUrl.slice(0, -8);
        }
        
        console.log(`Connecting to sanitized Supabase endpoint: ${sanitizedUrl}`);
        const supabase = createClient(sanitizedUrl, supabaseAnonKey);
        
        // 1. Try querying 'Monthly_Activity_Data'
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('Monthly_Activity_Data')
          .select('*');
        
        if (!monthlyError && monthlyData && monthlyData.length > 0) {
          console.log(`Loaded ${monthlyData.length} records from 'Monthly_Activity_Data'`);
          setData(enrichStoreData(monthlyData));
          setDbSource('Supabase Live [Monthly_Activity_Data]');
        } else {
          console.log("Monthly_Activity_Data table fetch skipped or empty, trying monthly_activity...");
          // 2. Try querying 'monthly_activity' table
          const { data: monthlyData2, error: monthlyError2 } = await supabase
            .from('monthly_activity')
            .select('*');
          
          if (!monthlyError2 && monthlyData2 && monthlyData2.length > 0) {
            console.log(`Loaded ${monthlyData2.length} records from 'monthly_activity'`);
            setData(enrichStoreData(monthlyData2));
            setDbSource('Supabase Live [monthly_activity]');
          } else {
            console.log("monthly_activity table fetch skipped or empty, trying monthly_activity_data...");
            // 3. Try querying 'monthly_activity_data' alternative table
            const { data: altData, error: altError } = await supabase
              .from('monthly_activity_data')
              .select('*');

            if (!altError && altData && altData.length > 0) {
              console.log(`Loaded ${altData.length} records from 'monthly_activity_data'`);
              setData(enrichStoreData(altData));
              setDbSource('Supabase Live [monthly_activity_data]');
            } else {
              throw new Error(monthlyError?.message || monthlyError2?.message || altError?.message || 'Empty datasets returned');
            }
          }
        }
      } catch (err) {
        console.error('Supabase load failed, serving premium local fallback data:', err);
        setData(enrichStoreData(fallbackStoreData));
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
