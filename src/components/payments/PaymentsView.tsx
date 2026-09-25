import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Payment, PaymentMethod, PaymentStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  CreditCard,
  Banknote,
  Receipt,
  MessageSquare,
  AlertTriangle,
  Printer,
  CheckCircle2,
  X,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const PaymentsView: React.FC = () => {
  const payments = db.getPayments();
  const clients = db.getClients();
  const projects = db.getProjects();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<Payment | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<Payment | null>(null);
  const [whatsappReminderTarget, setWhatsappReminderTarget] = useState<Payment | null>(null);

  // Add form
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    project_id: '',
    project_name: '',
    total_amount: 19999,
    amount_received: 10000,
    payment_method: 'BANK TRANSFER' as PaymentMethod,
    invoice_number: `INV-2026-${String(payments.length + 1).padStart(3, '0')}`,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '50% project initiation advance received.',
  });

  // Update payment form
  const [updateAmount, setUpdateAmount] = useState(0);
  const [updateMethod, setUpdateMethod] = useState<PaymentMethod>('BANK TRANSFER');
  const [updateNotes, setUpdateNotes] = useState('');

  const filtered = payments.filter((p) => {
    const projName = p.project_name || '';
    const invNum = p.invoice_number || '';

    const matchesSearch =
      p.client_name.toLowerCase().includes(search.toLowerCase()) ||
      projName.toLowerCase().includes(search.toLowerCase()) ||
      p.payment_code.toLowerCase().includes(search.toLowerCase()) ||
      invNum.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleClientSelect = (cId: string) => {
    const c = clients.find((x) => x.id === cId);
    if (c) {
      const clientProj = projects.find((p) => p.client_id === c.id);
      setFormData({
        ...formData,
        client_id: c.id,
        client_name: c.business_name,
        project_id: clientProj ? clientProj.id : '',
        project_name: clientProj ? clientProj.business_name : c.business_name,
      });
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.project_name) {
      alert('Please specify client and project.');
      return;
    }

    const total = Number(formData.total_amount);
    const rec = Number(formData.amount_received);
    const status = rec >= total ? 'PAID' : rec > 0 ? 'PARTIAL' : 'UNPAID';

    db.addPayment({
      ...formData,
      status,
      total_amount: total,
      amount_received: rec,
      payment_date: new Date().toISOString().split('T')[0],
    });

    setIsAddOpen(false);
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTarget) return;

    db.updatePayment(updateTarget.id, Number(updateAmount), updateMethod, updateNotes);
    setUpdateTarget(null);
  };

  const formatINR = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Client Payments & Invoicing</h2>
          <p className="text-xs text-zinc-400">
            Track advance milestones, delivery balances, official tax receipts, and payment reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData({
              client_id: clients[0]?.id || '',
              client_name: clients[0]?.business_name || '',
              project_id: projects[0]?.id || '',
              project_name: projects[0]?.business_name || '',
              total_amount: 19999,
              amount_received: 10000,
              payment_method: 'BANK TRANSFER',
              invoice_number: `INV-2026-${String(payments.length + 1).padStart(3, '0')}`,
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              notes: 'Project advance milestone',
            });
            setIsAddOpen(true);
          }}
          className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#121316] border border-white/[0.08] rounded-lg">
          <div className="text-[11px] font-mono text-zinc-400 uppercase">Total Contract Value</div>
          <div className="mt-1.5 text-xl font-bold font-mono text-white tabular-nums">
            {formatINR(payments.reduce((acc, p) => acc + p.total_amount, 0))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Across all client invoices</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-emerald-900/30 rounded-lg">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Total Revenue Collected</div>
          <div className="mt-1.5 text-xl font-bold font-mono text-emerald-300 tabular-nums">
            {formatINR(payments.reduce((acc, p) => acc + p.amount_received, 0))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Realized cash in bank</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-amber-900/30 rounded-lg">
          <div className="text-[11px] font-mono text-amber-400 uppercase">Pending Receivables</div>
          <div className="mt-1.5 text-xl font-bold font-mono text-amber-300 tabular-nums">
            {formatINR(payments.reduce((acc, p) => acc + p.remaining, 0))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Due upon project delivery</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-rose-900/30 rounded-lg">
          <div className="text-[11px] font-mono text-rose-400 uppercase">Overdue Balance</div>
          <div className="mt-1.5 text-xl font-bold font-mono text-rose-300 tabular-nums">
            {formatINR(
              payments
                .filter((p) => p.status === 'OVERDUE' || (p.due_date < new Date().toISOString().split('T')[0] && p.remaining > 0))
                .reduce((acc, p) => acc + p.remaining, 0)
            )}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Requires immediate follow-up</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121316] border border-white/[0.08] p-3 rounded-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments by invoice, client, project, code..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PARTIAL">PARTIAL</option>
          <option value="UNPAID">UNPAID</option>
          <option value="OVERDUE">OVERDUE</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-3">Invoice No.</th>
                <th className="py-2.5 px-3">Client & Project</th>
                <th className="py-2.5 px-3">Contract Value</th>
                <th className="py-2.5 px-3">Received</th>
                <th className="py-2.5 px-3">Remaining Balance</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-500">
                    No payment invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-sky-400">
                      <div>{p.invoice_number}</div>
                      <div className="text-[10px] text-zinc-500">{p.payment_code}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{p.client_name}</div>
                      <div className="text-[11px] text-zinc-400">{p.project_name}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-300 tabular-nums">
                      {formatINR(p.total_amount)}
                    </td>

                    <td className="py-3 px-3 font-mono text-emerald-400 tabular-nums font-semibold">
                      {formatINR(p.amount_received)}
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums">
                      {p.remaining > 0 ? (
                        <span className="text-rose-400 font-semibold">{formatINR(p.remaining)}</span>
                      ) : (
                        <span className="text-zinc-600">₹0</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">
                      {p.payment_method}
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-300 text-[11px]">
                      {p.due_date}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={p.status} />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp reminder trigger */}
                        {p.remaining > 0 && (
                          <button
                            type="button"
                            onClick={() => setWhatsappReminderTarget(p)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors"
                            title="Generate WhatsApp Reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Update received */}
                        <button
                          type="button"
                          onClick={() => {
                            setUpdateTarget(p);
                            setUpdateAmount(p.amount_received);
                            setUpdateMethod(p.payment_method);
                            setUpdateNotes(p.notes || '');
                          }}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                          title="Update Received Amount"
                        >
                          Update
                        </button>

                        {/* Invoice Receipt */}
                        <button
                          type="button"
                          onClick={() => setInvoiceTarget(p)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded"
                          title="Generate Official Invoice"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD NEW PAYMENT MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Record Client Invoice / Payment</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="mt-4 space-y-3">
              <div>
                <label className="block text-zinc-300 mb-1">Select Client Account *</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.business_name} ({c.client_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Total Contract Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Amount Received So Far (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount_received}
                    onChange={(e) => setFormData({ ...formData, amount_received: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="BANK TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                    <option value="UPI">UPI</option>
                    <option value="ONLINE GATEWAY">Razorpay / Stripe Gateway</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Notes / Terms</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. 50% milestone advance"
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold shadow-sm"
                >
                  Save Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE PAYMENT MODAL */}
      {updateTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setUpdateTarget(null)} />
          <div className="relative w-full max-w-md bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-white">Update Payment Received</h3>
                <p className="text-zinc-400 mt-0.5">
                  {updateTarget.invoice_number} · {updateTarget.client_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUpdateTarget(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="mt-4 space-y-3">
              <div className="p-3 bg-[#191a1d] rounded flex justify-between font-mono">
                <span className="text-zinc-400">Total Contract Value:</span>
                <span className="text-white font-bold">{formatINR(updateTarget.total_amount)}</span>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">New Total Received Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max={updateTarget.total_amount}
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(Number(e.target.value))}
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-zinc-900 rounded flex justify-between font-mono">
                <span className="text-zinc-400">Remaining Due:</span>
                <span className="text-rose-400 font-bold">
                  {formatINR(Math.max(0, updateTarget.total_amount - updateAmount))}
                </span>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Payment Method</label>
                <select
                  value={updateMethod}
                  onChange={(e) => setUpdateMethod(e.target.value as PaymentMethod)}
                  className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                >
                  <option value="BANK TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                  <option value="UPI">UPI</option>
                  <option value="ONLINE GATEWAY">Razorpay / Stripe Gateway</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Remarks</label>
                <input
                  type="text"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setUpdateTarget(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold shadow-sm"
                >
                  Update Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP REMINDER COPY MODAL */}
      {whatsappReminderTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setWhatsappReminderTarget(null)} />
          <div className="relative w-full max-w-md bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Payment Reminder</span>
              </h3>
              <button
                type="button"
                onClick={() => setWhatsappReminderTarget(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-zinc-400 text-xs">
                Pre-formatted reminder message for {whatsappReminderTarget.client_name}:
              </p>

              <div className="p-3 bg-[#191a1d] rounded border border-white/[0.06] text-zinc-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all">
{`Hello ${whatsappReminderTarget.client_name},
Greeting from FINEX WEB!

This is a gentle reminder regarding invoice ${whatsappReminderTarget.invoice_number} for project "${whatsappReminderTarget.project_name}".

Total Contract: ${formatINR(whatsappReminderTarget.total_amount)}
Amount Received: ${formatINR(whatsappReminderTarget.amount_received)}
Outstanding Balance: ${formatINR(whatsappReminderTarget.remaining)}
Due Date: ${whatsappReminderTarget.due_date}

Kindly process the pending balance to ensure uninterrupted deployment and technical maintenance.

Bank Transfer / UPI details:
FINEX WEB
UPI: pay@finexweb
A/C: 9876543210123 (IFSC: HDFC0001234)

Thank you,
FINEX WEB Management`}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Hello ${whatsappReminderTarget.client_name}, this is a gentle reminder regarding invoice ${whatsappReminderTarget.invoice_number} from FINEX WEB. Outstanding balance: ${formatINR(whatsappReminderTarget.remaining)}. Due date: ${whatsappReminderTarget.due_date}. Thank you!`
                    );
                    alert('Reminder text copied to clipboard!');
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWhatsappReminderTarget(null)}
                  className="px-4 py-1.5 bg-[#E52D27] hover:bg-[#c92520] text-white rounded font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL INVOICE / RECEIPT MODAL */}
      {invoiceTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setInvoiceTarget(null)} />
          <div className="relative w-full max-w-2xl bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-6 z-10 text-xs">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <Logo size="md" showTagline={true} />
                <div className="text-[11px] text-zinc-400 mt-2">
                  FINEX WEB · Website Development Agency
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm text-white font-bold block">
                  TAX INVOICE
                </span>
                <span className="font-mono text-xs text-sky-400 block mt-0.5">
                  {invoiceTarget.invoice_number}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Date: {invoiceTarget.payment_date}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-b border-white/[0.08]">
              <div>
                <div className="text-[10px] font-mono uppercase text-zinc-500">Billed To</div>
                <div className="font-bold text-white text-sm mt-0.5">{invoiceTarget.client_name}</div>
                <div className="text-zinc-400">{invoiceTarget.project_name}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-zinc-500">Invoice Status</div>
                <div className="mt-1">
                  <StatusBadge status={invoiceTarget.status} />
                </div>
                <div className="text-zinc-400 font-mono text-[11px] mt-1">
                  Due: {invoiceTarget.due_date}
                </div>
              </div>
            </div>

            <div className="py-4 border-b border-white/[0.08] space-y-3 font-mono">
              <div className="flex justify-between font-sans font-semibold text-white">
                <span>Description: Professional Website Design & Engineering</span>
                <span>{formatINR(invoiceTarget.total_amount)}</span>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex justify-between text-zinc-300">
                <span>Amount Realized:</span>
                <span className="text-emerald-400 font-bold">
                  {formatINR(invoiceTarget.amount_received)}
                </span>
              </div>

              {invoiceTarget.remaining > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Balance Due:</span>
                  <span className="font-bold">{formatINR(invoiceTarget.remaining)}</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setInvoiceTarget(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 text-zinc-200 hover:text-white text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
