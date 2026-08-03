/**
 * Qarayti.ai — Parent Portal: Sub-Module 5: Grades
 * Official Moroccan Grading System (/20), Continuous Assessments, Regional/National Exams,
 * and Performance Trend Visualizations.
 */

import React, { useState } from 'react';
import { useParentPortal } from '../../context/ParentPortalContext';
import { parentPortalService } from '../../../domain/services/parentPortal.service';
import {
  Award,
  BookOpen,
  Filter,
  BarChart2,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export const GradesView: React.FC = () => {
  const { activeChild, grades } = useParentPortal();
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  const childGrades = grades.filter((g) => g.childId === activeChild.id);
  const filteredGrades = selectedSubject === 'ALL'
    ? childGrades
    : childGrades.filter((g) => g.subject === selectedSubject);

  const subjectsList = Array.from(new Set(childGrades.map((g) => g.subject)));
  const calculatedGpa = parentPortalService.calculateMoroccanGpa(childGrades);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
              Relevé de Notes Officiel (Barème National Marocain /20)
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Contrôles continus, devoirs surveillés unifiés, examens blancs régionaux et nationaux.
          </p>
        </div>
        <div className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 self-start md:self-auto font-bold">
          Moyenne Générale Pondérée: {calculatedGpa} / 20
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedSubject('ALL')}
          className={`px-3 py-1.5 text-xs font-mono border whitespace-nowrap ${
            selectedSubject === 'ALL'
              ? 'bg-[#D4AF37] text-[#0F1115] font-bold border-[#D4AF37]'
              : 'bg-[#161920] text-[#8E9299] border-[#2D333D] hover:text-[#EAE9E6]'
          }`}
        >
          Toutes les Matières
        </button>
        {subjectsList.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={`px-3 py-1.5 text-xs font-mono border whitespace-nowrap ${
              selectedSubject === subject
                ? 'bg-[#D4AF37] text-[#0F1115] font-bold border-[#D4AF37]'
                : 'bg-[#161920] text-[#8E9299] border-[#2D333D] hover:text-[#EAE9E6]'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Grades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGrades.map((grade) => {
          const isHighScore = grade.score >= 16;
          return (
            <div
              key={grade.id}
              className="bg-[#161920] border border-[#2D333D] p-5 space-y-4 hover:border-[#D4AF37] transition-all"
            >
              <div className="flex items-start justify-between border-b border-[#2D333D] pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/30">
                      Coeff. {grade.coefficient}
                    </span>
                    <span className="text-xs font-mono text-[#8E9299]">{grade.examType}</span>
                  </div>
                  <h3 className="text-base font-serif italic text-[#EAE9E6] font-bold mt-1">
                    {grade.subject}
                  </h3>
                  <p className="text-xs font-serif text-[#8E9299]">{grade.examTitle}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-2xl font-serif font-bold block ${
                      isHighScore ? 'text-[#D4AF37]' : grade.score >= 12 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {grade.score} <span className="text-xs font-mono text-[#8E9299]">/ 20</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#8E9299]">{grade.date}</span>
                </div>
              </div>

              {/* Class Comparison Bar */}
              <div className="bg-[#0F1115] p-3 border border-[#2D333D] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8E9299]">
                  <span>Moyenne Classe: <strong className="text-[#EAE9E6]">{grade.classAvg}/20</strong></span>
                  <span>Note Max Classe: <strong className="text-[#D4AF37]">{grade.classMax}/20</strong></span>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-[#161920] h-2 rounded-full overflow-hidden border border-[#2D333D] relative">
                  <div
                    className="bg-[#D4AF37] h-full"
                    style={{ width: `${(grade.score / 20) * 100}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-400"
                    style={{ left: `${(grade.classAvg / 20) * 100}%` }}
                    title={`Moyenne Classe (${grade.classAvg})`}
                  />
                </div>
              </div>

              {/* Teacher Feedback */}
              <p className="text-xs font-serif italic text-[#8E9299]">
                Remarque Enseignant: "{grade.teacherFeedback}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
