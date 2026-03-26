
import React from 'react';

interface ChecklistProps {
  tasks: any[];
  onToggle: (id: number) => void;
  isAgentActive: boolean;
}

const Checklist: React.FC<ChecklistProps> = ({ tasks, onToggle, isAgentActive }) => {
  const completedCount = tasks.filter(t => t.done).length;
  const nextTask = tasks.find(t => !t.done);

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="mb-12 text-center lg:text-left">
        <h3 className="text-3xl lg:text-5xl font-black text-white italic uppercase tracking-tighter mb-3">
          Daily Execution <span className="text-yellow-500 underline decoration-yellow-500/30">Sprints</span>
        </h3>
        <p className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-[0.4em]">
          {isAgentActive ? 'Autonomous Logic Processing Queue...' : 'Operator Manual Control Engaged'}
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          {tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => !isAgentActive && onToggle(task.id)}
              className={`group flex items-start sm:items-center gap-4 p-5 rounded-3xl border transition-all relative overflow-hidden ${
                task.done 
                  ? 'bg-green-500/5 border-green-500/10 opacity-50 grayscale' 
                  : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-yellow-500/40'
              } ${isAgentActive && nextTask?.id === task.id ? 'ring-2 ring-yellow-500 ring-offset-4 ring-offset-black' : ''} ${!isAgentActive ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {isAgentActive && nextTask?.id === task.id && (
                  <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />
              )}
              
              <div className={`shrink-0 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                task.done ? 'bg-green-500 border-green-500' : 'border-[#333]'
              }`}>
                {task.done ? (
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                ) : (
                  isAgentActive && nextTask?.id === task.id && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className={`text-sm font-black tracking-tight truncate ${task.done ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                    {task.label}
                  </p>
                  {isAgentActive && nextTask?.id === task.id && (
                    <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded-full animate-bounce">Processing</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] uppercase font-black tracking-widest text-yellow-600/80">{task.cat}</span>
                  {task.done && <span className="text-[8px] font-bold text-green-500 uppercase tracking-[0.2em]">• Completed Autonomously</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Sprint Progress</h4>
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-white italic">{Math.round((completedCount/tasks.length)*100)}%</span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-6">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-200 transition-all duration-1000" style={{ width: `${(completedCount/tasks.length)*100}%` }} />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold">
                 <span className="text-gray-600 uppercase">Tasks Remaining</span>
                 <span className="text-white">{tasks.length - completedCount}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                 <span className="text-gray-600 uppercase">Automation Speed</span>
                 <span className="text-white">1x (Optimal)</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border transition-all duration-500 ${isAgentActive ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-[#111] border-[#222] text-gray-500'}`}>
             <h5 className="text-[10px] font-black uppercase tracking-widest mb-2">System Insight</h5>
             <p className="text-xs font-bold leading-relaxed">
               {isAgentActive 
                 ? "The agent is currently simulating high-level strategic maneuvers. Efficiency is exceeding manual operator benchmarks by 400%."
                 : "Manual override active. System waiting for operator engagement to resume autonomous growth sequences."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checklist;
