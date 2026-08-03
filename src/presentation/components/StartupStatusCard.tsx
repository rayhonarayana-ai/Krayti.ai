/**
 * Qarayti.ai — Startup Sequence Diagnostic Card
 */

import React from 'react';
import { StartupReport } from '../../core/startup/startup.sequence';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Database, Server } from 'lucide-react';

interface StartupStatusCardProps {
  report: StartupReport | null;
  onReboot: () => void;
}

export const StartupStatusCard: React.FC<StartupStatusCardProps> = ({ report, onReboot }) => {
  if (!report) {
    return (
      <div className="bg-[#161920] border border-[#2D333D] p-6 text-center text-[#8E9299] font-mono text-xs">
        Initializing boot sequence...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-serif italic text-[#EAE9E6]">Startup Boot Status</h2>
              <span
                className={`px-2.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider border ${
                  report.success
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {report.success ? 'ALL SUBSYSTEMS OPERATIONAL' : 'SYSTEM DEGRADED'}
              </span>
            </div>
            <p className="text-xs font-mono text-[#8E9299] mt-2">
              Boot timestamp: {new Date(report.timestamp).toLocaleTimeString()} • Duration:{' '}
              <strong className="text-[#D4AF37]">{report.durationMs} ms</strong>
            </p>
          </div>

          <button
            onClick={onReboot}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#EAE9E6] bg-[#0F1115] hover:bg-[#1A1D23] border border-[#2D333D] hover:border-[#D4AF37] transition"
          >
            Re-run Boot Sequence
          </button>
        </div>
      </div>

      {/* Subsystems List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.subsystems.map((sub, idx) => {
          const getIcon = () => {
            if (sub.status === 'HEALTHY') return <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
            if (sub.status === 'DEGRADED') return <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
            return <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
          };

          return (
            <div
              key={idx}
              className="bg-[#161920] border border-[#2D333D] p-5 hover:border-[#D4AF37]/50 transition border-l-2 border-l-[#D4AF37]"
            >
              <div className="flex items-start space-x-3">
                {getIcon()}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-serif italic text-[#EAE9E6]">{sub.name}</h3>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${
                        sub.status === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : sub.status === 'DEGRADED'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#8E9299] mt-1 font-sans">{sub.message}</p>

                  {sub.details && (
                    <div className="mt-3 bg-[#0F1115] p-3 border border-[#2D333D]">
                      <pre className="text-[11px] font-mono text-[#A9B1D6] overflow-x-auto">
                        {JSON.stringify(sub.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
