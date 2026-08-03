/**
 * Qarayti.ai — Production Foundation Shell Header
 */

import React from 'react';
import { ShieldCheck, Cpu, Terminal, Layers, BrainCircuit, Users, Bot, GraduationCap } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isReady: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isReady }) => {
  const tabs = [
    { id: 'student', label: 'Student Portal', icon: GraduationCap },
    { id: 'faheem', label: 'Faheem AI Engine', icon: Bot },
    { id: 'parent', label: 'Parent Portal', icon: Users },
    { id: 'adaptive', label: 'Adaptive Learning Engine', icon: BrainCircuit },
    { id: 'startup', label: 'Startup & Health', icon: ShieldCheck },
    { id: 'di', label: 'DI Container', icon: Cpu },
    { id: 'rbac', label: 'RBAC Engine', icon: Layers },
    { id: 'education', label: 'MEN Metadata', icon: Layers },
    { id: 'logs', label: 'Log Console', icon: Terminal },
  ];

  return (
    <header className="bg-[#0F1115] border-b border-[#2D333D] text-[#EAE9E6] pt-8 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-[#2D333D]">
          <div className="flex flex-col">
            <span className="text-[#D4AF37] font-mono text-xs tracking-[0.3em] mb-2 uppercase">
              System Initialization / Sprint 01
            </span>
            <div className="flex items-baseline space-x-3">
              <h1 className="text-4xl md:text-5xl font-serif italic font-normal tracking-tight text-[#EAE9E6]">
                Qarayti.ai
              </h1>
              <span className="text-[#8E9299] font-serif italic text-lg">
                Foundation Edition
              </span>
            </div>
            <p className="text-xs font-mono text-[#8E9299] mt-2 tracking-widest uppercase">
              AI-First Educational Ecosystem • Moroccan Market • Clean Architecture
            </p>
          </div>

          <div className="flex flex-col md:items-end space-y-2">
            <div className="text-xs font-mono text-[#D4AF37] border border-[#D4AF37]/60 px-3 py-1 bg-[#D4AF37]/5 inline-flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span className="uppercase tracking-wider">
                {isReady ? 'PRODUCTION FOUNDATION READY' : 'BOOTING SUBSYSTEMS...'}
              </span>
            </div>
            <div className="text-xs font-serif text-[#8E9299] italic">
              Architecture <span className="text-[#EAE9E6]">&</span> Infrastructure Core
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap border-t-2 ${
                  isActive
                    ? 'border-[#D4AF37] bg-[#161920] text-[#D4AF37] font-bold'
                    : 'border-transparent text-[#8E9299] hover:text-[#EAE9E6] hover:bg-[#161920]/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-[#8E9299]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
