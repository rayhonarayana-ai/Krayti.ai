/**
 * Qarayti.ai — Faheem AI Engine Production Inspector & Live Console
 * Clean Architecture Presentation Component for testing, monitoring, and debugging the AI Engine
 */

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Send,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  BarChart3,
  Globe,
  Settings,
  Sparkles,
  Zap,
  BookOpen,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
} from 'lucide-react';
import { container } from '../../../core/di/container';
import { FaheemService } from '../../../domain/services/faheem.service';
import { FaheemHealthCheck } from '../../../core/faheem/monitoring/faheem-health';
import {
  FaheemRoleContext,
  FaheemQueryResponseDTO,
  FaheemMetrics,
  FaheemSession,
} from '../../../domain/types/faheem.types';
import { EducationLanguage } from '../../../domain/types/education.types';

export const FaheemEngineContainer: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<FaheemRoleContext>('student');
  const [selectedLanguage, setSelectedLanguage] = useState<EducationLanguage>(EducationLanguage.ARABIC);
  const [queryInput, setQueryInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<FaheemSession | null>(null);
  const [lastResponse, setLastResponse] = useState<FaheemQueryResponseDTO | null>(null);
  const [metrics, setMetrics] = useState<FaheemMetrics | null>(null);
  const [health, setHealth] = useState<unknown | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; time: string }>
  >([]);

  useEffect(() => {
    loadEngineStatus();
  }, []);

  const loadEngineStatus = () => {
    try {
      if (container.has('FaheemService')) {
        const service = container.resolve<FaheemService>('FaheemService');
        service.getEngineMetrics().then((m) => setMetrics(m));
      }
      if (container.has('FaheemHealthCheck')) {
        const healthCheck = container.resolve<FaheemHealthCheck>('FaheemHealthCheck');
        setHealth(healthCheck.check());
      }
    } catch (err) {
      console.error('Failed to load Faheem status:', err);
    }
  };

  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      const service = container.resolve<FaheemService>('FaheemService');
      const sess = await service.startSession('usr-demouser-001', selectedRole, selectedLanguage);
      setActiveSession(sess);
      setConversationHistory([]);
      setLastResponse(null);
      await refreshMetrics();
    } catch (err) {
      console.error('Failed to start session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim() || isLoading) return;

    const currentQuery = queryInput;
    setQueryInput('');
    setIsLoading(true);

    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setConversationHistory((prev) => [...prev, { role: 'user', content: currentQuery, time: nowTime }]);

    try {
      const service = container.resolve<FaheemService>('FaheemService');
      const response = await service.query({
        sessionId: activeSession?.id,
        userId: 'usr-demouser-001',
        query: currentQuery,
        role: selectedRole,
        language: selectedLanguage,
        enableTools: true,
      });

      setLastResponse(response);
      setConversationHistory((prev) => [
        ...prev,
        { role: 'assistant', content: response.content, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
      ]);

      await refreshMetrics();
    } catch (err) {
      console.error('Query execution error:', err);
      setConversationHistory((prev) => [
        ...prev,
        { role: 'assistant', content: `[Faheem Engine Error]: ${(err as Error).message}`, time: nowTime },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMetrics = async () => {
    try {
      const service = container.resolve<FaheemService>('FaheemService');
      const updatedMetrics = await service.getEngineMetrics();
      setMetrics(updatedMetrics);
    } catch {
      // ignore
    }
  };

  const presetQueries = [
    { label: 'رياضيات - أعداد عقدية (Bac Math)', query: 'اشرح لي درس الأعداد العقدية للعلوم الرياضية وكيف تعوض في الامتحان الوطني' },
    { label: 'نقط مسار (Massar Grades)', query: 'شنو هما النقط ديالي ف مسار وهل عندي امكانية نطلع المعدل؟' },
    { label: 'فيزياء - موجات (Physics Waves)', query: 'Comment calculer la célérité d\'une onde mécanique progressive ?' },
    { label: 'استفسار ولي الأمر (Parent Question)', query: 'كيف يمكنني مساعدة ابني في تنظيم وقته للاستعداد للامتحان الوطني للبكالوريا؟' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-xl p-6 text-white shadow-xl border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <BrainCircuit className="w-9 h-9 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight">Faheem AI Engine (نظام فهيم الذكي)</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full">
                  Production v1.0
                </span>
              </div>
              <p className="text-emerald-100/80 text-sm mt-1">
                Official AI Orchestrator for the Moroccan Educational System (وزارة التربية الوطنية) • Gemini 3.6 Flash Powered
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleStartSession}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-sm transition shadow-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{activeSession ? 'Re-Initialize Session' : 'Start AI Session'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics & Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Queries</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{metrics?.totalQueries ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Real-time throughput</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg Latency</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{metrics?.avgLatencyMs ?? 0} ms</div>
          <div className="text-[11px] text-slate-500 mt-1">Pipeline execution speed</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Input Tokens</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{metrics?.totalInputTokens ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Prompt & context tokens</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Output Tokens</span>
            <Terminal className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{metrics?.totalOutputTokens ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Generated completion tokens</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Cost (MAD)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics?.costEstimateMAD ?? '0.0000'} MAD</div>
          <div className="text-[11px] text-slate-500 mt-1">Dirhams (USD * 10.1)</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Safety Alerts</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{metrics?.safetyFlagsCount ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Cheating & PII flags</div>
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Configuration & Context Selector */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Orchestrator Settings</span>
            </h3>

            {/* Role Context Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Context Persona Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as FaheemRoleContext)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg p-2.5 focus:border-emerald-500 outline-none"
              >
                <option value="student">Student Tutor (طالب - تلميذ)</option>
                <option value="parent">Parent Advisor (ولي الأمر)</option>
                <option value="teacher">Teacher Copilot (أستاذ - معلم)</option>
                <option value="school_admin">School Manager (مدير مؤسسة)</option>
                <option value="curriculum">Curriculum Specialist (خبير مناهج)</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Target Language / Strategy</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as EducationLanguage)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg p-2.5 focus:border-emerald-500 outline-none"
              >
                <option value={EducationLanguage.ARABIC}>Arabic (العربية الفصحى)</option>
                <option value={EducationLanguage.DARIJA}>Moroccan Darija (الدارجة المغربية)</option>
                <option value={EducationLanguage.FRENCH}>French (Français Option BIOF)</option>
                <option value={EducationLanguage.ENGLISH}>English</option>
              </select>
            </div>

            {/* Active Session Info */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Active Session ID:</span>
                <span className="text-emerald-400 font-mono">{activeSession?.id ?? 'Not started'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>School Tenant:</span>
                <span className="text-slate-200">Lycée Moulay Youssef (Rabat)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>AREF Region:</span>
                <span className="text-slate-200">Rabat-Salé-Kénitra</span>
              </div>
            </div>
          </div>

          {/* Preset Prompts */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Quick Test Presets</span>
            </h3>
            <div className="space-y-2">
              {presetQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setQueryInput(item.query)}
                  className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/80 text-xs text-slate-300 rounded-lg border border-slate-800 transition"
                >
                  <div className="font-semibold text-emerald-400 mb-0.5">{item.label}</div>
                  <div className="truncate text-slate-400">{item.query}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle & Right Panel: Live Conversation & Telemetry Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Chat Console */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Faheem Live Execution Console</h3>
              </div>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Ready</span>
              </span>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {conversationHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6 space-y-3">
                  <BrainCircuit className="w-12 h-12 text-slate-700 stroke-[1.5]" />
                  <p className="text-sm">No turns recorded in this session yet.</p>
                  <p className="text-xs text-slate-600 max-w-sm">
                    Select a query preset on the left or type a custom query below to test the Faheem AI Engine pipeline.
                  </p>
                </div>
              ) : (
                conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1">
                      <span>{msg.role === 'user' ? 'User / Student' : 'Faheem AI (فهيم)'}</span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-xl p-4 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Query Form */}
            <form onSubmit={handleSendQuery} className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask Faheem in Arabic, Darija, French, or English..."
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !queryInput.trim()}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-sm transition flex items-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Last Response Telemetry & Tool Call Breakdown */}
          {lastResponse && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span>Turn Telemetry & Tool Execution Log</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Message ID:</span>
                  <span className="text-slate-200 font-mono">{lastResponse.messageId}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Latency:</span>
                  <span className="text-emerald-400 font-semibold">{lastResponse.latencyMs} ms</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Total Tokens:</span>
                  <span className="text-slate-200 font-semibold">{lastResponse.tokensUsed.totalTokens}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Safety Status:</span>
                  <span className={lastResponse.safety.isSafe ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {lastResponse.safety.level}
                  </span>
                </div>
              </div>

              {/* Executed Tools */}
              {lastResponse.toolExecutions.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Executed Moroccan System Tools:</label>
                  <div className="space-y-2">
                    {lastResponse.toolExecutions.map((t, i) => (
                      <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between items-center text-emerald-400 font-mono font-semibold">
                          <span>{t.toolName}</span>
                          <span className="text-slate-400 text-[11px]">{t.durationMs} ms</span>
                        </div>
                        <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-slate-900 rounded">
                          {JSON.stringify(t.result, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
