
import React, { useState } from 'react';
import { RevenueService } from '../services/geminiService';

const LeadGenerator: React.FC = () => {
  const [prospect, setProspect] = useState({ company: '', contact: '', pain: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [researching, setResearching] = useState(false);
  const revService = new RevenueService();

  const handleResearch = async () => {
    if (!prospect.company) return;
    setResearching(true);
    const research = await revService.researchCompany(prospect.company);
    setProspect({ 
      ...prospect, 
      pain: research.painPoints?.join('. ') || 'Research failed to identify specific pain points.' 
    });
    setResearching(false);
  };

  const handleGenerate = async () => {
    if (!prospect.company || !prospect.contact || !prospect.pain) return;
    setLoading(true);
    const outreach = await revService.generateOutreach(prospect);
    setResult(outreach);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="bg-[#111] p-8 rounded-2xl border border-[#222]">
            <h3 className="text-sm font-bold text-white uppercase mb-6 tracking-widest">Prospect Input</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 flex justify-between">
                  Target Company
                  <button 
                    onClick={handleResearch}
                    disabled={researching || !prospect.company}
                    className="text-yellow-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {researching ? 'RESEARCHING...' : 'AI RESEARCH'}
                  </button>
                </label>
                <input 
                  type="text" 
                  value={prospect.company}
                  onChange={(e) => setProspect({ ...prospect, company: e.target.value })}
                  placeholder="e.g., Nexus Digital SEO"
                  className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Decision Maker Name</label>
                <input 
                  type="text" 
                  value={prospect.contact}
                  onChange={(e) => setProspect({ ...prospect, contact: e.target.value })}
                  placeholder="e.g., David Chen"
                  className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Identified Pain Point</label>
                <textarea 
                  rows={4}
                  value={prospect.pain}
                  onChange={(e) => setProspect({ ...prospect, pain: e.target.value })}
                  placeholder="e.g., Spending $4k/mo on SDRs who only book 2 qualified demos."
                  className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all resize-none"
                />
              </div>
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-black font-black uppercase py-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'ANALYZING...' : 'GENERATE HIGH-CONVERSION SCRIPT'}
              </button>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl">
            <h4 className="text-blue-500 font-bold text-xs uppercase mb-2 italic">Operator Instruction</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Use Gemini-3-Pro to inject psychological triggers: Loss Aversion, Outcome Bias, and Status Framing. The goal is a reply, not a sale.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111] p-8 rounded-2xl border border-[#222] min-h-[400px] flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase mb-6 tracking-widest flex justify-between items-center">
                <span>Output Buffer</span>
                {result && (
                    <button 
                        onClick={() => navigator.clipboard.writeText(result)}
                        className="text-[10px] text-yellow-500 hover:text-white transition-colors uppercase font-black"
                    >
                        Copy to Clipboard
                    </button>
                )}
            </h3>
            {result ? (
              <div className="flex-1 mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <p className="text-sm font-bold uppercase tracking-widest">Waiting for Input...</p>
              </div>
            )}
          </div>
          
          <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-xl">
             <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black italic">!</div>
                <div>
                    <h5 className="text-yellow-500 font-bold text-xs uppercase mb-1 italic">Brutal Reminder</h5>
                    <p className="text-gray-500 text-xs leading-relaxed">
                        Personalization is the only moat. If this email looks like a template, you have failed the mission. Scale the AI, not the laziness.
                    </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadGenerator;
