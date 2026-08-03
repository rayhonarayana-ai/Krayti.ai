/**
 * Qarayti.ai — Student Profile View
 * Student Profile, Massar ID Card, Attendance Log & Grades Summary
 */

import React from 'react';
import {
  User,
  GraduationCap,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  MapPin,
  Target,
} from 'lucide-react';
import {
  StudentDashboardSummary,
  StudentAttendanceRecord,
  StudentGradeRecord,
} from '../../../domain/types/studentPortal.types';

interface StudentProfileViewProps {
  summary: StudentDashboardSummary;
  attendance: StudentAttendanceRecord[];
  grades: StudentGradeRecord[];
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  summary,
  attendance,
  grades,
}) => {
  return (
    <div className="space-y-6">
      {/* Massar Digital ID Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl border border-slate-700/80 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={summary.avatarUrl}
            alt={summary.name}
            className="w-24 h-24 rounded-full border-4 border-emerald-400 object-cover shadow-lg"
          />
          <div className="space-y-2 text-center sm:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <GraduationCap className="w-4 h-4" />
              <span>رمز مسار الرسمى: {summary.massarId}</span>
            </div>
            <h1 className="text-2xl font-black">{summary.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4 text-emerald-400" /> {summary.schoolName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-400" /> جهة {summary.regionalCity}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-center">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-slate-400">المسلك الدراسي</div>
            <div className="text-sm font-bold text-emerald-300">علوم رياضية أ (2BAC)</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-slate-400">هدف البكالوريا</div>
            <div className="text-sm font-bold text-yellow-300">{summary.bacTargetScore} / 20</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-slate-400">مجموع XP</div>
            <div className="text-sm font-bold text-purple-300">{summary.xp} XP</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-slate-400">سلسلة المواظبة</div>
            <div className="text-sm font-bold text-amber-300">{summary.streakDays} أيام</div>
          </div>
        </div>
      </div>

      {/* Grades Summary Transcript */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <span>بيان النقط ونتائج المراقبة المستمرة (Massar Transcript)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 pb-2">
                <th className="p-2 font-bold">المادة</th>
                <th className="p-2 font-bold">المعامل</th>
                <th className="p-2 font-bold">النقطة المحصل عليها</th>
                <th className="p-2 font-bold">معدل الفصل الدراسي</th>
                <th className="p-2 font-bold">نوع الامتحان</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{g.subjectName}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{g.coefficient}</td>
                  <td className="p-3 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {g.grade} / {g.maxGrade}
                  </td>
                  <td className="p-3 text-slate-500">{g.classAverage} / 20</td>
                  <td className="p-3 text-slate-500">{g.examType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Log */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>سجل الغياب والمواظبة بالمؤسسة (Attendance Log)</span>
        </h2>

        <div className="space-y-2">
          {attendance.map((att, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-white">{att.date}</span>
                <span className="text-slate-500">{att.subjectName}</span>
              </div>
              <div className="flex items-center gap-2">
                {att.notes && <span className="text-slate-400">{att.notes}</span>}
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                    att.status === 'PRESENT'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {att.status === 'PRESENT' ? 'حاضر' : 'مبرر'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
