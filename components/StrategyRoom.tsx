
import React from 'react';

const StrategyRoom: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12 animate-in slide-in-from-bottom-4 duration-500">
      <section className="bg-[#111] p-8 rounded-2xl border border-[#222] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg width="200" height="200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        </div>
        <h2 className="text-3xl font-black text-white mb-6 uppercase italic">The Fastest Path to $10,000</h2>
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p className="text-lg">
            We are ignoring complex SaaS builds. We are building an <span className="text-yellow-500 font-bold">Autonomous Sales Agent Service</span> for mid-sized B2B Agencies.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                <h3 className="text-yellow-500 font-bold uppercase mb-4 tracking-widest text-sm">1. Target ICP</h3>
                <ul className="space-y-2 text-sm">
                    <li>• SEO/PPC Agencies (10-50 staff)</li>
                    <li>• B2B Recruiting Firms</li>
                    <li>• Custom Software Shops</li>
                    <li className="text-gray-500 italic mt-2 text-xs">Why? They have high LTV ($20k+) and high churn pain.</li>
                </ul>
            </div>
            <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                <h3 className="text-yellow-500 font-bold uppercase mb-4 tracking-widest text-sm">2. The "Sieve" Offer</h3>
                <p className="text-sm">
                    "We build an AI Sieve that scrapes 2,000 leads/mo, enriches them with proprietary data, and autonomously qualifies them via 2-way email chat. You only pay for booked demos with pre-qualified decision makers."
                </p>
                <p className="mt-4 text-xs font-bold text-green-500 uppercase">Price: $2.5k setup + $2k/mo retainer.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 tracking-[0.2em] text-center">Agent Architecture: LeadSieve-V1</h3>
        <div className="bg-[#111] p-10 rounded-2xl border border-[#222] relative">
            <div className="flex flex-col items-center space-y-8">
                <Node label="Lead Source" sub="LinkedIn/Apollo/Phantombuster" />
                <Arrow />
                <Node label="Context Processor (Gemini)" sub="Enrichment & Pain Point Inference" />
                <Arrow />
                <Node label="Personalization Engine" sub="Hyper-custom Cold Outreach" />
                <Arrow />
                <Node label="Qualification Agent" sub="Handing Replies & Objections" />
                <Arrow />
                <Node label="CRM / Calendar Sync" sub="GCal / HubSpot Integration" />
            </div>
        </div>
      </section>

      <section className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl">
        <h3 className="text-red-500 font-black uppercase text-xl mb-4 italic">Kill Criteria (When to Pivot)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 bg-black/30 rounded-lg">
                <p className="font-bold text-white mb-1">Low Engagement</p>
                <p className="text-gray-400">Response rate to cold outreach &lt; 2% after 200 sends.</p>
            </div>
            <div className="p-4 bg-black/30 rounded-lg">
                <p className="font-bold text-white mb-1">Price Pushback</p>
                <p className="text-gray-400">3+ prospects say "Too expensive" without seeing ROI.</p>
            </div>
            <div className="p-4 bg-black/30 rounded-lg">
                <p className="font-bold text-white mb-1">Time to Demo</p>
                <p className="text-gray-400">&gt; 21 days since launch without 1 sales call.</p>
            </div>
        </div>
      </section>
    </div>
  );
};

const Node = ({ label, sub }: any) => (
    <div className="w-64 bg-black border border-white/10 p-4 rounded-lg text-center shadow-lg group hover:border-yellow-500 transition-colors">
        <p className="text-sm font-black text-white uppercase">{label}</p>
        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{sub}</p>
    </div>
);

const Arrow = () => (
    <div className="h-8 w-[2px] bg-gradient-to-b from-yellow-500 to-transparent" />
);

export default StrategyRoom;
