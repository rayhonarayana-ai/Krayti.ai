/**
 * Qarayti.ai — Centralized Live Structured Log Console
 */

import React, { useState, useEffect } from 'react';
import { logger, LogEntry, LogLevel } from '../../core/logging/logger';
import { Terminal, Trash2, Filter, Search, RefreshCw } from 'lucide-react';

export const LiveLogConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(logger.getHistory());
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = logger.subscribe(() => {
      setLogs(logger.getHistory());
    });
    return () => unsubscribe();
  }, []);

  const handleClear = () => {
    logger.clearHistory();
    setLogs([]);
  };

  const filteredLogs = logs.filter((entry) => {
    const matchesLevel = selectedLevel === 'all' || entry.level === selectedLevel;
    const matchesQuery =
      searchQuery === '' ||
      entry.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesQuery;
  });

  const getLevelBadgeClass = (level: LogLevel) => {
    switch (level) {
      case 'debug':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'info':
        return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30';
      case 'warn':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'error':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 border-l-2 border-l-[#D4AF37] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Terminal className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h2 className="text-xl font-serif italic text-[#EAE9E6]">Centralized Logger Stream</h2>
            <p className="text-xs font-mono text-[#8E9299]">Total buffered entries: {logs.length}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8E9299]" />
            <input
              type="text"
              placeholder="Filter by module or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0F1115] text-xs font-mono text-[#EAE9E6] pl-8 pr-3 py-1.5 border border-[#2D333D] focus:outline-none focus:border-[#D4AF37] w-48 md:w-60"
            />
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'all')}
            className="bg-[#0F1115] text-xs font-mono text-[#EAE9E6] px-3 py-1.5 border border-[#2D333D] focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Levels</option>
            <option value="debug">DEBUG</option>
            <option value="info">INFO</option>
            <option value="warn">WARN</option>
            <option value="error">ERROR</option>
          </select>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-mono uppercase text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center space-x-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Log Output Stream */}
      <div className="bg-[#0F1115] border border-[#2D333D] p-4 font-mono text-xs overflow-y-auto max-h-[500px] space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-[#8E9299] text-center py-12 italic">No log entries matched current filter criteria.</div>
        ) : (
          filteredLogs.map((entry) => (
            <div
              key={entry.id}
              className="p-2.5 bg-[#161920] border border-[#2D333D] hover:border-[#D4AF37]/50 transition flex flex-col md:flex-row md:items-start justify-between gap-2"
            >
              <div className="flex items-start space-x-2 min-w-0">
                <span className="text-[#8E9299] text-[10px] whitespace-nowrap pt-0.5">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border ${getLevelBadgeClass(entry.level)}`}>
                  {entry.level}
                </span>
                <span className="text-[#D4AF37] font-bold font-mono">[{entry.module}]</span>
                <span className="text-[#EAE9E6] break-words">{entry.message}</span>
              </div>

              {entry.data !== undefined && (
                <details className="mt-1 md:mt-0 text-[10px] text-[#8E9299]">
                  <summary className="cursor-pointer hover:text-[#D4AF37]">Payload Data</summary>
                  <pre className="bg-[#0F1115] p-2 mt-1 overflow-x-auto text-[#A9B1D6] border border-[#2D333D]">
                    {JSON.stringify(entry.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
