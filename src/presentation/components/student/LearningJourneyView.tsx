/**
 * Qarayti.ai — Learning Journey View
 * Subject Navigator, Units & Interactive Lesson Player
 */

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  FileText,
  Clock,
  Award,
  ChevronLeft,
  Sparkles,
  List,
  Video,
} from 'lucide-react';
import { StudentLesson } from '../../../domain/types/studentPortal.types';

interface LearningJourneyViewProps {
  lessons: StudentLesson[];
}

export const LearningJourneyView: React.FC<LearningJourneyViewProps> = ({ lessons }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('MATH');
  const [activeLesson, setActiveLesson] = useState<StudentLesson | null>(lessons[0] || null);

  const filteredLessons = lessons.filter((l) => l.subjectId === selectedSubject);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column (1 col): Subject Navigator & Units list */}
      <div className="space-y-4">
        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'MATH', name: 'الرياضيات' },
            { id: 'PHYS', name: 'الفيزياء والكيمياء' },
            { id: 'SVT', name: 'علوم الحياة والأرض' },
            { id: 'PHIL', name: 'الفلسفة' },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubject(sub.id);
                const first = lessons.find((l) => l.subjectId === sub.id);
                if (first) setActiveLesson(first);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedSubject === sub.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Lessons List for Selected Subject */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <List className="w-4 h-4 text-emerald-500" />
            <span>دروس الوحدة المقررة</span>
          </h2>

          <div className="space-y-2">
            {filteredLessons.map((les) => (
              <div
                key={les.id}
                onClick={() => setActiveLesson(les)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeLesson?.id === les.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    وزن الامتحان: {les.bacWeightPercentage}%
                  </span>
                  {les.isCompleted ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> مكمل
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">{les.durationMinutes} دقيقة</span>
                  )}
                </div>
                <div className="text-sm text-slate-900 dark:text-white line-clamp-1">
                  {les.lessonTitleAr}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">{les.lessonTitleFr}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column (2 cols): Interactive Lesson Player */}
      <div className="lg:col-span-2 space-y-6">
        {activeLesson ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {activeLesson.unitTitleAr}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  مستوى الصعوبة: {activeLesson.complexity}/5
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                {activeLesson.lessonTitleAr}
              </h1>
              <div className="text-xs text-slate-500 font-medium">{activeLesson.lessonTitleFr}</div>
            </div>

            {/* Key Formulae Highlight Cards */}
            {activeLesson.keyFormulae && activeLesson.keyFormulae.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>العلاقات والقوانين المرجعية للبكالوريا (Formules Clés)</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeLesson.keyFormulae.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-300 border border-amber-500/30"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lesson Content Viewer */}
            <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {activeLesson.contentMarkdown}
            </div>

            {/* Complete Lesson Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                إكمال هذا الدرس يمنحك <strong>+100 XP</strong> ويثبت مستوى استيعاب المادة.
              </div>
              <button
                onClick={() => alert('تم إكمال الدرس بنجاح ومزامنة التقدم مع شجرة المهارات!')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تحديد الدرس كمكتمل</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            اختر درساً من القائمة الجانبية للبدء في القراءة والمذاكرة.
          </div>
        )}
      </div>
    </div>
  );
};
