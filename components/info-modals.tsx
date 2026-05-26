'use client';

import React from 'react';
import { X, BookOpen, Cpu, Zap, Database, Play, Sparkles, MessageSquare, ShieldCheck, Check } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'use' | 'creation';
}

export default function InfoModal({ isOpen, onClose, type }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${type === 'use' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
              {type === 'use' ? <BookOpen className="w-6 h-6" /> : <Cpu className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-50 tracking-tight">
                {type === 'use' ? 'How to Use This Dashboard' : 'How This Dashboard Was Created'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {type === 'use' ? 'Executive guide to FreshLane intelligence' : 'Powered by Google Antigravity 2.0'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 relative z-10 text-slate-300 text-sm leading-relaxed">
          {type === 'use' ? (
            <>
              {/* How to use Content */}
              <div className="space-y-4">
                <p className="text-slate-300">
                  Welcome to the **FreshLane Retail Leadership Review** dashboard. This platform is designed to provide senior executives with high-level summaries and granular, region-specific operational audits.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center space-x-2 text-indigo-400 font-semibold mb-2">
                      <Zap className="w-4 h-4" />
                      <h4>Executive Overview</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      View overall corporate health. Spot monthly revenue trajectories, regional footfall counts, basket performance, and regional sales distribution.
                    </p>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-2">
                      <Sparkles className="w-4 h-4" />
                      <h4>Regional Deep Dive</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Select a specific region (North, South, East, West) from the dropdown. Review format-wise sales and examine wastage risk-matrices.
                    </p>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-100 mt-4 border-b border-slate-800 pb-2">Primary Workflows:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2.5">
                    <div className="p-0.5 bg-indigo-500/20 rounded text-indigo-400 mt-0.5">
                      <Play className="w-3.5 h-3.5 fill-indigo-400" />
                    </div>
                    <span>
                      <strong>Filter & Target:</strong> Use the Regional tab to trigger specific data queries. The entire dashboard (KPIs, Charts, and Alerts) immediately updates.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="p-0.5 bg-indigo-500/20 rounded text-indigo-400 mt-0.5">
                      <Play className="w-3.5 h-3.5 fill-indigo-400" />
                    </div>
                    <span>
                      <strong>Audit At-Risk Stores:</strong> Review the dynamic **Signals & Alerts** panel. Stores listed under <em>Immediate Attention Required</em> represent severe operational drift (high wastage and poor customer reviews).
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <div className="p-0.5 bg-indigo-500/20 rounded text-indigo-400 mt-0.5">
                      <Play className="w-3.5 h-3.5 fill-indigo-400" />
                    </div>
                    <span>
                      <strong>Chat with your Data:</strong> Click the "Ask the Data" widget in the bottom-right corner. Type queries like <em>"Which store has the highest stockout?"</em> to get instant, LLM-generated summaries of your Supabase records.
                    </span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* How it was created Content */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-950 flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400 animate-pulse">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-50 font-bold">Rebuilt with Google Antigravity 2.0</h4>
                    <p className="text-xs text-indigo-300/80 mt-0.5">Autonomous Multi-Agent AI Software Engineering System</p>
                  </div>
                </div>

                <p className="text-slate-300">
                  This dashboard was fully migrated, refactored, and engineered using **Google Antigravity 2.0**—a highly autonomous agentic AI software developer. The entire implementation process was executed programmatically from the root of the workspace.
                </p>

                <h3 className="font-semibold text-slate-100 border-b border-slate-800 pb-2">Technical Architecture Highlights:</h3>
                <ul className="space-y-3.5 text-xs text-slate-400">
                  <li className="flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-200 block">1. Zero-Error Root Scaffolding</strong>
                      Cleaned the legacy subdirectory configurations, relocated the Next.js App Router natively to the project root, and configured strict TypeScript, Tailwind CSS v4, and PostCSS to prevent Vercel 404 routing anomalies.
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Database className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-200 block">2. Supabase Secure Connectivity</strong>
                      Constructed a real-time data layer connecting directly to your remote Supabase instance. Keys are secured in `.env.local` locally and loaded via encrypted Vercel environment variables, keeping them hidden from GitHub.
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-200 block">3. Programmatic Real-Time Alert Engine</strong>
                      Designed a custom analytics engine that performs multi-variable scans on live data tables to programmatically isolate underperforming retail zones based on wastage rates, rating thresholds, and stockout metrics.
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-200 block">4. Dynamic Gemini AI Data Chat</strong>
                      Engineered a Next.js server-side `/api/chat` Route Handler integrating the Google **Gemini 1.5/2.0 API** (`@google/generative-ai` SDK). The model reads the active database context securely to provide factual, conversational answers in milliseconds.
                    </div>
                  </li>
                </ul>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-400 space-y-1.5 mt-2">
                  <div className="text-indigo-400">// Antigravity 2.0 Git Commit Log</div>
                  <div>$ git log -n 1 --oneline</div>
                  <div className="text-slate-300">a4f6d3e feat: reboot FreshLane dashboard using Google Antigravity 2.0 multi-agent architecture</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-850 flex justify-end relative z-10">
          <button 
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-sm ${
              type === 'use' 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-505 text-white'
            }`}
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
