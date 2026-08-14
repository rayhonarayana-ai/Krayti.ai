/**
 * Qarayti.ai — School Manager Portal: Sub-Module 4: Financial Management & Tuition
 * Financial accounting, tuition collections, payroll, operational expenses & transaction logs in MAD.
 */

import React, { useState } from 'react';
import { useSchoolManager } from '../../context/SchoolManagerContext';
import { DollarSign, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, ShieldCheck } from 'lucide-react';

export const FinanceManagementView: React.FC = () => {
  const { financeSummary, transactions, addTransaction } = useSchoolManager();
  const [showAddTx, setShowAddTx] = useState(false);

  const [category, setCategory] = useState<'TUITION' | 'PAYROLL' | 'EQUIPMENT' | 'UTILITIES' | 'EVENT'>('TUITION');
  const [amountMAD, setAmountMAD] = useState(3500);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [description, setDescription] = useState('Règlement scolarité mensuelle');
  const [recipientOrPayer, setRecipientOrPayer] = useState('Famille Bennis');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amountMAD) return;

    addTransaction({
      category,
      amountMAD: Number(amountMAD),
      type,
      description,
      recipientOrPayer,
      status: 'COMPLETED',
    });

    setShowAddTx(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6]">Gestion Financière, Scolarité & Paie</h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Comptabilité globale de l'établissement, suivi des règlements de scolarité et masse salariale en Dirham Marocain (MAD).
          </p>
        </div>

        <button
          onClick={() => setShowAddTx(true)}
          className="bg-[#D4AF37] text-[#0F1115] font-bold px-4 py-2 text-xs font-mono hover:bg-[#b5942d] transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Saisir Transaction</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase">Total Recettes Encaissées</span>
          <div className="text-2xl font-serif font-bold text-[#10B981]">
            {financeSummary.totalRevenueMAD.toLocaleString()} MAD
          </div>
          <div className="text-[10px] font-mono text-[#8E9299]">Frais de scolarité & frais d'examen</div>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase">Frais Scolarité en Souffrance</span>
          <div className="text-2xl font-serif font-bold text-[#EF4444]">
            {financeSummary.pendingTuitionMAD.toLocaleString()} MAD
          </div>
          <div className="text-[10px] font-mono text-[#EF4444]">Impayés à relancer auprès des tuteurs</div>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase">Masse Salariale Mensuelle</span>
          <div className="text-2xl font-serif font-bold text-[#D4AF37]">
            {financeSummary.payrollMAD.toLocaleString()} MAD
          </div>
          <div className="text-[10px] font-mono text-[#8E9299]">Professeurs & Personnel admin</div>
        </div>

        <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-2">
          <span className="text-[10px] font-mono text-[#8E9299] uppercase">Taux de Recouvrement Global</span>
          <div className="text-2xl font-serif font-bold text-[#10B981]">
            {financeSummary.collectionRatePercent}%
          </div>
          <div className="text-[10px] font-mono text-[#10B981]">Objectif mensuel atteint</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <h3 className="text-base font-serif italic text-[#EAE9E6] border-b border-[#2D333D] pb-3">
          Journal des Opérations Comptables
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#2D333D] text-[#8E9299] uppercase text-[10px]">
                <th className="py-3 px-2">Date & Réf</th>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2">Tiers (Payeur / Bénéficiaire)</th>
                <th className="py-3 px-2">Catégorie</th>
                <th className="py-3 px-2 text-right">Montant (MAD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333D]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#0F1115]/80 transition-all">
                  <td className="py-3 px-2">
                    <div className="text-[#EAE9E6]">{tx.date}</div>
                    <div className="text-[10px] text-[#8E9299]">{tx.id}</div>
                  </td>
                  <td className="py-3 px-2 font-bold text-[#EAE9E6]">{tx.description}</td>
                  <td className="py-3 px-2 text-[#8E9299]">{tx.recipientOrPayer}</td>
                  <td className="py-3 px-2">
                    <span className="px-1.5 py-0.5 bg-[#0F1115] border border-[#2D333D] text-[10px] text-[#D4AF37]">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`py-3 px-2 text-right font-bold ${tx.type === 'INCOME' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{tx.amountMAD.toLocaleString()} MAD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTx && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#2D333D] p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-serif italic text-[#EAE9E6]">Saisir une Operation Comptable</h3>
            <form onSubmit={handleAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#8E9299] block mb-1">Type d'opération</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                >
                  <option value="INCOME">Recette (+ MAD)</option>
                  <option value="EXPENSE">Dépense (- MAD)</option>
                </select>
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                >
                  <option value="TUITION">Scolarité Élèves</option>
                  <option value="PAYROLL">Masse Salariale / Paie</option>
                  <option value="EQUIPMENT">Équipement Pedagigique</option>
                  <option value="UTILITIES">Charges Exploitation</option>
                </select>
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Montant (MAD)</label>
                <input
                  type="number"
                  required
                  value={amountMAD}
                  onChange={(e) => setAmountMAD(Number(e.target.value))}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div>
                <label className="text-[#8E9299] block mb-1">Tier (Payeur ou Bénéficiaire)</label>
                <input
                  type="text"
                  required
                  value={recipientOrPayer}
                  onChange={(e) => setRecipientOrPayer(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D333D] p-2 text-[#EAE9E6]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTx(false)}
                  className="px-3 py-1.5 bg-[#2D333D] text-[#EAE9E6]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#D4AF37] text-[#0F1115] font-bold"
                >
                  Enregistrer Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
