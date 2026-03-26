
import React, { useEffect, useRef } from 'react';

interface Log {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'agent' | 'strategy';
}

interface AgentConsoleProps {
  logs: Log[];
  isWorking: boolean;
}

const AgentConsole: React.FC<AgentConsoleProps> = ({ logs, isWorking }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isWorking]);

  const renderLogMessage = (log: Log) => {
    if (log.type === 'agent') {
      return (
        <span className="text-white font-bold">
          <span className="mr-2">🤖</span>{log.message}
        </span>
      );
    }
    if (log.type === 'strategy') {
      return (
        <span className="text-white font-bold">
          <span className="mr-2">🤖</span>STRATEGY_ENGINE: <span className="text-gray-400 font-normal">{log.message}</span>
        </span>
      );
    }
    if (log.type === 'success') {
      return <span className="text-green-500">{log.message}</span>;
    }
    if (log.type === 'error') {
      return <span className="text-red-500 font-bold">CRITICAL: {log.message}</span>;
    }
    
    // Default info style for ">" messages
    const isOperator = log.message.startsWith('[') || log.message.includes('ONLINE') || log.message.startsWith('RESULT') || log.message.startsWith('SPRINT UPDATE') || log.message.startsWith('Pipeline enriched');
    return (
      <span className={isOperator ? "text-gray-200" : "text-gray-500"}>
        <span className="opacity-40 mr-2">{'>'}</span>{log.message}
      </span>
    );
  };

  return (
    <div className="h-full bg-black p-6 mono text-[12px] overflow-y-auto space-y-1.5 custom-scrollbar scroll-smooth">
      {logs.length === 0 && (
        <div className="text-gray-900 italic font-black text-center mt-10 tracking-[0.5em] uppercase">
          Waiting for automation engagement...
        </div>
      )}
      {logs.map((log) => (
        <div key={log.id} className="flex gap-4 items-start group">
          <span className="text-gray-700 shrink-0 font-bold">[{log.timestamp}]</span>
          <div className="flex-1">
            {renderLogMessage(log)}
          </div>
        </div>
      ))}
      {isWorking && (
        <div className="flex gap-4 text-yellow-500/50 animate-pulse">
          <span className="shrink-0 font-bold">[{new Date().toLocaleTimeString('en-GB', { hour12: false })}]</span>
          <span className="italic font-bold tracking-widest uppercase text-[10px] py-0.5">Agent is thinking...</span>
        </div>
      )}
    </div>
  );
};

export default AgentConsole;
