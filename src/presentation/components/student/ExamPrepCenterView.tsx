/**
 * Qarayti.ai — Exam Preparation Center View
 * National Exam (2BAC), Regional Exam (1BAC), Mock Exams & AI Exam Analyzer
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Clock,
  CheckCircle2,
  Sparkles,
  FileText,
  Play,
  TrendingUp,
  BarChart2,
  AlertTriangle,
} from 'lucide-react';
import { ExamPreparationItem, ExamAiAnalysisResult } from '../../../domain/types/studentPortal.types';

interface ExamPrepCenterViewProps {
  exams: ExamPreparationItem[];
  onAnalyzeExam: (examId: string) => Promise<ExamAiAnalysisResult>;
}

export const ExamPrepCenterView: React.FC<ExamPrepCenterViewProps> = ({
  exams,
  onAnalyzeExam,
}) => {
  const [selectedExam, setSelectedExam] = useState<ExamPreparationItem | null>(exams[0] || null);
  const [analysisResult, setAnalysisResult] = useState<ExamAiAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStartAnalysis = async () => {
    if (!selectedExam) return;
    setIsAnalyzing(true);
    const res = await onAnalyzeExam(selectedExam.id);
    setAnalysisResult(res);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 text-white shadow-lg border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>الامتحانات الموحدة الوطنية والجهوية</span>
          </div>
          <h1 className="text-2xl font-black">
            مركز تحضير امتحانات البكالوريا (BAC Exam Prep Center)
          </h1>
          <p className="text-xs text-slate-300">
            امتحانات وطنية سابقة (2BAC) وجهوية (1BAC) مع عناصر الإجابة الرسمية ومحلل أخطاء الامتحانات بالذكاء الاصطناعي.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Exams List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white px-1">مكتبة الامتحانات الوطنية والجهوية</h2>
          {exams.map((ex) => (
            <div
              key={ex.id}
              onClick={() => {
                setSelectedExam(ex);
                setAnalysisResult(null);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedExam?.id === ex.id
                  ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  {ex.year} • {ex.session === 'ORDINAIRE' ? 'الدورة العادية' : 'الدورة الاستدراكية'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {ex.durationMinutes} دقيقة
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-2">
                {ex.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{ex.subjectName}</span>
                {ex.bestScore && (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    أفضل نقطة: {ex.bestScore}/20
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Simulator & AI Exam Analyzer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedExam ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {selectedExam.subjectName} • {selectedExam.track}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    المعامل والنقطة الكلية: {selectedExam.totalPoints} ن
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedExam.title}</h2>
              </div>

              {/* Exam Actions Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center gap-2 shadow-md shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>{isAnalyzing ? 'جاري تحليل الإجابات...' : 'إجراء محاكاة الامتحان والتحليل الذكي بـ فهيم'}</span>
                </button>

                <button
                  onClick={() => alert('تحميل موضوع الامتحان وصياغة عناصر الإجابة الرسمية PDF...')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>تحميل الموضوع والتصحيح PDF</span>
                </button>
              </div>

              {/* AI Analysis Result */}
              {analysisResult && (
                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        <span>محلل امتحانات البكالوريا فهيم AI</span>
                      </div>
                      <div className="text-lg font-bold">{analysisResult.examTitle}</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/10 border border-white/10">
                      <div className="text-[10px] text-slate-400">النقطة المحاكاة</div>
                      <div className="text-2xl font-black text-amber-400">{analysisResult.overallScore} / 20</div>
                    </div>
                  </div>

                  {/* Rubric Breakdown */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-300">تفاصيل التنقيط حسب المكونات:</div>
                    {analysisResult.detailedRubric.map((r, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300">{r.questionNumber} ({r.topic})</span>
                          <span className="font-extrabold text-white">{r.pointsEarned} / {r.maxPoints} ن</span>
                        </div>
                        <div className="text-slate-300">{r.adviceAr}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              اختر امتحاناً من القائمة للبدء.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
