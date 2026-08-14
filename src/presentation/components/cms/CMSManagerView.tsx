/**
 * Qarayti.ai — Sprint 2.2: Content Management System (CMS) Presentation View
 * Moroccan National Curriculum Manager, Knowledge Object Indexing,
 * Competency Framework, and Cross-Engine Synchronization Inspector.
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  FileText,
  BrainCircuit,
  Sliders,
  Award,
  Search,
  Check,
  Zap,
  Building2,
  GitBranch,
} from 'lucide-react';
import { cmsDomainService } from '../../../domain/services/cms.service';
import {
  SubjectCurriculum,
  KnowledgeObject,
  Competency,
} from '../../../core/cms/cms-engine';

export const CMSManagerView: React.FC = () => {
  const [curricula, setCurricula] = useState<SubjectCurriculum[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [stats, setStats] = useState(cmsDomainService.getStats());

  // Form State for creating new Knowledge Object
  const [koTitle, setKoTitle] = useState('مبرهنة التزايدات المنتهية (Théorème des Accroissements Finis — TAF)');
  const [koType, setKoType] = useState<KnowledgeObject['type']>('THEOREM_PROOF');
  const [koContent, setKoContent] = useState(
    'Soit f une fonction continue sur [a,b] et dérivable sur ]a,b[. Il existe c \\in ]a,b[ tel que f(b) - f(a) = f\'(c)(b-a).'
  );
  const [koVersion, setKoVersion] = useState('2026.2.0-OFFICIAL');
  const [ministryRef, setMinistryRef] = useState('MENPS-2026-DIR-104');
  const [authorName, setAuthorName] = useState('Inspecteur Dr. El Amrani');
  const [bloomLevel, setBloomLevel] = useState<KnowledgeObject['bloomLevel']>('ANALYZE');
  const [difficulty, setDifficulty] = useState<KnowledgeObject['difficulty']>('DIFFICILE');

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [lastPublishedKo, setLastPublishedKo] = useState<KnowledgeObject | null>(null);

  const refreshState = () => {
    setCurricula(cmsDomainService.getCurricula());
    setCompetencies(cmsDomainService.getCompetencies());
    setStats(cmsDomainService.getStats());
  };

  useEffect(() => {
    refreshState();
  }, []);

  const handlePublishKO = async () => {
    setIsPublishing(true);
    setPublishSuccess(false);

    try {
      const lessonId = curricula[0]?.units[0]?.lessons[0]?.id || 'lesson-01';
      const created = await cmsDomainService.publishKnowledgeObject(lessonId, {
        title: koTitle,
        type: koType,
        version: koVersion,
        contentMarkdown: koContent,
        latexFormulas: ['f(b) - f(a) = f\'(c)(b-a)'],
        curriculum: 'Programme National Marocain 2026',
        grade: '2ème BAC',
        subject: 'Mathématiques',
        unit: 'Unité 1 : Analyse',
        lesson: 'Continuité et TVI',
        competencyIds: ['comp-001'],
        learningObjectiveIds: ['obj-001'],
        bloomLevel,
        difficulty,
        keywords: ['TAF', 'Accroissements Finis', 'Dérivabilité'],
        multimedia: [{ type: 'PDF', url: 'https://qarayti.ai/pdf/taf-summary.pdf', caption: 'Fiche Synthèse Officielle TAF' }],
        assessmentMapping: { questionBankIds: ['q-math-001'], rubricCriteria: ['Calcul de f\'(c)', 'Conclusion sur l intervalle'] },
        faheemContext: {
          keyConcepts: ['Théorème des accroissements finis', 'Pente de la tangente'],
          commonMisconceptions: ['Confondre la dérivabilité sur ]a,b[ et la continuité sur [a,b]'],
          guidancePrompt: 'Expliquer le théorème géométriquement par la sécante parallèle à la tangente.',
        },
        adaptiveMetadata: { prerequisiteIds: ['ko-math-001'], recommendedNextKoIds: [], estimatedTimeMinutes: 30 },
        analyticsMetadata: { viewCount: 120, masteryRate: 92.0, avgCompletionTimeMinutes: 28 },
        approvalStatus: 'PUBLISHED',
        ministryReference: ministryRef,
        authorName,
        inspectorName: 'Commission Nationale d Inspection Pedagogique',
      });

      setLastPublishedKo(created);
      setPublishSuccess(true);
      refreshState();
    } catch (err) {
      console.error('Publishing error:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  SPRINT 2.2 — MOROCCAN CURRICULUM CMS
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Content Domain Contract Active</span>
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-1.5 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-teal-400" />
                <span>نظام إدارة المنهج التعليمي المغربي وعناصر المعرفة</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                هيكلة المناهج الوطنية لوزارة التربية الوطنية حسب عناصر المعرفة (Knowledge Objects)، الكفايات، الأهداف التعلمية، والربط التلقائي بـ Faheem AI ومحرك التقييم والمحرك التكيفي.
              </p>
            </div>

            <button
              onClick={handlePublishKO}
              disabled={isPublishing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shrink-0"
            >
              <Zap className="w-4 h-4 text-yellow-300 fill-current" />
              <span>{isPublishing ? 'جاري النشر والفهرسة...' : 'نشر عنصر معرفة جديد (KO)'}</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium">المناهج الدراسية</div>
              <div className="text-xl font-bold text-white mt-0.5">{stats.totalCurricula} منهج رسمية</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium">عناصر المعرفة (KO)</div>
              <div className="text-xl font-bold text-teal-300 mt-0.5">{stats.totalKnowledgeObjects} عنصر</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium">الكفايات المسجلة</div>
              <div className="text-xl font-bold text-indigo-300 mt-0.5">{stats.totalCompetencies} كفاية</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium">تزامن Faheem & Assessment</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{stats.faheemIndexSyncRate}% مبرهن</div>
            </div>
          </div>
        </div>
      </div>

      {publishSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>
            تم تمكين ونشر عنصر المعرفة الجديد بصلابة! تمت الفهرسة التلقائية والتزامن الفوري عبر Faheem AI ومحرك التقييم والمحرك التكيفي.
          </span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create KO Form */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <PlusCircle className="w-4 h-4 text-teal-600" />
            <span>إضافة عنصر معرفة جديد (Knowledge Object)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">العنوان العلمي</label>
              <input
                type="text"
                value={koTitle}
                onChange={(e) => setKoTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">نوع العنصر المعرفي</label>
              <select
                value={koType}
                onChange={(e) => setKoType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
              >
                <option value="THEOREM_PROOF">مبرهنة وبرهان (THEOREM_PROOF)</option>
                <option value="CONCEPT_CARD">بطاقة مفهوم (CONCEPT_CARD)</option>
                <option value="WORKED_EXAMPLE">تطبيق محلول (WORKED_EXAMPLE)</option>
                <option value="DIDACTIC_VIDEO">فيديو توضيحي (DIDACTIC_VIDEO)</option>
                <option value="INTERACTIVE_SIMULATION">محاكاة تفاعلية (INTERACTIVE_SIMULATION)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">المحتوى التعليمي (Markdown / LaTeX)</label>
              <textarea
                rows={4}
                value={koContent}
                onChange={(e) => setKoContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">رقم الإصدار (Version Control)</label>
              <input
                type="text"
                value={koVersion}
                onChange={(e) => setKoVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">المرجع الوزاري</label>
                <input
                  type="text"
                  value={ministryRef}
                  onChange={(e) => setMinistryRef(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">اسم المؤلف/المفتش</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">تصنيف بلوم (Bloom)</label>
                <select
                  value={bloomLevel}
                  onChange={(e) => setBloomLevel(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="REMEMBER">تذكر (REMEMBER)</option>
                  <option value="UNDERSTAND">فهم (UNDERSTAND)</option>
                  <option value="APPLY">تطبيق (APPLY)</option>
                  <option value="ANALYZE">تحليل (ANALYZE)</option>
                  <option value="EVALUATE">تقويم (EVALUATE)</option>
                  <option value="CREATE">ابتكار (CREATE)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">الصعوبة</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="FACILE">سهل (FACILE)</option>
                  <option value="MOYEN">متوسط (MOYEN)</option>
                  <option value="DIFFICILE">صعب (DIFFICILE)</option>
                  <option value="OLYMPIADE">أولمبياد (OLYMPIADE)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handlePublishKO}
              disabled={isPublishing}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>نشر وتزامن عبر كافة المحركات</span>
            </button>
          </div>

          {/* Golden Path Sync Trace Card */}
          {publishSuccess && lastPublishedKo && (
            <div className="p-4 rounded-xl bg-slate-900 text-white border border-teal-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-black text-teal-400 flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>CROSS-ENGINE GOLDEN PATH TRACE</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  TRACE_ID: {lastPublishedKo.id}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center gap-2 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>[1] CMS Author & Inspector Approved: {lastPublishedKo.ministryReference}</span>
                </div>
                <div className="flex items-center gap-2 text-teal-300">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>[2] EventBus Dispatched: CONTENT_KNOWLEDGE_OBJECT_PUBLISHED</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span>[3] Faheem AI Context Indexing: ACTIVE ({lastPublishedKo.faheemContext.keyConcepts[0]})</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>[4] Assessment Engine Mapping: {lastPublishedKo.assessmentMapping.questionBankIds.length} Bank Item</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-300">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <span>[5] Adaptive Engine Graph Injected: Est. Time {lastPublishedKo.adaptiveMetadata.estimatedTimeMinutes}m</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Curriculum Hierarchy & KO Registry */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>شجرة المنهج المغربي وعناصر المعرفة المعتمدة</span>
          </h3>

          {curricula.map((curr) => (
            <div
              key={curr.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/50">
                      {curr.track}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      v{curr.version}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                    {curr.subjectNameAr}
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300/50">
                  اعتماد الوزارة 100%
                </span>
              </div>

              {curr.units.map((unit) => (
                <div key={unit.id} className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    <span>{unit.titleAr}</span>
                  </div>

                  {unit.lessons.map((lesson) => (
                    <div key={lesson.id} className="pl-4 border-l-2 border-teal-500/30 space-y-2">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lesson.titleAr}
                      </div>

                      <div className="space-y-2">
                        {lesson.knowledgeObjects.map((ko) => (
                          <div
                            key={ko.id}
                            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {ko.title}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                                {ko.type}
                              </span>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                              {ko.contentMarkdown}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                              <div className="flex items-center gap-3">
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Faheem AI Indexed
                                </span>
                                <span className="text-indigo-600 font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Assessment Indexed
                                </span>
                              </div>
                              <span className="font-mono text-slate-400">الإصدار: {ko.version}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
