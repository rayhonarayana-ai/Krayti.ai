/**
 * Qarayti.ai — Enterprise System Validation (Golden Path E2E Execution UI)
 * Live execution and visual validation of all 12 operational steps from Teacher to Super Admin.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  BrainCircuit,
  FileCheck2,
  GraduationCap,
  Users,
  Bell,
  Activity,
  Terminal,
} from 'lucide-react';
import {
  enterpriseSystemValidationEngine,
  SystemValidationReport,
} from '../../../core/integration/system-validation';

export const SystemValidationView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<SystemValidationReport | null>(null);

  const handleExecuteValidation = async () => {
    setIsRunning(true);
    setReport(null);
    try {
      const res = await enterpriseSystemValidationEngine.runGoldenPathValidation();
      setReport(res);
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ENTERPRISE OPERATIONAL VALIDATION
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  GOLDEN PATH E2E
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-1.5 flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
                <span>تدقيق التشغيل الشامل (Enterprise System Validation)</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                اختبار سيناريو المسار الذهبي المتكامل من الأستاذ، بنك الأسئلة، التصحيح الآلي بـ OCR، التكيف الذكي، Faheem AI، بوابات أولياء الأمور، وإشارات حافلة الأحداث Event Bus.
              </p>
            </div>

            <button
              onClick={handleExecuteValidation}
              disabled={isRunning}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-xl hover:scale-[1.02] shrink-0 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-white" />
                  <span>جاري تشغيل الفحص الشامل...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-white" />
                  <span>تشغيل المسار الذهبي E2E الان</span>
                </>
              )}
            </button>
          </div>

          {/* Results Summary Bar */}
          {report && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">النتيجة العامة</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>جاهز للإنتاج ({report.validationScorePercentage}%)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">الزمن الإجمالي</div>
                <div className="text-lg font-black text-indigo-300 mt-0.5 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{report.totalExecutionTimeMs} ms</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">عدد الخطوات المفحوصة</div>
                <div className="text-lg font-black text-white mt-0.5">
                  {report.steps.filter((s) => s.status === 'PASS').length} / {report.steps.length} ناجحة
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">معرف التتبع Distributed Trace</div>
                <div className="text-xs font-mono font-bold text-slate-300 mt-1 truncate">
                  {report.traceId}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Steps Execution List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <span>خطوات السيناريو الذهبي E2E (Golden Path Execution Flow)</span>
        </h3>

        {!report && !isRunning && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              اضغط على زر "تشغيل المسار الذهبي E2E الان" للتحقق من سلامة كافة الطبقات.
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              سيقوم المحرك بالتحقق الميداني المباشر من الاتصال والتكامل التلقائي بين الأستاذ، بنك الأسئلة، التصحيح الآلي، المحرك التكيفي، Faheem AI، وتتبع الأحداث Governance Event Bus.
            </p>
          </div>
        )}

        {report && (
          <div className="space-y-2.5">
            {report.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center shrink-0 border border-indigo-200/50">
                    {step.stepNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {step.stepName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                        {step.subsystem}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {step.details}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {step.latencyMs} ms
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block truncate max-w-[120px]">
                      {step.traceCorrelationId}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
                      step.status === 'PASS'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300/50'
                    }`}
                  >
                    {step.status === 'PASS' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PASS</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>FAIL</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
