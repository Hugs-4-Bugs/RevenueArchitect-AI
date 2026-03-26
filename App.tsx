
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ICONS, REVENUE_GOAL } from './constants';
import Dashboard from './components/Dashboard';
import StrategyRoom from './components/StrategyRoom';
import LeadGenerator from './components/LeadGenerator';
import Checklist from './components/Checklist';
import AgentConsole from './components/AgentConsole';
import Login from './components/Login';
import { RevenueService } from './services/geminiService';
import { io, Socket } from 'socket.io-client';

const INITIAL_TASKS = [
  { id: 1, label: 'Identify 50 High-Ticket Agencies on LinkedIn', cat: 'Lead Generation', done: false },
  { id: 2, label: 'Enrich 50 Leads with Pain Point Data (Job Ads/Case Studies)', cat: 'Lead Generation', done: false },
  { id: 3, label: 'Send 20 Hyper-Personalized Emails via Gemini', cat: 'Sales Outreach', done: false },
  { id: 4, label: 'Follow up on previous 5-day replies', cat: 'Sales Outreach', done: false },
  { id: 5, label: 'Optimize Qualification Agent Prompt based on rejections', cat: 'Agent Building', done: false },
  { id: 6, label: 'Audit conversion metrics for Daily Log', cat: 'Strategy & Analysis', done: false },
  { id: 7, label: 'Analyze and refine the current pricing model based on market feedback', cat: 'Strategy & Analysis', done: false },
  { id: 8, label: 'Develop AI-driven logic for automated follow-up sequences', cat: 'Sales Outreach', done: false },
  { id: 9, label: 'Automate lead enrichment process using AI', cat: 'Agent Building', done: false },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'strategy' | 'leads' | 'checklist'>('dashboard');
  const [currentRevenue, setCurrentRevenue] = useState(1250);
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ leads: 142, sent: 89, replies: 4, bookings: 1 });
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [nextRun, setNextRun] = useState(30);
  const [isThinking, setIsThinking] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [totalProjected, setTotalProjected] = useState(() => {
    const saved = localStorage.getItem('ra_total_projected');
    return saved ? parseInt(saved) : 100000;
  });
  const [goalChangeLog, setGoalChangeLog] = useState<{ count: number, month: number }>(() => {
    const saved = localStorage.getItem('ra_goal_change_log');
    const currentMonth = new Date().getMonth();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.month === currentMonth) return parsed;
    }
    return { count: 0, month: currentMonth };
  });
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState(totalProjected.toString());
  const [goalError, setGoalError] = useState('');

  const socketRef = useRef<Socket | null>(null);
  
  const [revService] = useState(() => new RevenueService());

  useEffect(() => {
    const auth = localStorage.getItem('ra_auth');
    if (auth === 'true') setIsAuthenticated(true);

    // Check LinkedIn status
    fetch('/api/auth/linkedin/status')
      .then(res => res.json())
      .then(data => setIsLinkedInConnected(data.connected));

    localStorage.setItem('ra_total_projected', totalProjected.toString());
    localStorage.setItem('ra_goal_change_log', JSON.stringify(goalChangeLog));

    // Socket connection
    socketRef.current = io();
    socketRef.current.on('agent_log', (log: any) => {
      addLog(log.message, log.type);
      if (log.message.includes('MISSION_COMPLETE')) {
        setIsThinking(false);
        setIsAgentActive(false);
        // Mark the first incomplete task as done
        setTasks(prev => {
          const nextIncomplete = prev.find(t => !t.done);
          if (nextIncomplete) {
            return prev.map(t => t.id === nextIncomplete.id ? { ...t, done: true } : t);
          }
          return prev;
        });
      }
    });

    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'linkedin') {
        setIsLinkedInConnected(true);
        addLog("LINKEDIN_SYNC: Connection established. High-throughput data access granted.", "success");
      }
    };
    window.addEventListener('message', handleOAuthMessage);

    return () => {
      socketRef.current?.disconnect();
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, []);

  const handleConnectLinkedIn = async () => {
    try {
      const res = await fetch('/api/auth/linkedin/url');
      const data = await res.json();
      
      if (data.error === 'MISSING_CREDENTIALS') {
        addLog("AUTH_ERROR: LinkedIn Client ID is missing. Please configure it in the Settings menu.", "error");
        return;
      }

      if (data.url) {
        window.open(data.url, 'linkedin_oauth', 'width=600,height=700');
      } else {
        throw new Error("Invalid URL returned from server");
      }
    } catch (err) {
      addLog("AUTH_ERROR: Failed to initialize LinkedIn handshake. Check server logs.", "error");
    }
  };

  const handleDisconnectLinkedIn = async () => {
    await fetch('/api/auth/linkedin/disconnect', { method: 'POST' });
    setIsLinkedInConnected(false);
    addLog("LINKEDIN_SYNC: Connection terminated.", "warning");
  };

  const handleUpdateGoal = () => {
    const currentMonth = new Date().getMonth();
    let log = { ...goalChangeLog };
    
    if (log.month !== currentMonth) {
      log = { count: 0, month: currentMonth };
    }

    if (log.count >= 3) {
      setGoalError("CRITICAL_LIMIT: You have reached the maximum of 3 goal adjustments for this month.");
      return;
    }

    const newGoal = parseInt(tempGoal);
    if (isNaN(newGoal) || newGoal <= 0) {
      setGoalError("INVALID_INPUT: Goal must be a positive integer.");
      return;
    }

    setTotalProjected(newGoal);
    setGoalChangeLog({ ...log, count: log.count + 1 });
    setShowGoalModal(false);
    setGoalError('');
    addLog(`STRATEGY_SYNC: Revenue target adjusted to $${newGoal.toLocaleString()}. Monthly adjustments: ${log.count + 1}/3.`, "strategy");
  };

  const dashboardData = {
    totalProjected,
    mrr: Math.round(totalProjected / 12),
    ltv: Math.round(totalProjected / 8),
    cac: Math.round((totalProjected * 0.015) / 100)
  };

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' | 'agent' | 'strategy' = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36),
      timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      message,
      type
    }].slice(-100));
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
  };

  const runAgentCycle = useCallback(async () => {
    if (!isAgentActive) return;
    
    if (!isLinkedInConnected) {
      addLog("MISSION_ABORT: LinkedIn connection required for autonomous lead generation.", "error");
      setIsAgentActive(false);
      return;
    }

    setIsThinking(true);
    socketRef.current?.emit('start_agent_mission', { mission: "Lead Enrichment & Agency Identification" });
  }, [isAgentActive, isLinkedInConnected]);

  useEffect(() => {
    let interval: any;
    if (isAgentActive) {
      setIsTerminalExpanded(true); 
      interval = setInterval(() => {
        setNextRun(r => {
          if (r <= 1) {
            runAgentCycle();
            return 30;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
      setNextRun(30);
    }
    return () => clearInterval(interval);
  }, [isAgentActive, runAgentCycle]);

  if (!isAuthenticated) return <Login onAuthenticated={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
      {/* Goal Update Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#222] w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-white uppercase italic mb-2">Adjust Revenue Target</h3>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-6">
              Current Month Limit: <span className="text-yellow-500">{3 - goalChangeLog.count} adjustments remaining</span>
            </p>
            
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">
              <p className="text-[10px] text-red-500 font-black uppercase leading-relaxed">
                WARNING: You are only allowed 3 adjustments per month. This action will consume 1 adjustment credit.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-600 uppercase mb-2 tracking-widest">Target Amount (USD)</label>
                <input 
                  type="number"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  className="w-full bg-black border border-[#222] rounded-xl px-4 py-4 text-xl font-black text-white focus:border-yellow-500 outline-none transition-all"
                />
              </div>
              
              {goalError && (
                <p className="text-[10px] text-red-500 font-bold uppercase">{goalError}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => { setShowGoalModal(false); setGoalError(''); }}
                  className="flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-gray-500 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateGoal}
                  className="flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-yellow-500 text-black hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
                >
                  Confirm Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Permanent Desktop Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 shrink-0 border-b border-[#1a1a1a]/50">
          <div className="flex justify-between items-center lg:block mb-8">
            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 italic">
              <ICONS.Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              PROF<span className="text-yellow-500">IT</span>OS
            </h1>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <nav className="space-y-1">
            <NavItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} icon={<ICONS.Target className="w-5 h-5" />} label="Command Center" />
            <NavItem active={activeTab === 'strategy'} onClick={() => { setActiveTab('strategy'); setIsMobileMenuOpen(false); }} icon={<ICONS.Dollar className="w-5 h-5" />} label="Strategy Room" />
            <NavItem active={activeTab === 'leads'} onClick={() => { setActiveTab('leads'); setIsMobileMenuOpen(false); }} icon={<ICONS.Users className="w-5 h-5" />} label="Lead Engine" />
            <NavItem active={activeTab === 'checklist'} onClick={() => { setActiveTab('checklist'); setIsMobileMenuOpen(false); }} icon={<ICONS.Code className="w-5 h-5" />} label="Execution Sprints" />
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
           <div className="bg-[#111] p-4 rounded-2xl border border-[#222]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Revenue Goal</span>
                <span className="text-[10px] font-bold text-yellow-500">{goalChangeLog.count}/3 Changes</span>
              </div>
              <button 
                onClick={() => {
                  setTempGoal(totalProjected.toString());
                  setShowGoalModal(true);
                }}
                className="w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all"
              >
                Set Target: ${totalProjected.toLocaleString()}
              </button>
           </div>

           <div className="bg-[#111] p-4 rounded-2xl border border-[#222]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">LinkedIn Sync</span>
                <div className={`w-2 h-2 rounded-full ${isLinkedInConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
              </div>
              <button 
                onClick={isLinkedInConnected ? handleDisconnectLinkedIn : handleConnectLinkedIn}
                className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all transform active:scale-95 ${
                  isLinkedInConnected ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                }`}
              >
                {isLinkedInConnected ? 'LinkedIn Connected' : 'Connect LinkedIn'}
              </button>
           </div>

           <div className="bg-[#111] p-4 rounded-2xl border border-[#222]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Autonomous Core</span>
                <div className={`w-2 h-2 rounded-full ${isAgentActive ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
              </div>
              <button 
                onClick={() => setIsAgentActive(!isAgentActive)}
                className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all transform active:scale-95 ${
                  isAgentActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                }`}
              >
                {isAgentActive ? 'Stop Automation' : 'Start Automation'}
              </button>
           </div>
           
           <div className="p-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                 <span className="text-gray-500">Goal Progress</span>
                 <span className="text-green-500">${currentRevenue}</span>
              </div>
              <div className="h-1 bg-[#222] rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 transition-all duration-1000 shadow-[0_0_8px_rgba(34,197,94,0.4)]" style={{ width: `${(currentRevenue / totalProjected) * 100}%` }} />
              </div>
           </div>
           
           <button onClick={() => { localStorage.removeItem('ra_auth'); window.location.reload(); }} className="w-full text-[9px] text-gray-700 uppercase font-black hover:text-white transition-colors pb-8">Terminate Session</button>
        </div>
      </aside>

      {/* Workspace */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050505]">
        <header className="h-20 border-b border-[#1a1a1a] flex items-center justify-between px-4 lg:px-10 bg-[#0a0a0a]/50 backdrop-blur-xl z-20">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-gray-400 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <h2 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.4em] italic truncate max-w-[120px] sm:max-w-none">
                  {activeTab.toUpperCase()} OS / REVENUE_ARCHITECT
                </h2>
              </div>
           </div>
           <div className="flex items-center gap-4 sm:gap-8">
              <StatBox label="LEADS" val={stats.leads} color="text-blue-400" />
              <StatBox label="PROFIT" val={`$${currentRevenue}`} color="text-green-500" />
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 pb-32">
           <div className="max-w-6xl mx-auto">
              {activeTab === 'dashboard' && <Dashboard data={dashboardData} />}
              {activeTab === 'strategy' && <StrategyRoom />}
              {activeTab === 'leads' && <LeadGenerator />}
              {activeTab === 'checklist' && <Checklist tasks={tasks} onToggle={toggleTask} isAgentActive={isAgentActive} />}
           </div>
        </main>

        {/* Floating Terminal Trigger */}
        <button 
           onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
           className={`fixed bottom-6 right-6 z-[60] px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl transition-all ${
             isAgentActive ? 'bg-yellow-500 text-black animate-pulse' : 'bg-[#111] text-gray-400 border border-[#222] hover:text-white'
           }`}
        >
           <ICONS.Code className="w-4 h-4" />
           {isTerminalExpanded ? 'Hide Terminal' : 'Show Logs'}
        </button>

        {/* Bottom Drawer Terminal */}
        <div className={`
          fixed inset-x-0 bottom-0 z-50 bg-black border-t border-[#1a1a1a] transition-all duration-500 ease-in-out shadow-[0_-15px_60px_rgba(0,0,0,0.9)]
          ${isTerminalExpanded ? 'h-[40vh] lg:h-[35vh]' : 'h-0 overflow-hidden'}
        `}>
           <div className="h-full flex flex-col">
              <div className="px-6 py-3 border-b border-[#1a1a1a] flex justify-between items-center bg-[#080808]">
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isAgentActive ? 'bg-yellow-500 animate-ping' : 'bg-gray-700'}`} />
                    Autonomous Agent Runtime
                 </span>
                 <button onClick={() => setIsTerminalExpanded(false)} className="text-gray-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                 </button>
              </div>
              <div className="flex-1 overflow-hidden">
                 <AgentConsole logs={logs} isWorking={isThinking} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
      active ? 'bg-white text-black font-black shadow-xl scale-[1.02]' : 'text-gray-400 hover:text-white hover:bg-[#111]'
    }`}
  >
    <div className={active ? 'text-black' : 'text-yellow-500/40'}>{icon}</div>
    <span className="text-[11px] uppercase tracking-[0.2em] truncate">{label}</span>
  </button>
);

const StatBox = ({ label, val, color = "text-white" }: any) => (
  <div className="flex flex-col items-end">
    <span className="text-[8px] sm:text-[9px] font-black text-gray-700 uppercase tracking-widest mb-0.5">{label}</span>
    <span className={`text-sm sm:text-xl font-black mono ${color} tracking-tighter`}>{val}</span>
  </div>
);

export default App;
