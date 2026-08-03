/**
 * Qarayti.ai — Dependency Injection Inspector Component
 */

import React, { useState } from 'react';
import { container, ServiceLifetime } from '../../core/di/container';
import { Cpu, CheckCircle2, Zap, Play } from 'lucide-react';

export const DIContainerInspector: React.FC = () => {
  const [resolvedOutput, setResolvedOutput] = useState<string | null>(null);
  const registeredServices = container.getRegisteredServices();

  const handleTestResolve = (key: string) => {
    try {
      const instance = container.resolve(key);
      setResolvedOutput(
        JSON.stringify(
          {
            key,
            resolvedType: typeof instance,
            inspect: instance,
          },
          null,
          2
        )
      );
    } catch (err) {
      setResolvedOutput(
        JSON.stringify(
          {
            key,
            error: (err as Error).message,
          },
          null,
          2
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#161920] border border-[#2D333D] p-6 border-l-2 border-l-[#D4AF37]">
        <div className="flex items-center space-x-3 mb-1">
          <Cpu className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-2xl font-serif italic text-[#EAE9E6]">Dependency Injection Registry</h2>
        </div>
        <p className="text-xs font-mono text-[#8E9299]">
          Clean Architecture DI Container managing core infrastructure singletons and transient services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Services List */}
        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#8E9299] border-b border-[#2D333D] pb-2">
            Registered Services ({registeredServices.length})
          </h3>
          <div className="space-y-2">
            {registeredServices.map((service) => (
              <div
                key={service.key}
                className="flex items-center justify-between bg-[#0F1115] p-3 border border-[#2D333D]"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#D4AF37] font-mono">{service.key}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 border ${
                        service.lifetime === ServiceLifetime.SINGLETON
                          ? 'bg-amber-500/10 text-[#D4AF37] border-[#D4AF37]/30'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      {service.lifetime}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E9299] font-mono mt-1">
                    Instantiated:{' '}
                    <strong className={service.isInstantiated ? 'text-emerald-400' : 'text-[#8E9299]'}>
                      {service.isInstantiated ? 'Yes' : 'Lazy'}
                    </strong>
                  </p>
                </div>

                <button
                  onClick={() => handleTestResolve(service.key)}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono uppercase text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition"
                >
                  <Play className="w-3 h-3" />
                  <span>Resolve</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Console */}
        <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#8E9299] border-b border-[#2D333D] pb-2 mb-3">
              Resolution Inspector
            </h3>
            {resolvedOutput ? (
              <pre className="text-xs font-mono text-[#A9B1D6] bg-[#0F1115] p-4 border border-[#2D333D] overflow-x-auto max-h-80">
                {resolvedOutput}
              </pre>
            ) : (
              <div className="text-xs font-mono text-[#8E9299] bg-[#0F1115]/50 p-8 border border-[#2D333D]/50 text-center italic">
                Select a service on the left to test resolution and inspect its underlying object structure.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
