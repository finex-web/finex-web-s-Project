import React, { useState } from 'react';
import { db } from '../../lib/db';
import { SalaryRecord, PaymentMethod, SalaryPayment } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  Banknote,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  X,
  CreditCard,
  Receipt,
  FileText,
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const SalariesView: React.FC = () => {
  const salaryRecords = db.getSalaryRecords();
  const salaryPayments = db.getSalaryPayments();
  const team = db.getTeamMembers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Month selector for generating salaries
  const currentYear = new Date().getFullYear();
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const [selectedMonth, setSelectedMonth] = useState('September');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Modals
  const [disburseTarget, setDisburseTarget] = useState<SalaryRecord | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<SalaryRecord | null>(null);
  const [activeSlip, setActiveSlip] = useState<SalaryRecord | null>(null);

  // Disburse form
  const [disburseAmount, setDisburseAmount] = useState<number>(0);
  const [disburseMethod, setDisburseMethod] = useState<PaymentMethod>('BANK TRANSFER');
  const [disburseRef, setDisburseRef] = useState('');
  const [disburseNotes, setDisburseNotes] = useState('');

  // Adjust form (Bonus, deduction, advance)
  const [adjustBonus, setAdjustBonus] = useState(0);
  const [adjustDeduction, setAdjustDeduction] = useState(0);
  const [adjustAdvance, setAdjustAdvance] = useState(0);
  const [adjustNotes, setAdjustNotes] = useState('');

  const filtered = salaryRecords.filter((s) => {
    const matchesSearch =
      s.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.month.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGenerateBatch = () => {
    const count = db.generateMonthlySalaries(selectedMonth, selectedYear);
    if (count > 0) {
      alert(`Successfully generated ${count} salary records for ${selectedMonth} ${selectedYear}.`);
    } else {
      alert(`All active staff already have salary records for ${selectedMonth} ${selectedYear}.`);
    }
  };

  const handleOpenDisburse = (record: SalaryRecord) => {
    setDisburseTarget(record);
    setDisburseAmount(record.amount_pending);
    setDisburseMethod('BANK TRANSFER');
    setDisburseRef(`SAL-REF-${Date.now().toString().slice(-6)}`);
    setDisburseNotes(`Salary disbursement for ${record.month} ${record.year}`);
  };

  const handleOpenAdjust = (record: SalaryRecord) => {
    setAdjustTarget(record);
    setAdjustBonus(record.bonus);
    setAdjustDeduction(record.deduction);
    setAdjustAdvance(record.advance);
    setAdjustNotes(record.notes || '');
  };

  const handleSaveDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseTarget || disburseAmount <= 0) return;

    db.recordSalaryPayment({
      salary_record_id: disburseTarget.id,
      amount_paid: Number(disburseAmount),
      payment_method: disburseMethod,
      reference_id: disburseRef,
      notes: disburseNotes,
    });

    setDisburseTarget(null);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    db.updateSalaryRecord(adjustTarget.id, {
      bonus: Number(adjustBonus),
      deduction: Number(adjustDeduction),
      advance: Number(adjustAdvance),
      notes: adjustNotes,
    });

    setAdjustTarget(null);
  };

  const formatINR = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header & Payroll batch generator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Salary Ledger & Payroll</h2>
          <p className="text-xs text-zinc-400">
            Formula: Final Salary = Base + Bonus - Deduction - Advance. Live pending and payout records.
          </p>
        </div>

        {/* Batch Generate Control */}
        <div className="flex items-center gap-2 p-1.5 bg-[#121316] border border-white/[0.08] rounded-lg">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-8 px-2 bg-zinc-900 border border-white/10 rounded text-xs text-white"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-8 px-2 bg-zinc-900 border border-white/10 rounded text-xs text-white font-mono"
          >
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear + 1}>{currentYear + 1}</option>
          </select>

          <button
            type="button"
            onClick={handleGenerateBatch}
            className="px-3 py-1.5 bg-[#E52D27] hover:bg-[#c92520] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Payroll</span>
          </button>
        </div>
      </div>

      {/* Salary Overview Summary Cards (Section 23 Status Alerts) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#121316] border border-rose-900/30 rounded-lg">
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>🔴 Salary Overdue</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-rose-300 tabular-nums">
            {salaryRecords.filter((s) => s.payment_status === 'OVERDUE').length} Records
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Disbursement overdue</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-amber-900/30 rounded-lg">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>🟠 Pending Payouts</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-300 tabular-nums">
            {formatINR(salaryRecords.reduce((acc, s) => acc + s.amount_pending, 0))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Total pending balance</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-yellow-900/30 rounded-lg">
          <div className="flex items-center justify-between text-xs text-yellow-400">
            <span>🟡 Partial Paid</span>
            <Banknote className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-yellow-300 tabular-nums">
            {salaryRecords.filter((s) => s.payment_status === 'PARTIALLY PAID').length} Staff
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Partially settled</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-emerald-900/30 rounded-lg">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>🟢 Salary Paid</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-300 tabular-nums">
            {formatINR(salaryRecords.reduce((acc, s) => acc + s.amount_paid, 0))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Disbursed to date</div>
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
            placeholder="Search payroll by employee name, role, month..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="PARTIALLY PAID">PARTIALLY PAID</option>
          <option value="PAID">PAID</option>
          <option value="OVERDUE">OVERDUE</option>
        </select>
      </div>

      {/* Salary Records Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-3">Employee & Role</th>
                <th className="py-2.5 px-3">Payroll Cycle</th>
                <th className="py-2.5 px-3">Base Salary</th>
                <th className="py-2.5 px-3">Bonus</th>
                <th className="py-2.5 px-3">Deduct / Adv</th>
                <th className="py-2.5 px-3">Final Salary</th>
                <th className="py-2.5 px-3">Amount Paid</th>
                <th className="py-2.5 px-3">Pending</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500">
                    No payroll records found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{s.employee_name}</div>
                      <div className="text-[11px] text-[#E52D27]">{s.role}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-300">
                      {s.month} {s.year}
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-300 tabular-nums">
                      {formatINR(s.salary_amount)}
                    </td>

                    <td className="py-3 px-3 font-mono text-emerald-400 tabular-nums">
                      {s.bonus > 0 ? `+${formatINR(s.bonus)}` : '—'}
                    </td>

                    <td className="py-3 px-3 font-mono text-rose-400 tabular-nums">
                      {s.deduction + s.advance > 0
                        ? `-${formatINR(s.deduction + s.advance)}`
                        : '—'}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-white tabular-nums">
                      {formatINR(s.final_salary)}
                    </td>

                    <td className="py-3 px-3 font-mono text-emerald-400 tabular-nums">
                      {formatINR(s.amount_paid)}
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold tabular-nums">
                      {s.amount_pending > 0 ? (
                        <span className="text-rose-400">{formatINR(s.amount_pending)}</span>
                      ) : (
                        <span className="text-zinc-600">₹0</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={s.payment_status} />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Adjust Bonus / Deduction */}
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(s)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                          title="Adjust Bonus, Deduction, Advance"
                        >
                          Adjust
                        </button>

                        {/* Disburse */}
                        {s.amount_pending > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenDisburse(s)}
                            className="px-2.5 py-1 bg-[#E52D27] hover:bg-[#c92520] text-white rounded text-[11px] font-semibold transition-colors shadow-sm"
                          >
                            Pay
                          </button>
                        )}

                        {/* Payslip */}
                        <button
                          type="button"
                          onClick={() => setActiveSlip(s)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded"
                          title="View Official Salary Slip"
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

      {/* DISBURSE SALARY MODAL */}
      {disburseTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setDisburseTarget(null)} />
          <div className="relative w-full max-w-md bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-white">Disburse Salary Payment</h3>
                <p className="text-zinc-400 mt-0.5">
                  {disburseTarget.employee_name} ({disburseTarget.month} {disburseTarget.year})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDisburseTarget(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDisburse} className="mt-4 space-y-3">
              <div className="p-3 bg-[#191a1d] rounded flex justify-between font-mono">
                <span className="text-zinc-400">Total Pending:</span>
                <span className="text-rose-400 font-bold">
                  {formatINR(disburseTarget.amount_pending)}
                </span>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Disbursement Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={disburseTarget.amount_pending}
                  value={disburseAmount}
                  onChange={(e) => setDisburseAmount(Number(e.target.value))}
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Payment Method</label>
                  <select
                    value={disburseMethod}
                    onChange={(e) => setDisburseMethod(e.target.value as PaymentMethod)}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="BANK TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Transaction Ref / UTR</label>
                  <input
                    type="text"
                    value={disburseRef}
                    onChange={(e) => setDisburseRef(e.target.value)}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Notes / Ledger Remarks</label>
                <input
                  type="text"
                  value={disburseNotes}
                  onChange={(e) => setDisburseNotes(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setDisburseTarget(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold shadow-sm"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST SALARY (BONUS / DEDUCTIONS / ADVANCE) MODAL */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setAdjustTarget(null)} />
          <div className="relative w-full max-w-md bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-white">Adjust Salary Components</h3>
                <p className="text-zinc-400 mt-0.5">{adjustTarget.employee_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustTarget(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="mt-4 space-y-3">
              <div className="p-3 bg-[#191a1d] rounded flex justify-between font-mono">
                <span className="text-zinc-400">Base Salary:</span>
                <span className="text-white font-bold">{formatINR(adjustTarget.salary_amount)}</span>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Bonus Addition (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={adjustBonus}
                  onChange={(e) => setAdjustBonus(Number(e.target.value))}
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Deduction (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={adjustDeduction}
                  onChange={(e) => setAdjustDeduction(Number(e.target.value))}
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-rose-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Advance Already Given (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={adjustAdvance}
                  onChange={(e) => setAdjustAdvance(Number(e.target.value))}
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-amber-400 font-mono"
                />
              </div>

              <div className="p-3 bg-zinc-900 border border-white/5 rounded flex justify-between font-mono font-bold text-white">
                <span>Calculated Final Salary:</span>
                <span className="text-emerald-400">
                  {formatINR(
                    Math.max(
                      0,
                      adjustTarget.salary_amount + adjustBonus - adjustDeduction - adjustAdvance
                    )
                  )}
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold shadow-sm"
                >
                  Save Adjustments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL SALARY SLIP MODAL */}
      {activeSlip && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setActiveSlip(null)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-6 z-10 text-xs">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <Logo size="sm" showTagline={true} />
                <div className="text-[11px] text-zinc-400 mt-1">Official Salary Slip</div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-white font-bold block">
                  {activeSlip.month} {activeSlip.year}
                </span>
                <StatusBadge status={activeSlip.payment_status} />
              </div>
            </div>

            <div className="py-4 border-b border-white/[0.08] space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Employee Name:</span>
                <span className="text-white font-semibold">{activeSlip.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Designation / Role:</span>
                <span className="text-zinc-200">{activeSlip.role}</span>
              </div>
            </div>

            <div className="py-4 border-b border-white/[0.08] space-y-2 font-mono">
              <div className="flex justify-between text-zinc-300">
                <span>Base Monthly Salary:</span>
                <span>{formatINR(activeSlip.salary_amount)}</span>
              </div>
              {activeSlip.bonus > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Performance Bonus:</span>
                  <span>+{formatINR(activeSlip.bonus)}</span>
                </div>
              )}
              {activeSlip.deduction > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Deduction:</span>
                  <span>-{formatINR(activeSlip.deduction)}</span>
                </div>
              )}
              {activeSlip.advance > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Advance Recovery:</span>
                  <span>-{formatINR(activeSlip.advance)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/[0.06] flex justify-between text-base font-bold text-white">
                <span>Final Payable:</span>
                <span className="text-emerald-400">{formatINR(activeSlip.final_salary)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Amount Disbursed:</span>
                <span>{formatINR(activeSlip.amount_paid)}</span>
              </div>
              {activeSlip.amount_pending > 0 && (
                <div className="flex justify-between text-rose-400 text-[11px]">
                  <span>Outstanding Pending:</span>
                  <span>{formatINR(activeSlip.amount_pending)}</span>
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
                <span>Print Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSlip(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 text-zinc-200 hover:text-white text-xs"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
