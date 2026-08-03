/**
 * Qarayti.ai — Parent Portal: Sub-Module 1: Children Management
 * View and manage profiles, Massar codes, school registrations, and active child switching.
 */

import React from 'react';
import { useParentPortal } from '../../context/ParentPortalContext';
import { Users, GraduationCap, Award, Calendar, Phone, CheckCircle, Shield, ArrowRight } from 'lucide-react';

export const ChildrenManagementView: React.FC = () => {
  const { children, activeChildId, setActiveChildId } = useParentPortal();

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Gestion des Enfants (Dossier Scolaire & Massar)</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Gestion multi-enfants, suivi des dossiers scolaires nationaux et basculement instantané du profil actif.
          </p>
        </div>
        <div className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 self-start md:self-auto">
          {children.length} Enfant(s) Inscrit(s)
        </div>
      </div>

      {/* Children Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => {
          const isActive = child.id === activeChildId;
          return (
            <div
              key={child.id}
              className={`bg-[#161920] border p-6 flex flex-col justify-between space-y-6 transition-all ${
                isActive
                  ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/5 bg-[#161920]'
                  : 'border-[#2D333D] opacity-80 hover:opacity-100 hover:border-[#8E9299]'
              }`}
            >
              <div className="space-y-4">
                {/* Status Header */}
                <div className="flex items-center justify-between border-b border-[#2D333D] pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E9299]">
                      Code Massar:
                    </span>
                    <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#0F1115] px-2 py-0.5 border border-[#2D333D]">
                      {child.massarCode}
                    </span>
                  </div>
                  {isActive && (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5">
                      <CheckCircle className="w-3 h-3" />
                      <span>PROFIL ACTIF</span>
                    </span>
                  )}
                </div>

                {/* Child Main Info */}
                <div className="flex items-start space-x-4">
                  <img
                    src={child.avatarUrl}
                    alt={child.fullName}
                    className="w-16 h-16 rounded-full border-2 border-[#D4AF37] object-cover shadow-md"
                  />
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif italic text-[#EAE9E6] font-bold">
                      {child.fullName}
                    </h3>
                    <p className="text-xs font-mono text-[#D4AF37]">{child.gradeLevel}</p>
                    <p className="text-xs font-serif text-[#8E9299] italic">{child.track}</p>
                    <p className="text-[11px] font-mono text-[#8E9299] pt-1">{child.schoolName}</p>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 bg-[#0F1115] p-3 border border-[#2D333D] text-center">
                  <div>
                    <div className="text-[10px] font-mono text-[#8E9299] uppercase">Moyenne Générale</div>
                    <div className="text-lg font-serif text-[#D4AF37] font-bold">{child.overallGpa} / 20</div>
                  </div>
                  <div className="border-x border-[#2D333D]">
                    <div className="text-[10px] font-mono text-[#8E9299] uppercase">Rang Classe</div>
                    <div className="text-lg font-serif text-[#EAE9E6] font-bold">
                      {child.classRank}e <span className="text-[10px] text-[#8E9299]">/ {child.totalClassSize}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#8E9299] uppercase">Présence</div>
                    <div className="text-lg font-serif text-emerald-400 font-bold">{child.attendanceRate}%</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setActiveChildId(child.id)}
                className={`w-full py-2.5 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center space-x-2 border transition-all ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#0F1115] font-bold border-[#D4AF37]'
                    : 'bg-[#0F1115] text-[#EAE9E6] border-[#2D333D] hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
              >
                <span>{isActive ? 'Profil Actif Sélectionné' : 'Sélectionner ce Profil'}</span>
                {!isActive && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* School Contact & Support Block */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#2D333D] pb-3">
          <Shield className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-sm font-serif italic text-[#EAE9E6] font-bold">
            Administration & Inscription Nationale (Ministère de l'Éducation Nationale - Massar)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-[#8E9299]">
          <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
            <span className="text-[#D4AF37] block mb-1">Secrétariat Moulay Youssef:</span>
            <span>+212 537 70 88 12</span>
          </div>
          <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
            <span className="text-[#D4AF37] block mb-1">Support Massar Talamidh:</span>
            <span>https://massarservice.men.gov.ma</span>
          </div>
          <div className="bg-[#0F1115] p-3 border border-[#2D333D]">
            <span className="text-[#D4AF37] block mb-1">Assistance Parent Qarayti:</span>
            <span>parent-support@qarayti.ai</span>
          </div>
        </div>
      </div>
    </div>
  );
};
