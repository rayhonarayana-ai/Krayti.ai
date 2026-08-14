/**
 * Qarayti.ai — Sprint 2: Assessment Engine Presentation View
 * National Question Bank, Specification Grid Exam Generator,
 * Auto-Grading & OCR Essay Evaluation, Error Misconception Diagnostics & Remediation.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Database,
  Sliders,
  CheckCircle2,
  Sparkles,
  Search,
  BookOpen,
  Award,
  AlertTriangle,
  Send,
  Zap,
  Filter,
  BrainCircuit,
  Eye,
  PlusCircle,
  FileCheck2,
} from 'lucide-react';
import {
  QuestionItem,
  GeneratedExam,
  EvaluationResult,
  DifficultyLevel,
} from '../../../core/assessment/assessment-engine';
import { assessmentDomainService } from '../../../domain/services/assessment.service';

export const AssessmentEngineView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'question_bank' | 'exam_generator' | 'grading_ocr' | 'remediation'>('question_bank');
  
  // State from core engine
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [exams, setExams] = useState<GeneratedExam[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [stats, setStats] = useState(assessmentDomainService.getStats());

  // Search & Filter State
  const [searchSubject, setSearchSubject] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | ''>('');

  // Exam Generator Form State
  const [examTitle, setExamTitle] = useState('Examen National Blanc — Mathématiques BAC 2');
  const [selectedSubject, setSelectedSubject] = useState('Mathématiques');
  const [selectedTrack, setSelectedTrack] = useState('BAC 2 Sciences Maths');
  const [duration, setDuration] = useState(120);

  // Simulation Submission State
  const [studentName, setStudentName] = useState('Yassine El Mansouri');
  const [isGrading, setIsGrading] = useState(false);
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);

  const refreshState = () => {
    setQuestions(assessmentDomainService.searchQuestionBank(searchSubject, '', filterDifficulty || undefined));
    setExams(assessmentDomainService.getGeneratedExams());
    setEvaluations(assessmentDomainService.getEvaluationHistory());
    setStats(assessmentDomainService.getStats());
  };

  useEffect(() => {
    refreshState();
  }, [searchSubject, filterDifficulty]);

  const handleGenerateExam = () => {
    assessmentDomainService.generateExam({
      title: examTitle,
      subjectName: selectedSubject,
      track: selectedTrack,
      totalDurationMinutes: duration,
      totalPoints: 20,
      taxonomyDistribution: { knowledgePct: 20, applicationPct: 50, analysisPct: 30 },
      difficultyDistribution: { facilePct: 30, moyenPct: 50, difficilePct: 20 },
    });
    setExams(assessmentDomainService.getGeneratedExams());
    setStats(assessmentDomainService.getStats());
    setActiveTab('exam_generator');
  };

  const handleRunOcrGradingSimulation = async () => {
    setIsGrading(true);
    setTimeout(async () => {
      const result = await assessmentDomainService.submitAndGradeExam({
        submissionId: `sub-${Date.now()}`,
        examId: exams[0]?.id || 'exam-demo',
        studentId: 'std-102',
        studentName,
        submittedAt: new Date().toISOString(),
        answers: {
          'q-math-001': '3',
          'q-math-002': 'z = 2(cos(π/3) + i sin(π/3)) et z⁶ = 32', // slight error on z^6
          'q-phys-001': 'La tension et masse linéique de la corde',
          'q-svt-001': 'Allèle dominant sur Y', // wrong answer to trigger gap
        },
        ocrPaperImageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
      });
      setLastResult(result);
      setIsGrading(false);
      refreshState();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SPRINT 2 — NATIONAL ASSESSMENT ENGINE
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Faheem AI Synchronized</span>
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-1.5 flex items-center gap-2">
                <BrainCircuit className="w-7 h-7 text-indigo-400" />
                <span>محرك الامتحانات والتقويم الوطني التشخيصي</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                بنك الأسئلة الوطني، مولد الامتحانات حسب جداول التخصصات الرسمية للوزارة، التصحيح الآلي مع تحليل OCR المخطوطات، وتحديد الفجوات المعرفية وتوليد الخطط العلاجية.
              </p>
            </div>

            <button
              onClick={handleRunOcrGradingSimulation}
              disabled={isGrading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shrink-0"
            >
              <Zap className="w-4 h-4 fill-current text-yellow-300" />
              <span>{isGrading ? 'جاري التصحيح بـ OCR...' : 'محاكاة تصحيح ورقة إجابة (OCR)'}</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium">بنك الأسئلة الوطني</div>
              <div className="text-xl font-bold text-white mt-0.5">{stats.totalQuestions} سؤال</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium">معتمدة من التفتيش</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{stats.approvedNationalBankItems} عنصر</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium">الامتحانات المولدة</div>
              <div className="text-xl font-bold text-indigo-300 mt-0.5">{stats.totalExamsGenerated} امتحان</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[11px] text-slate-400 font-medium">التقييمات المكتملة</div>
              <div className="text-xl font-bold text-purple-300 mt-0.5">{stats.totalEvaluationsCompleted} ورقة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('question_bank')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'question_bank'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>بنك الأسئلة الوطني ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exam_generator')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'exam_generator'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>مولد الامتحانات (جدول التخصصات)</span>
        </button>

        <button
          onClick={() => setActiveTab('grading_ocr')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'grading_ocr'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>مركز التصحيح الآلي بـ OCR</span>
        </button>

        <button
          onClick={() => setActiveTab('remediation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'remediation'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>تشخيص الفجوات والخطط العلاجية</span>
        </button>
      </div>

      {/* Tab 1: Question Bank */}
      {activeTab === 'question_bank' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث حسب المادة أو الموضوع..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value as any)}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="">جميع مستويات الصعوبة</option>
                <option value="FACILE">سهل (FACILE)</option>
                <option value="MOYEN">متوسط (MOYEN)</option>
                <option value="DIFFICILE">صعب (DIFFICILE)</option>
                <option value="OLYMPIADE">أولمبياد (OLYMPIADE)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                      {q.subjectName}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{q.track}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      q.difficulty === 'FACILE'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : q.difficulty === 'MOYEN'
                        ? 'bg-indigo-500/10 text-indigo-600'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {q.prompt}
                </div>

                {q.options && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-xs font-medium border ${
                          opt === q.correctAnswer
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>IRT Diff (b): {q.irtDifficulty} | Disc (a): {q.irtDiscrimination}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>اعتماد المفتشية الوطنية</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Exam Generator */}
      {activeTab === 'exam_generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>إعداد جدول التخصصات (Grid Specification)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">عنوان الامتحان</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">المادة</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="Mathématiques">Mathématiques (الرياضيات)</option>
                  <option value="Physique-Chimie">Physique-Chimie (الفيزياء والكيمياء)</option>
                  <option value="SVT">SVT (علوم الحياة والأرض)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">المسلك / الشعبة</label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="BAC 2 Sciences Maths">2BAC العلوم الرياضية</option>
                  <option value="BAC 2 Sciences Physiques">2BAC العلوم الفيزيائية</option>
                  <option value="BAC 2 SVT">2BAC علوم الحياة والأرض</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">مدة الإنجاز (دقائق)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleGenerateExam}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>توليد الامتحان تلقائيًا من بنك الأسئلة</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>الامتحانات الوطنية والمحلية المولدة</span>
            </h3>

            {exams.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                لم يتم توليد أي امتحان بعد. استخدم النموذج للإنشاء.
              </div>
            ) : (
              exams.map((ex) => (
                <div
                  key={ex.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{ex.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        المادة: {ex.subjectName} | الشعبة: {ex.track} | المدة: {ex.durationMinutes} دقيقة
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 font-extrabold text-xs">
                      {ex.totalPoints} نقطة
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">الأسئلة المختارة تلقائيًا ({ex.questions.length}):</div>
                    {ex.questions.map((q, idx) => (
                      <div key={q.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs flex items-center justify-between">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {idx + 1}. {q.prompt}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                          {q.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: OCR & Auto Grading */}
      {activeTab === 'grading_ocr' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                <span>مركز التصحيح الآلي بـ OCR السحابي</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                قراءة وتحليل أوراق الإجابات بخط اليد وتطبيق السلالم المعتمدة تلقائيًا.
              </p>
            </div>

            <button
              onClick={handleRunOcrGradingSimulation}
              disabled={isGrading}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <Zap className="w-4 h-4" />
              <span>تشغيل الفحص الآلي الان</span>
            </button>
          </div>

          {lastResult && (
            <div className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">نتيجة التصحيح الآلي للطالب:</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{studentName}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {lastResult.totalScore} / {lastResult.maxScore} ({lastResult.percentageScore}%)
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    طريقة التصحيح: {lastResult.gradedBy}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">تفاصيل النقاط والتغذية الراجعة لكل سؤال:</div>
                {lastResult.questionScores.map((qs) => (
                  <div key={qs.questionId} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800 dark:text-slate-200">سؤال: {qs.questionId}</span>
                      <span className={qs.isCorrect ? 'text-emerald-600' : 'text-amber-600'}>
                        {qs.pointsEarned} / {qs.maxPoints} نقطة
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{qs.feedback}</p>
                    {qs.detectedMisconception && (
                      <div className="text-[10px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded">
                        ⚠️ الفجوة المكتشفة: {qs.detectedMisconception}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Remediation */}
      {activeTab === 'remediation' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
              <span>مولد الخطط العلاجية وتغذية Faheem AI Copilot</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تحويل نتائج التقييم مباشرة إلى جلسات توجيه فردية وتمارين تصحيحية مخصصة.
            </p>
          </div>

          <div className="space-y-3">
            {evaluations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                لا توجد تقييمات سابقة. قم بإجراء تصحيح ورقة في تبويب OCR.
              </div>
            ) : (
              evaluations.map((ev, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>تقييم #{ev.submissionId}</span>
                    <span className="text-purple-600">{ev.percentageScore}%</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-500 font-bold">الفجوات المعرفية المكتشفة:</div>
                    {ev.diagnosedGaps.map((gap, gIdx) => (
                      <div key={gIdx} className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px]">
                        • {gap}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 text-indigo-900 dark:text-indigo-200 text-[11px] font-mono space-y-1">
                    <div className="font-bold font-sans">تغذية Faheem AI المباشرة:</div>
                    <div>{ev.remediationPlan.faheemFocusPrompt}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
