/**
 * Qarayti.ai — Teacher Portal: Sub-Module 0: Dashboard
 * Today's schedule, AI pedagogical summary, pending grading work, and quick action widgets.
 */

import React from 'react';
import { useTeacherPortal } from '../../context/TeacherPortalContext';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';

export const TeacherDashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { classes, activeClass, roster, assignments, grades, attendance, performanceReport } = useTeacherPortal();

  const pendingAssignments = assignments.filter((a) => a.totalSubmissions > a.gradedCount);
  const highRiskStudents = roster.filter((s) => s.riskLevel === 'HIGH');
  const totalStudents = roster.length;

  return (
    <div className="space-y-6">
      {/* Top Banner / AI Welcome */}
      <div className="bg-[#161920] border border-[#2D333D] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[#D4AF37] text-xs font-mono uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Professeur Dr. Hassan El Mansouri — Mathématiques</span>
              </div>
              <h1 className="text-2xl font-serif italic text-[#EAE9E6] font-bold mt-1">
                Tableau de Bord Pédagogique
              </h1>
              <p className="text-xs font-mono text-[#8E9299] mt-1">
                Lycée Moulay Youssef — AREF Rabat-Salé-Kénitra | Année Scolaire 2025/2026
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('lessons')}
                className="bg-[#D4AF37] text-[#0F1115] hover:bg-[#b5942d] px-4 py-2 font-mono text-xs font-bold uppercase transition-all flex items-center space-x-2"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Générer Cours Faheem AI</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#2D333D]">
            <div className="bg-[#0F1115] border border-[#2D333D] p-3">
              <div className="text-[10px] font-mono text-[#8E9299] uppercase">Classes Assignées</div>
              <div className="text-xl font-serif text-[#EAE9E6] font-bold mt-1">{classes.length}</div>
              <div className="text-[10px] font-mono text-[#D4AF37] mt-0.5">32 Heures / Semaine</div>
            </div>

            <div className="bg-[#0F1115] border border-[#2D333D] p-3">
              <div className="text-[10px] font-mono text-[#8E9299] uppercase">Élèves Enseignés</div>
              <div className="text-xl font-serif text-[#EAE9E6] font-bold mt-1">{totalStudents}</div>
              <div className="text-[10px] font-mono text-[#10B981] mt-0.5">2 Filières BAC</div>
            </div>

            <div className="bg-[#0F1115] border border-[#2D333D] p-3">
              <div className="text-[10px] font-mono text-[#8E9299] uppercase">Moyenne Générale Classe</div>
              <div className="text-xl font-serif text-[#D4AF37] font-bold mt-1">
                {performanceReport.averageGrade} / 20
              </div>
              <div className="text-[10px] font-mono text-[#10B981] mt-0.5">Taux de Réussite: {performanceReport.passRatePercentage}%</div>
            </div>

            <div className="bg-[#0F1115] border border-[#2D333D] p-3">
              <div className="text-[10px] font-mono text-[#8E9299] uppercase">Élèves à Risque BAC</div>
              <div className="text-xl font-serif text-[#EF4444] font-bold mt-1">{highRiskStudents.length}</div>
              <div className="text-[10px] font-mono text-[#EF4444] mt-0.5">Soutien Requis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule & Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2D333D] pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-serif italic text-[#EAE9E6]">Emploi du Temps du Jour</h3>
              </div>
              <span className="text-xs font-mono text-[#8E9299]">Mardi 3 Février 2026</span>
            </div>

            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-[#0F1115] border border-[#2D333D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D4AF37]/50 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/20">
                        {cls.className}
                      </span>
                      <span className="text-[11px] font-mono text-[#8E9299]">{cls.track}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-mono text-[#EAE9E6] pt-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-[#8E9299]" />
                        <span>{cls.schedule[0] || '08:30 - 10:30'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8E9299]" />
                        <span>{cls.roomNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-[#8E9299]" />
                        <span>{cls.studentCount} élèves</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      onClick={() => onNavigate('attendance')}
                      className="bg-[#2D333D] hover:bg-[#3d4452] text-[#EAE9E6] px-3 py-1.5 text-xs font-mono transition-all"
                    >
                      Appel & Présences
                    </button>
                    <button
                      onClick={() => onNavigate('assignments')}
                      className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1.5 text-xs font-mono transition-all"
                    >
                      Devoirs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Pedagogical Summary */}
          <div className="bg-[#161920] border border-[#D4AF37]/40 p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center space-x-2 text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-serif italic font-bold">Synthèse Pédagogique Faheem AI Engine</h3>
            </div>
            <p className="text-xs font-mono text-[#EAE9E6] leading-relaxed bg-[#0F1115] p-3 border border-[#2D333D]">
              {performanceReport.aiPedagogicalSummary}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
                <div className="text-[#10B981] font-bold mb-1 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Points Forts Classe</span>
                </div>
                <ul className="list-disc list-inside text-[#8E9299] space-y-0.5">
                  {performanceReport.strongestTopics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
                <div className="text-[#EF4444] font-bold mb-1 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Lacunes & Axes d'Amélioration</span>
                </div>
                <ul className="list-disc list-inside text-[#8E9299] space-y-0.5">
                  {performanceReport.weakestTopics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Pending Work & High Risk Alerts */}
        <div className="space-y-6">
          {/* Pending Work */}
          <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2D333D] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-serif italic text-[#EAE9E6]">Devoirs à Corriger</h3>
              </div>
              <span className="text-xs font-mono text-[#D4AF37]">{pendingAssignments.length} En Attente</span>
            </div>

            <div className="space-y-3">
              {assignments.slice(0, 3).map((asg) => (
                <div key={asg.id} className="bg-[#0F1115] border border-[#2D333D] p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-serif font-bold text-[#EAE9E6]">{asg.title}</div>
                      <div className="text-[10px] font-mono text-[#8E9299]">{asg.className}</div>
                    </div>
                    <span className="text-[10px] font-mono text-[#D4AF37]">Échéance: {asg.dueDate}</span>
                  </div>

                  <div className="w-full bg-[#2D333D] h-1.5 overflow-hidden">
                    <div
                      className="bg-[#D4AF37] h-full"
                      style={{ width: `${(asg.gradedCount / (asg.totalSubmissions || 1)) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8E9299]">
                    <span>Correction: {asg.gradedCount}/{asg.totalSubmissions}</span>
                    <button
                      onClick={() => onNavigate('grades')}
                      className="text-[#D4AF37] hover:underline flex items-center space-x-1"
                    >
                      <span>Saisir Notes</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Risk Students Alert */}
          <div className="bg-[#161920] border border-[#EF4444]/30 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2D333D] pb-3">
              <div className="flex items-center space-x-2 text-[#EF4444]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-serif italic text-[#EAE9E6]">Élèves sous Seuil Critique</h3>
              </div>
            </div>

            <div className="space-y-2">
              {highRiskStudents.map((std) => (
                <div key={std.id} className="bg-[#0F1115] border border-[#EF4444]/20 p-3 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#EAE9E6]">{std.fullName}</div>
                    <div className="text-[10px] font-mono text-[#8E9299]">{std.massarCode} — Moy: <span className="text-[#EF4444] font-bold">{std.currentAverage}/20</span></div>
                  </div>
                  <button
                    onClick={() => onNavigate('messages')}
                    className="bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-[10px] font-mono px-2 py-1 hover:bg-[#EF4444]/20"
                  >
                    Contacter Parent
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
