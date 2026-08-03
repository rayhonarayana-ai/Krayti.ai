/**
 * Qarayti.ai — Homework Center View
 * Assignments List, Submissions & Teacher Feedback Center
 */

import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Send,
  Award,
  Calendar,
  User,
} from 'lucide-react';
import { HomeworkAssignment } from '../../../domain/types/studentPortal.types';

interface HomeworkCenterViewProps {
  homeworkList: HomeworkAssignment[];
  onSubmitHomework: (homeworkId: string, text: string) => Promise<void>;
}

export const HomeworkCenterView: React.FC<HomeworkCenterViewProps> = ({
  homeworkList,
  onSubmitHomework,
}) => {
  const [selectedHw, setSelectedHw] = useState<HomeworkAssignment | null>(homeworkList[0] || null);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedHw || !submissionText.trim()) return;
    setIsSubmitting(true);
    await onSubmitHomework(selectedHw.id, submissionText);
    setSelectedHw((prev) => prev ? { ...prev, status: 'SUBMITTED', submissionText } : null);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>الواجبات المنزلية والتمارين المحروسة</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            مركز الواجبات المنزلية (Homework & Assignment Center)
          </h1>
          <p className="text-xs text-slate-500">
            تلقي وإرسال الفروض المنزلية المسندة من طرف أساتذة المؤسسة ومتابعة الملاحظات والنقط.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white px-1">قائمة الواجبات</h2>
          {homeworkList.map((hw) => (
            <div
              key={hw.id}
              onClick={() => setSelectedHw(hw)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedHw?.id === hw.id
                  ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-blue-600 dark:text-blue-400">{hw.subjectName}</span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    hw.status === 'GRADED'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : hw.status === 'SUBMITTED'
                      ? 'bg-blue-500/10 text-blue-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {hw.status === 'GRADED' ? 'مصحح' : hw.status === 'SUBMITTED' ? 'تم الإرسال' : 'معلق'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                {hw.title}
              </h3>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{hw.teacherName}</span>
                <span>آخر أجل: {hw.dueDate}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Detail / Submission Editor */}
        <div className="lg:col-span-2 space-y-6">
          {selectedHw ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {selectedHw.subjectName}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">الأستاذ: {selectedHw.teacherName}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedHw.title}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> مسند بتاريخ: {selectedHw.assignedDate}
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                    <Clock className="w-3.5 h-3.5" /> آخر أجل للتقديم: {selectedHw.dueDate}
                  </span>
                </div>
              </div>

              {/* Status & Grade Box if Graded */}
              {selectedHw.status === 'GRADED' && (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                      <Award className="w-6 h-6" />
                      <span>النقطة المحصل عليها: {selectedHw.grade} / {selectedHw.maxGrade}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>ملاحظات الأستاذ:</strong> {selectedHw.feedback}
                  </div>
                </div>
              )}

              {/* Submission Editor if Pending */}
              {selectedHw.status === 'PENDING' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      إرسال الإجابة أو ملخص الواجب:
                    </label>
                    <textarea
                      rows={5}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="اكتب الإجابة أو ألصق روابط الملفات والصور..."
                      className="w-full text-sm p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>إرفاق ملف PDF أو صورة الإجابة</span>
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={!submissionText.trim() || isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                    >
                      <Send className="w-4 h-4" />
                      <span>تسليم الواجب الآن</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Already Submitted */}
              {selectedHw.status === 'SUBMITTED' && (
                <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 space-y-2">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <span>تم تسليم الواجب بنجاح وهو قيد التصحيح من الأستاذ.</span>
                  </div>
                  <div>النص المرسل: "{selectedHw.submissionText}"</div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              اختر واجباً من القائمة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
