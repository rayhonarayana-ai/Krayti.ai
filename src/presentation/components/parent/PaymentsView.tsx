/**
 * Qarayti.ai — Parent Portal: Sub-Module 10: Payments & Financial Accounting
 * Tuition Invoices, Payment History, Official Receipts, and Moroccan Payment Gateways
 * (CMI, Attijariwafa Bank Transfer, Cash at Agency, Wafacash).
 */

import React, { useState } from 'react';
import { useParentPortal } from '../../context/ParentPortalContext';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Building,
  ShieldCheck,
  FileText,
  DollarSign,
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { activeChild, payments, payInvoice } = useParentPortal();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<string>('CMI');

  const childPayments = payments.filter((p) => p.childId === activeChild.id);
  const selectedInvoice = childPayments.find((p) => p.id === selectedInvoiceId);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInvoiceId) {
      payInvoice(selectedInvoiceId, selectedGateway);
      setSelectedInvoiceId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
              Frais de Scolarité & Facturation (Moroccan Payment Gateways)
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8E9299] mt-1">
            Gestion des appels de fonds, paiements sécurisés CMI / Virement Attijariwafa Bank et téléchargement des reçus.
          </p>
        </div>
        <div className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 self-start md:self-auto font-bold">
          Solde Dû: {activeChild.unpaidBalanceMad} MAD
        </div>
      </div>

      {/* Payment Gateway Badges */}
      <div className="bg-[#161920] border border-[#2D333D] p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#8E9299]">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Partenaires de Paiement Certifiés au Maroc:</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] font-bold text-[#EAE9E6]">
          <span className="bg-[#0F1115] px-2.5 py-1 border border-[#2D333D]">Carte CMI Maroc</span>
          <span className="bg-[#0F1115] px-2.5 py-1 border border-[#2D333D]">Attijariwafa Bank</span>
          <span className="bg-[#0F1115] px-2.5 py-1 border border-[#2D333D]">BMCE / Banque Populaire</span>
          <span className="bg-[#0F1115] px-2.5 py-1 border border-[#2D333D]">Wafacash / Cash Plus</span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-[#161920] border border-[#2D333D] p-5 space-y-4">
        <h3 className="text-sm font-serif italic text-[#EAE9E6] font-bold border-b border-[#2D333D] pb-3">
          Factures Mensuelles & Avis d'Échéance
        </h3>

        <div className="space-y-3">
          {childPayments.map((inv) => {
            const isPaid = inv.status === 'PAID';
            return (
              <div
                key={inv.id}
                className="bg-[#0F1115] border border-[#2D333D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/30">
                      N° {inv.invoiceNumber}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#EAE9E6]">{inv.title}</span>
                  </div>
                  <p className="text-xs font-serif text-[#8E9299]">
                    Période: {inv.billingPeriod} • Date d'échéance: <strong className="text-[#EAE9E6]">{inv.dueDate}</strong>
                  </p>
                  {isPaid && (
                    <p className="text-[10px] font-mono text-emerald-400 pt-0.5">
                      Réglé le {inv.paidDate} via {inv.paymentMethod} (Reçu: {inv.receiptNumber})
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-xl font-serif font-bold text-[#D4AF37] block">
                      {inv.amountMad} MAD
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                        isPaid
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {isPaid ? 'RÉGLÉ' : 'EN ATTENTE'}
                    </span>
                  </div>

                  {!isPaid ? (
                    <button
                      onClick={() => setSelectedInvoiceId(inv.id)}
                      className="px-4 py-2 bg-[#D4AF37] text-[#0F1115] font-bold text-xs font-mono uppercase hover:bg-amber-400"
                    >
                      Régler Facture
                    </button>
                  ) : (
                    <button
                      onClick={() => alert(`Téléchargement du Reçu Officiel N° ${inv.receiptNumber}`)}
                      className="p-2 bg-[#161920] border border-[#2D333D] text-[#8E9299] hover:text-[#D4AF37] hover:border-[#D4AF37]"
                      title="Télécharger Reçu de Paiement PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Moroccan Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#D4AF37] p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-serif italic text-[#EAE9E6] font-bold">
              Règlement en Ligne — {selectedInvoice.title}
            </h3>
            <p className="text-xs font-mono text-[#8E9299]">
              Montant à régler: <strong className="text-[#D4AF37] text-sm">{selectedInvoice.amountMad} MAD</strong>
            </p>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#D4AF37] mb-2 uppercase">
                  Moyen de Paiement Marocain:
                </label>
                <div className="space-y-2 text-xs font-mono">
                  {[
                    { id: 'CMI', label: 'Carte Bancaire Marocaine (CMI)' },
                    { id: 'Attijariwafa Bank', label: 'Virement Attijariwafa Bank / Attijari Mobile' },
                    { id: 'Wafacash', label: 'Paiement en Espèces à l\'Agence (Wafacash / Cash Plus)' },
                  ].map((gateway) => (
                    <label
                      key={gateway.id}
                      className={`flex items-center space-x-3 p-3 border cursor-pointer ${
                        selectedGateway === gateway.id
                          ? 'bg-[#0F1115] border-[#D4AF37] text-[#EAE9E6]'
                          : 'bg-[#161920] border-[#2D333D] text-[#8E9299]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gateway"
                        value={gateway.id}
                        checked={selectedGateway === gateway.id}
                        onChange={(e) => setSelectedGateway(e.target.value)}
                        className="accent-[#D4AF37]"
                      />
                      <span>{gateway.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceId(null)}
                  className="px-4 py-2 bg-[#0F1115] border border-[#2D333D] text-xs font-mono text-[#8E9299]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-[#0F1115] font-bold text-xs font-mono uppercase"
                >
                  Confirmer Règlement ({selectedInvoice.amountMad} MAD)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
