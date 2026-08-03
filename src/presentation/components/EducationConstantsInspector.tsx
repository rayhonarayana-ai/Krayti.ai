/**
 * Qarayti.ai — Moroccan Education Metadata Inspector
 */

import React from 'react';
import {
  MOROCCAN_EDUCATION_LEVELS_METADATA,
  MOROCCAN_SUBJECTS_CATALOG,
  MOROCCAN_GRADING_SCALE,
  BAC_EXAM_WEIGHTS,
} from '../../domain/constants/education.constants';
import { BookOpen, GraduationCap, Award, Globe } from 'lucide-react';

export const EducationConstantsInspector: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-6 border-l-2 border-l-[#D4AF37]">
        <div className="flex items-center space-x-3 mb-1">
          <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-2xl font-serif italic text-[#EAE9E6]">Moroccan Educational Metadata Framework</h2>
        </div>
        <p className="text-xs font-mono text-[#8E9299]">
          Official Ministry of National Education (MEN) curriculum structures, coefficients, and grading scales.
        </p>
      </div>

      {/* Cycles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOROCCAN_EDUCATION_LEVELS_METADATA.map((level) => (
          <div key={level.code} className="bg-[#161920] border border-[#2D333D] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2D333D] pb-2">
              <div>
                <h3 className="text-base font-bold text-[#D4AF37]">{level.nameAr}</h3>
                <p className="text-[11px] font-mono text-[#8E9299]">{level.nameFr}</p>
              </div>
              <span className="text-xs font-mono bg-[#0F1115] px-2 py-0.5 text-[#EAE9E6] border border-[#2D333D]">
                {level.yearsCount} Years
              </span>
            </div>

            <div>
              <p className="text-[11px] text-[#8E9299] font-mono uppercase tracking-wider mb-1">Grade Levels:</p>
              <div className="flex flex-wrap gap-1">
                {level.grades.map((g) => (
                  <span key={g} className="text-[10px] font-mono bg-[#0F1115] px-2 py-0.5 text-[#EAE9E6] border border-[#2D333D]">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
              <p className="text-[10px] font-mono text-[#8E9299] uppercase tracking-wider">Key Examination Framework:</p>
              <p className="text-xs text-[#EAE9E6] mt-0.5 font-medium">{level.keyExam}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Subjects & Coefficients Table */}
      <div className="bg-[#161920] border border-[#2D333D] p-5">
        <div className="flex items-center space-x-2 mb-4 border-b border-[#2D333D] pb-3">
          <BookOpen className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-lg font-serif italic text-[#EAE9E6]">High School Subjects & Coefficients Catalog</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2D333D] bg-[#0F1115] text-[#8E9299] text-[11px] font-mono uppercase tracking-wider">
                <th className="p-3">Subject Code</th>
                <th className="p-3">Arabic Name (الاسم بالعربية)</th>
                <th className="p-3">French Name</th>
                <th className="p-3 text-center">Coefficient (المعامل)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333D] text-xs">
              {MOROCCAN_SUBJECTS_CATALOG.map((subj) => (
                <tr key={subj.id} className="hover:bg-[#1A1D23] transition">
                  <td className="p-3 font-mono font-bold text-[#D4AF37]">{subj.code}</td>
                  <td className="p-3 font-bold text-[#EAE9E6]">{subj.nameAr}</td>
                  <td className="p-3 text-[#8E9299] font-mono">{subj.nameFr}</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] font-mono font-bold border border-[#D4AF37]/30">
                      {subj.coefficient}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Baccalaureate Weight Breakdown */}
      <div className="bg-[#161920] border border-[#2D333D] p-5">
        <div className="flex items-center space-x-2 mb-3 border-b border-[#2D333D] pb-2">
          <Award className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-lg font-serif italic text-[#EAE9E6]">Baccalaureate Calculation Formula Weighting</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(BAC_EXAM_WEIGHTS).map(([key, weight]) => (
            <div key={key} className="bg-[#0F1115] p-4 border border-[#2D333D] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#EAE9E6]">{weight.labelAr}</p>
                <p className="text-[10px] text-[#8E9299] font-mono mt-0.5 uppercase tracking-wider">{key}</p>
              </div>
              <span className="text-xl font-bold text-[#D4AF37] font-mono">{weight.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
