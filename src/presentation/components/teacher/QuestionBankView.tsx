/**
 * Qarayti.ai — Teacher Portal: Sub-Module 5: Question Bank
 * Manage BAC national questions, regional exam series, Bloom taxonomy levels, and difficulty filters.
 */

import React, { useState } from 'react';
import { useTeacherPortal } from '../../context/TeacherPortalContext';
import { Database, Plus, Search, Filter, BookOpen, Sparkles, Award, CheckCircle2, ChevronRight } from 'lucide-react';

export const QuestionBankView: React.FC = () => {
  const { questionBank, addQuestionToBank } = useTeacherPortal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloom, setSelectedBloom] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New question form
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('Nombres Complexes');
  const [statementFr, setStatementFr] = useState('');
  const [solutionKey, setSolutionKey] = useState('');
  const [bacYearReference, setBacYearReference] = useState('Examen National BAC SM 2024');
  const [bloomLevel, setBloomLevel] = useState<'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE'>('APPLY');
  const [difficultyBeta, setDifficultyBeta] = useState(1.0);

  const filteredQuestions = questionBank.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.statementFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBloom = selectedBloom === 'ALL' || q.bloomLevel === selectedBloom;
    return matchesSearch && matchesBloom;
  });

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !statementFr.trim()) return;

    addQuestionToBank({
      subject: 'Mathématiques',
      chapter,
      title,
      statementFr,
      solutionKey,
      bacYearReference,
      bloomLevel,
      difficultyBeta,
      discriminationAlpha: 1.5,
      estimatedMinutes: 20,
    });

    setTitle('');
    setStatementFr('');
    setSolutionKey('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Banque d'Exercices & Problèmes BAC</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Questions d'Examens Nationaux et Régionaux, taxonomies de Bloom, paramètres IRT (Difficulté Beta & Discrimination Alpha).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#D4AF37] text-[#0F1115] hover:bg-[#b5942d] px-4 py-2 text-xs font-mono font-bold uppercase transition-all flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Exercice BAC</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8E9299] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par chapitre, mot-clé, année BAC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0F1115] border border-[#2D333D] pl-9 pr-4 py-2 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-[#8E9299]" />
          <span className="text-xs font-mono text-[#8E9299]">Bloom:</span>
          {['ALL', 'REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedBloom(lvl)}
              className={`px-3 py-1 text-[11px] font-mono transition-all ${
                selectedBloom === lvl
                  ? 'bg-[#D4AF37] text-[#0F1115] font-bold'
                  : 'bg-[#0F1115] text-[#8E9299] border border-[#2D333D] hover:text-[#EAE9E6]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <div key={q.id} className="bg-[#161920] border border-[#2D333D] p-5 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#2D333D] pb-3">
              <div className="flex items-center space-x-3">
                <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-mono px-2 py-0.5">
                  {q.chapter}
                </span>
                <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 border border-[#10B981]/20">
                  {q.bloomLevel}
                </span>
                <span className="text-xs font-mono text-[#8E9299]">IRT Diff (Beta): {q.difficultyBeta}</span>
              </div>
              <span className="text-xs font-mono text-[#D4AF37] italic">{q.bacYearReference}</span>
            </div>

            <h3 className="text-base font-serif font-bold text-[#EAE9E6]">{q.title}</h3>
            <p className="text-xs font-mono text-[#8E9299] leading-relaxed bg-[#0F1115] p-3 border border-[#2D333D]">
              {q.statementFr}
            </p>

            {q.solutionKey && (
              <div className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/5 p-3 border border-[#D4AF37]/20 space-y-1">
                <span className="font-bold text-[10px] uppercase block text-[#D4AF37]">Éléments de Corrigé Type MEN:</span>
                <p className="text-[#EAE9E6]">{q.solutionKey}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Add Question */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0F1115]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161920] border border-[#2D333D] max-w-2xl w-full p-6 space-y-4">
            <h3 className="text-lg font-serif italic text-[#EAE9E6] font-bold">Ajouter une Question BAC</h3>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[#8E9299] block mb-1">Titre de l'Exercice</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#0F1115] border border-[#2D333D] p-2 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-[#8E9299] block mb-1">Chapitre</label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    className="bg-[#0F1115] border border-[#2D333D] p-2 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[#8E9299] block mb-1">Référence BAC / Session</label>
                  <input
                    type="text"
                    value={bacYearReference}
                    onChange={(e) => setBacYearReference(e.target.value)}
                    className="bg-[#0F1115] border border-[#2D333D] p-2 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#8E9299] block mb-1">Énoncé (Français / Arabe)</label>
                <textarea
                  rows={3}
                  required
                  value={statementFr}
                  onChange={(e) => setStatementFr(e.target.value)}
                  className="bg-[#0F1115] border border-[#2D333D] p-2 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#8E9299] block mb-1">Éléments de Corrigé / Barème</label>
                <textarea
                  rows={2}
                  value={solutionKey}
                  onChange={(e) => setSolutionKey(e.target.value)}
                  className="bg-[#0F1115] border border-[#2D333D] p-2 text-xs font-mono text-[#EAE9E6] w-full focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-[#2D333D] text-[#EAE9E6] px-4 py-2 text-xs font-mono"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-[#0F1115] font-bold px-4 py-2 text-xs font-mono"
                >
                  Ajouter à la Banque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
