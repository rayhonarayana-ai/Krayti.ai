/**
 * Qarayti.ai — Sprint 2.3: Knowledge Intelligence Presentation View
 * Visual UI for Impact Analysis, Quality Score Auditing, Dependency Graph,
 * and Version Rollback.
 */

import React, { useState } from 'react';
import {
  BrainCircuit,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck2,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Activity,
  Zap,
  BookOpen,
} from 'lucide-react';
import { knowledgeIntelligenceDomainService } from '../../../domain/services/knowledge-intelligence.service';
import {
  ImpactAnalysisResult,
  ContentQualityReport,
  DependencyNode,
} from '../../../core/cms/knowledge-intelligence';
import { cmsDomainService } from '../../../domain/services/cms.service';

export const KnowledgeIntelligenceView: React.FC = () => {
  const [selectedKoId, setSelectedKoId] = useState('ko-math-001');
  const [activeSubTab, setActiveSubTab] = useState<'IMPACT' | 'QUALITY' | 'GRAPH' | 'ROLLBACK'>('IMPACT');

  const [impactData, setImpactData] = useState<ImpactAnalysisResult>(
    knowledgeIntelligenceDomainService.analyzeImpact('ko-math-001')
  );

  const [qualityReport, setQualityReport] = useState<ContentQualityReport>(
    knowledgeIntelligenceDomainService.validateQuality({
      id: 'ko-math-001',
      title: 'Théorème des Valeurs Intermédiaires (TVI)',
      bloomLevel: 'APPLY',
      latexFormulas: ['f(c) = k'],
    })
  );

  const [dependencyNodes] = useState<DependencyNode[]>(
    knowledgeIntelligenceDomainService.getDependencyGraph()
  );

  const [rollbackSuccess, setRollbackSuccess] = useState(false);

  const handleRunImpactAnalysis = (koId: string) => {
    setSelectedKoId(koId);
    const res = knowledgeIntelligenceDomainService.analyzeImpact(koId);
    setImpactData(res);
  };

  const handleRollback = async (version: string) => {
    const success = await knowledgeIntelligenceDomainService.rollbackKoVersion(selectedKoId, version);
    if (success) {
      setRollbackSuccess(true);
      setTimeout(() => setRollbackSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  SPRINT 2.3 — KNOWLEDGE INTELLIGENCE LAYER
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  E2E TRACE ID ACTIVE
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-1.5 flex items-center gap-2">
                <BrainCircuit className="w-7 h-7 text-purple-400" />
                <span>محرك الذكاء للمحتوى التعليمي (Knowledge Intelligence Engine)</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                تحليل الأثر الفوري (Impact Analysis)، التدقيق البيداغوجي المباشر لجودة المحتوى، شجرة الاعتماديات المفهومية، وإعادة العكس الفوري للإصدارات (Version Rollback).
              </p>
            </div>

            {/* Sub-tab navigation pills */}
            <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setActiveSubTab('IMPACT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeSubTab === 'IMPACT'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Impact Analyzer
              </button>
              <button
                onClick={() => setActiveSubTab('QUALITY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeSubTab === 'QUALITY'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Quality & Inspection
              </button>
              <button
                onClick={() => setActiveSubTab('GRAPH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeSubTab === 'GRAPH'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Dependency Graph
              </button>
              <button
                onClick={() => setActiveSubTab('ROLLBACK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeSubTab === 'ROLLBACK'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Version History
              </button>
            </div>
          </div>
        </div>
      </div>

      {rollbackSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>
            تمت استعادة الإصدار السابق لعنصر المعرفة بنجاح! تم نشر حدث Rollback عبر Event Bus للتحديث الفوري في محرك التقييم و Faheem AI.
          </span>
        </div>
      )}

      {/* SUB-TAB 1: IMPACT ANALYZER */}
      {activeSubTab === 'IMPACT' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">
                  REAL-TIME DOWNSTREAM IMPACT ANALYZER
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  تحديد الأثر المباشر لتحديث الدرس: {impactData.koTitle}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/50">
                درجة الأثر: {impactData.impactScore}
              </span>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 font-bold">بنك الأسئلة المتأثر</div>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {impactData.affectedQuestionBankCount} سؤال
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 font-bold">الامتحانات الوطنية</div>
                <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
                  {impactData.affectedExamsCount} امتحان
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 font-bold">مسارات المحرك التكيفي</div>
                <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
                  {impactData.affectedAdaptivePathsCount} مسار
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 font-bold">سياقات Faheem AI</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {impactData.affectedFaheemPromptsCount} prompt
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 font-bold">الطلاب المشمولون</div>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                  {impactData.affectedStudentsCount.toLocaleString()} طالب
                </div>
              </div>
            </div>

            {/* Impact Details Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>الامتحانات المتأثرة</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-300 text-[11px]">
                  {impactData.details.exams.map((exam, idx) => (
                    <li key={idx}>{exam}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span>الخطط العلاجية المتأثرة</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-300 text-[11px]">
                  {impactData.details.remediationPlans.map((plan, idx) => (
                    <li key={idx}>{plan}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  <span>تلقين Faheem AI Prompts</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-300 text-[11px]">
                  {impactData.details.faheemContexts.map((ctx, idx) => (
                    <li key={idx}>{ctx}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: QUALITY & INSPECTION */}
      {activeSubTab === 'QUALITY' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">
                PEDAGOGICAL & TECHNICAL QUALITY SCORE
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                تقرير التدقيق والملاءمة الوطنية
              </h3>
            </div>
            <div className="text-2xl font-black text-emerald-500">
              {qualityReport.overallScore} / 100
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white">الفحوصات التقنية والبيداغوجية</div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span>صحة صيغ LaTeX الرياضية</span>
                  <span className="px-2 py-0.5 rounded font-black bg-emerald-100 text-emerald-700 text-[10px]">
                    {qualityReport.latexValidation}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span>المطابقة مع تصنيف بلوم (Bloom Taxonomy)</span>
                  <span className="px-2 py-0.5 rounded font-black bg-purple-100 text-purple-700 text-[10px]">
                    {qualityReport.bloomTaxonomyAlignment}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span>المرجعية الوزارية MENPS</span>
                  <span className="px-2 py-0.5 rounded font-black bg-teal-100 text-teal-700 text-[10px]">
                    {qualityReport.ministryComplianceStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span>سلامة روابط الملتيميديا</span>
                  <span className="px-2 py-0.5 rounded font-black bg-emerald-100 text-emerald-700 text-[10px]">
                    {qualityReport.mediaIntegrity}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white">توصيات المفتش الآلي AI Inspector</div>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                {qualityReport.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DEPENDENCY GRAPH */}
      {activeSubTab === 'GRAPH' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">
              CONCEPTUAL PREREQUISITE DEPENDENCY GRAPH
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              شجرة اعتمادات عناصر المعرفة المفهومية
            </h3>
          </div>

          <div className="space-y-3">
            {dependencyNodes.map((node) => (
              <div
                key={node.koId}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {node.title}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                      {node.competencyCode}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    الاشتراطات المسبقة: {node.prerequisitesKoIds.length > 0 ? node.prerequisiteKoIds.join(', ') : 'لا يوجد (درس افتتاحي)'}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold block">العناصر التابعة لاحقاً:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    {node.downstreamKoIds.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: VERSION HISTORY & ROLLBACK */}
      {activeSubTab === 'ROLLBACK' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">
              VERSION GRAPH & INSTANT ROLLBACK MANAGER
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              سجل الإصدارات والإعادة إلى النسخ السابقة
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">v2026.2.0-OFFICIAL</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                    CURRENT PUBLISHED
                  </span>
                </div>
                <p className="text-slate-500 mt-1">تمت إضافة أمثلة محلولة إضافية وتحديث صيغة TAF الموجهة لـ Faheem AI.</p>
              </div>
              <span className="text-slate-400 text-[10px] font-mono">اليوم — 09:30</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">v2026.1.0-OFFICIAL</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                    ARCHIVED
                  </span>
                </div>
                <p className="text-slate-500 mt-1">النسخة الرسمية الأولى المعتمدة من المفتشية التربوية للرياضيات.</p>
              </div>
              <button
                onClick={() => handleRollback('2026.1.0-OFFICIAL')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة هذه النسخة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
