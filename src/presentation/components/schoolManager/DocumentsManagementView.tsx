/**
 * Qarayti.ai — School Manager Portal: Sub-Module 9: Documents & Circulars (MEN)
 * Ministry of Education official circulars, student certificates, Massar transcripts & exam papers.
 */

import React, { useState } from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import { FileText, Plus, Download, File, Search } from 'lucide-react';

export const DocumentsManagementView: React.FC = () => {
  const { documents, addDocument } = useSchoolManager();
  const [showAdd, setShowAdd] = useState(false);

  const [title, setTitle] = useState('Attestation de Scolarité Modèle Officiel MEN');
  const [category, setCategory] = useState<'OFFICIAL_CIRCULAR_MEN' | 'CERTIFICATE_BAC' | 'TRANSCRIPT_MASSAR' | 'EXAM_PAPER' | 'ADMINISTRATIVE'>('CERTIFICATE_BAC');
  const [fileFormat, setFileFormat] = useState<'PDF' | 'DOCX' | 'XLSX'>('PDF');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      title,
      category,
      fileFormat,
      uploadedBy: 'Secrétariat Général',
      sizeKb: 450,
    });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Documents Administratifs & Circulaires MEN</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Archivage et génération des pièces officielles, attestations de scolarité, relevés Massar et notes ministérielles.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#D4AF37] text-[#0F1115] font-bold px-4 py-2 text-xs font-mono hover:bg-[#b5942d] transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Document</span>
        </button>
      </div>

      {/* Document Library */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <h3 className="text-base font-serif italic text-[#EAE9E6] border-b border-[#2D333D] pb-3">
          Bibliothèque Nationale des Documents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-[#0F1115] border border-[#2D333D] p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase">{doc.category}</span>
                  <span className="px-1.5 py-0.5 bg-[#2D333D] text-[10px] font-mono font-bold text-[#EAE9E6]">
                    {doc.fileFormat}
                  </span>
                </div>
                <h4 className="text-xs font-serif font-bold text-[#EAE9E6] mt-2 leading-snug">{doc.title}</h4>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-[#8E9299] pt-2 border-t border-[#2D333D]">
                <span>{doc.dateUploaded} ({doc.sizeKb} KB)</span>
                <button className="text-[#D4AF37] hover:underline flex items-center space-x-1 font-bold">
                  <Download className="w-3 h-3" />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#2D333D] p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Enregistrer un Document</h3>
            <form onSubmit={handleAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8E9299] block mb-1">Titre du Document</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                >
                  <option value="OFFICIAL_CIRCULAR_MEN">Circulaire Officielle MEN</option>
                  <option value="CERTIFICATE_BAC">Attestation / Certificat BAC</option>
                  <option value="TRANSCRIPT_MASSAR">Relevé de Notes Massar</option>
                  <option value="EXAM_PAPER">Épreuve d'Examen Blanc</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-3 py-1.5 bg-[#2D333D] text-[#EAE9E6]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#D4AF37] text-[#0F1115] font-bold"
                >
                  Ajouter au Fichier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
