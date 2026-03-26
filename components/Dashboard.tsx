
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: '01', profit: 0 },
  { day: '05', profit: 450 },
  { day: '10', profit: 1200 },
  { day: '15', profit: 3200 },
  { day: '20', profit: 5800 },
  { day: '25', profit: 8900 },
  { day: '30', profit: 12500 },
];

interface DashboardProps {
  data: {
    totalProjected: number;
    mrr: number;
    ltv: number;
    cac: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ data: dashboardData }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projected" value={`$${(dashboardData.totalProjected / 1000).toFixed(0)}k`} trend="+12.4%" />
        <StatCard title="Current MRR" value={`$${dashboardData.mrr.toLocaleString()}`} trend="+5.2%" />
        <StatCard title="Client LTV" value={`$${dashboardData.ltv.toLocaleString()}`} trend="STABLE" />
        <StatCard title="CAC" value={`$${dashboardData.cac}`} trend="-18.0%" color="text-green-500" />
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-4 lg:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-green-500 to-blue-500 opacity-20" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Revenue Velocity (30D)</h3>
            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[9px] font-bold">SYSTEM ACTIVE</span>
        </div>
        <div className="h-[200px] lg:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="day" stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '10px' }}
              />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#profitGrad)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-12">
        <div className="bg-[#0a0a0a] border border-[#222] p-5 rounded-2xl">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Market Saturation</h4>
            <div className="space-y-4">
                <ProgressBar label="B2B Agencies" percent={14} color="bg-yellow-500" />
                <ProgressBar label="SaaS Startups" percent={2} color="bg-blue-500" />
            </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] p-5 rounded-2xl">
             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Optimization Insights</h4>
             <div className="text-[11px] text-gray-400 space-y-3 leading-relaxed">
                <p className="flex gap-2">
                  <span className="text-yellow-500 font-bold">!</span>
                  Retainer pricing optimization required for Q3.
                </p>
                <p className="flex gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  Enrichment logic yielding 88% precision.
                </p>
             </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, color = "text-white" }: any) => (
  <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-5 hover:border-[#444] transition-all group">
    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 group-hover:text-yellow-500/50">{title}</p>
    <div className="flex items-baseline gap-2">
        <span className={`text-xl lg:text-2xl font-black ${color} tracking-tighter`}>{value}</span>
        <span className={`text-[9px] font-bold ${trend.startsWith('+') ? 'text-green-500' : 'text-gray-500'}`}>{trend}</span>
    </div>
  </div>
);

const ProgressBar = ({ label, percent, color }: any) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-tight mb-1">
            <span className="text-gray-400">{label}</span>
            <span className="text-white">{percent}%</span>
        </div>
        <div className="h-1.5 bg-[#111] rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }} />
        </div>
    </div>
);

export default Dashboard;
