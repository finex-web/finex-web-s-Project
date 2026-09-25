import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import {
  Plus,
  Search,
  Receipt,
  PieChart,
  DollarSign,
  TrendingDown,
  Calendar,
  X,
  Edit2,
  Trash2,
  CreditCard,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const ExpensesView: React.FC = () => {
  const expenses = db.getExpenses();
  const payments = db.getPayments();
  const maintenance = db.getMaintenance();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const categories: ExpenseCategory[] = [
    'OFFICE RENT',
    'HOSTING & SERVERS',
    'DOMAIN PURCHASES',
    'SOFTWARE TOOLS & APIS',
    'MARKETING & ADS',
    'HARDWARE',
    'FREELANCER PAYMENTS',
    'OFFICE TEA & REFRESHMENT',
    'MISCELLANEOUS',
  ];

  const [formData, setFormData] = useState({
    expense_name: '',
    category: 'SOFTWARE TOOLS & APIS' as ExpenseCategory,
    amount: 2500,
    date: new Date().toISOString().split('T')[0],
    paid_to: '',
    payment_method: 'UPI' as PaymentMethod,
    receipt_url: '',
    notes: '',
  });

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalRevenue =
    payments.reduce((acc, p) => acc + p.amount_received, 0) +
    maintenance.reduce((acc, m) => acc + m.monthly_fee, 0);

  const netCashFlow = totalRevenue - totalExpense;

  // Category breakdown calculation
  const categoryTotals = categories.map((cat) => {
    const total = expenses
      .filter((e) => e.category === cat)
      .reduce((acc, e) => acc + e.amount, 0);
    const percentage = totalExpense > 0 ? ((total / totalExpense) * 100).toFixed(1) : '0';
    return { category: cat, total, percentage };
  }).filter((c) => c.total > 0);

  const filtered = expenses.filter((e) => {
    const expName = e.expense_name || e.description || '';
    const paidTo = e.paid_to || e.vendor || '';

    const matchesSearch =
      expName.toLowerCase().includes(search.toLowerCase()) ||
      e.expense_code.toLowerCase().includes(search.toLowerCase()) ||
      paidTo.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      expense_name: '',
      category: 'SOFTWARE TOOLS & APIS',
      amount: 2500,
      date: new Date().toISOString().split('T')[0],
      paid_to: '',
      payment_method: 'UPI',
      receipt_url: '',
      notes: '',
    });
    setIsAddOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expense_name || !formData.amount || !formData.paid_to) {
      alert('Please fill in expense title, amount, and recipient.');
      return;
    }

    if (editingExpense) {
      db.updateExpense(editingExpense.id, formData);
    } else {
      db.addExpense(formData);
    }

    setIsAddOpen(false);
  };

  const formatINR = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Agency Operating Expenses & Outflow
          </h2>
          <p className="text-xs text-zinc-400">
            Categorized overhead tracking: servers, domains, SaaS subscriptions, hardware, and office maintenance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Financial Summary & Cash Flow Comparison (Section 34) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#121316] border border-rose-900/30 rounded-lg">
          <div className="text-[11px] font-mono text-rose-400 uppercase">Total Agency Outflow</div>
          <div className="mt-1.5 text-xl font-bold font-mono text-rose-300 tabular-nums">
            {formatINR(totalExpense)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Across all categories</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-emerald-900/30 rounded-lg">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Total Agency Revenue</div>
          <div className="mt-1.5 text-xl font-bold font-mono text-emerald-300 tabular-nums">
            {formatINR(totalRevenue)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Projects + Retainers</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-white/[0.08] rounded-lg">
          <div className="text-[11px] font-mono text-zinc-400 uppercase">Net Operating Cash Flow</div>
          <div
            className={`mt-1.5 text-xl font-bold font-mono tabular-nums ${
              netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatINR(netCashFlow)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Operating profit reserve</div>
        </div>
      </div>

      {/* Category Breakdown Bar */}
      <div className="bg-[#121316] border border-white/[0.08] p-4 rounded-lg">
        <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <PieChart className="w-3.5 h-3.5 text-[#E52D27]" />
          <span>Category Overhead Breakdown</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoryTotals.map((c) => (
            <div key={c.category} className="p-2.5 bg-zinc-900/80 rounded border border-white/[0.04]">
              <div className="text-[10px] font-mono text-zinc-400 truncate">{c.category}</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-mono text-white text-xs font-bold tabular-nums">
                  {formatINR(c.total)}
                </span>
                <span className="text-[10px] font-mono text-[#E52D27]">{c.percentage}%</span>
              </div>
            </div>
          ))}
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
            placeholder="Search expenses by title, code, vendor, category..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Categories ({expenses.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-3">Expense ID</th>
                <th className="py-2.5 px-3">Expense Item</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Paid To / Vendor</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No expense items found.
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-rose-400">
                      {exp.expense_code}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{exp.expense_name}</div>
                      {exp.notes && (
                        <div className="text-[10px] text-zinc-500 truncate max-w-xs">
                          {exp.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-300">
                      <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px]">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-zinc-200 font-medium">
                      {exp.paid_to}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-300">
                      {exp.date}
                    </td>

                    <td className="py-3 px-3 font-mono text-[10px] text-zinc-400">
                      {exp.payment_method}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-rose-400 tabular-nums">
                      -{formatINR(exp.amount)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpense(exp);
                            setFormData({
                              expense_name: exp.expense_name || exp.description || '',
                              category: exp.category,
                              amount: exp.amount,
                              date: exp.date,
                              paid_to: exp.paid_to || exp.vendor || '',
                              payment_method: exp.payment_method,
                              receipt_url: exp.receipt_url || '',
                              notes: exp.notes || '',
                            });
                            setIsAddOpen(true);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-white rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(exp)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ADD / EDIT EXPENSE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">
                {editingExpense ? `Edit Expense (${editingExpense.expense_code})` : 'Record Operating Expense'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block text-zinc-300 mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={formData.expense_name}
                  onChange={(e) => setFormData({ ...formData, expense_name: e.target.value })}
                  placeholder="e.g. Figma Organization License (Monthly)"
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white text-[11px]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-rose-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Paid To / Vendor *</label>
                  <input
                    type="text"
                    required
                    value={formData.paid_to}
                    onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
                    placeholder="e.g. Figma Inc / Landlord"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="BANK TRANSFER">Bank Transfer</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Receipt URL</label>
                  <input
                    type="text"
                    value={formData.receipt_url}
                    onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Remarks / Purpose</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Budget allocation justification..."
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
                  Save Outflow Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Delete Expense Record?"
          message={`Are you sure you want to delete expense "${deleteTarget.expense_name}" (-${formatINR(deleteTarget.amount)})?`}
          confirmLabel="Delete Expense"
          isDanger={true}
          onConfirm={() => {
            db.deleteExpense(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
