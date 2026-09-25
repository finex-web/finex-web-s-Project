import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Quote, PlanType } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  FileSpreadsheet,
  Check,
  Percent,
  Printer,
  X,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const QuotesView: React.FC = () => {
  const quotes = db.getQuotes();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<Quote | null>(null);

  const planTemplates: Record<
    PlanType,
    { price: number; maintenance: number; delivery: string; features: string[] }
  > = {
    STARTER: {
      price: 9999,
      maintenance: 999,
      delivery: '3-5 Days',
      features: [
        '1-3 Pages Responsive Layout',
        'Mobile Friendly & Speed Optimized',
        'Contact Form + WhatsApp Chat Button',
        'Basic SEO Setup & Meta Tags',
        'Free Domain (.com/.in) 1 Year',
        '1 Year Cloud Hosting Included',
        '1 Month Free Support & Minor Revisions',
      ],
    },
    BUSINESS: {
      price: 19999,
      maintenance: 1499,
      delivery: '5-7 Days',
      features: [
        '5-8 Custom Designed Pages',
        'Premium Modern High-Conversion UI',
        'Fast Loading Speed Optimization',
        'Contact Form + WhatsApp Direct Lead Flow',
        'On-Page SEO + Schema Setup',
        'Google Map Integration',
        'Free Domain (1 Year) + High-Speed Hosting',
        '3 Months Free Technical Support',
      ],
    },
    PROFESSIONAL: {
      price: 14999,
      maintenance: 1299,
      delivery: '5-7 Days',
      features: [
        '4-6 Custom Designed Pages',
        'Modern Responsive UI',
        'Fast Loading Speed Optimization',
        'Contact Form & Lead Capture',
        'Basic SEO Setup',
        'Free Domain & 1 Year Hosting',
      ],
    },
    'BUSINESS PRO': {
      price: 24999,
      maintenance: 1999,
      delivery: '7-10 Days',
      features: [
        '8-12 Custom Pages',
        'E-Commerce or Booking Integration',
        'Full Analytics & SEO Suite',
        'Free Domain + SSL Security',
        '6 Months Priority Support',
      ],
    },
    PREMIUM: {
      price: 34999,
      maintenance: 2499,
      delivery: '7-10 Days',
      features: [
        'Up to 15 Pages Architecture',
        'Custom Advanced UI/UX & Micro-interactions',
        'Dynamic Blog / News Management System',
        'Payment Gateway Integration (Razorpay/Stripe)',
        'Advanced SEO & Analytics Integration',
        'Social Media Feed Integration',
        'Free Domain + SSL Security Setup',
        'Premium Cloud Hosting (1 Year)',
        '6 Months Free Priority Support',
      ],
    },
    CUSTOM: {
      price: 55000,
      maintenance: 4999,
      delivery: '15-20 Days',
      features: [
        'Full Custom Web Application & Architecture',
        'Custom Relational Database & Schemas',
        'Private Admin Management Dashboard',
        'Multi-Role Access & Authentication',
        'External API & Automation Integrations',
        'Custom Payment Gateway & Invoicing',
        'Bespoke Agency SLA & Dedicated Engineer',
      ],
    },
  };

  const [formData, setFormData] = useState({
    business_name: '',
    client_name: '',
    selected_plan: 'BUSINESS' as PlanType,
    plan_price: 19999,
    discount: 0,
    payment_terms: '50% Advance, 50% on Completion',
    valid_till: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'SENT' as Quote['status'],
    notes: 'Includes 1 year complimentary domain and high-speed hosting setup.',
  });

  const handlePlanSelect = (plan: PlanType) => {
    const pInfo = planTemplates[plan];
    setFormData({
      ...formData,
      selected_plan: plan,
      plan_price: pInfo.price,
    });
  };

  const filtered = quotes.filter((q) => {
    const matchesSearch =
      q.business_name.toLowerCase().includes(search.toLowerCase()) ||
      q.client_name.toLowerCase().includes(search.toLowerCase()) ||
      q.quote_code.toLowerCase().includes(search.toLowerCase());

    const matchesPlan = planFilter === 'ALL' || q.selected_plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name || !formData.client_name) {
      alert('Please fill in business and client name.');
      return;
    }

    const final_price = Math.max(0, formData.plan_price - formData.discount);
    const planInfo = planTemplates[formData.selected_plan];
    const included_services = planInfo ? planInfo.features : [];

    db.addQuote({
      ...formData,
      development_price: formData.plan_price,
      maintenance_price: planInfo ? planInfo.maintenance : 1499,
      hosting: '1 Year Included',
      domain: 'Separate (.com/.in)',
      quote_date: new Date().toISOString().split('T')[0],
      final_price,
      included_services,
      created_date: new Date().toISOString().split('T')[0],
    });

    setIsAddOpen(false);
  };

  const formatINR = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Quotations & Pricing Plans</h2>
          <p className="text-xs text-zinc-400">
            Generate standardized client quotes for Starter, Business, Premium, or Custom website tiers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Quotation</span>
        </button>
      </div>

      {/* Pricing Plans Overview Cards (Section 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Starter Plan */}
        <div className="bg-[#121316] border border-white/[0.08] p-4 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400">Entry Tier</div>
            <h3 className="text-base font-bold text-white mt-1">STARTER PLAN</h3>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              ₹9,999
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
              + ₹999/mo maintenance
            </div>

            <ul className="mt-4 space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> 1-3 Pages Mobile Responsive
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> WhatsApp Button + Contact Form
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> Free Domain & Hosting (1 Yr)
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-zinc-500 font-mono text-[11px]">Delivery: 3-5 Days</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => {
              handlePlanSelect('STARTER');
              setIsAddOpen(true);
            }}
            className="mt-4 w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white rounded transition-colors"
          >
            Select Starter Plan
          </button>
        </div>

        {/* Business Plan (Most Popular) */}
        <div className="bg-[#15161a] border-2 border-[#E52D27]/80 p-4 rounded-lg flex flex-col justify-between relative shadow-lg">
          <div className="absolute -top-2.5 right-3 bg-[#E52D27] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded tracking-wider uppercase">
            Most Popular
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-[#E52D27]">High Conversion</div>
            <h3 className="text-base font-bold text-white mt-1">BUSINESS PLAN</h3>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              ₹19,999
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
              + ₹1,499/mo maintenance
            </div>

            <ul className="mt-4 space-y-1.5 text-xs text-zinc-300">
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> 5-8 Premium Modern Pages
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> Fast Speed & On-Page SEO
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> Google Map + Lead Flow
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-zinc-400 font-mono text-[11px]">Delivery: 5-7 Days</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => {
              handlePlanSelect('BUSINESS');
              setIsAddOpen(true);
            }}
            className="mt-4 w-full py-1.5 bg-[#E52D27] hover:bg-[#c92520] text-xs font-semibold text-white rounded transition-colors"
          >
            Select Business Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-[#121316] border border-white/[0.08] p-4 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400">Enterprise Grade</div>
            <h3 className="text-base font-bold text-white mt-1">PREMIUM PLAN</h3>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              ₹34,999
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
              + ₹2,499/mo maintenance
            </div>

            <ul className="mt-4 space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> Up to 15 Pages Architecture
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> Payment Gateway + Blog
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> 6 Months Free Support
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-zinc-500 font-mono text-[11px]">Delivery: 7-10 Days</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => {
              handlePlanSelect('PREMIUM');
              setIsAddOpen(true);
            }}
            className="mt-4 w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white rounded transition-colors"
          >
            Select Premium Plan
          </button>
        </div>

        {/* Custom Plan */}
        <div className="bg-[#121316] border border-white/[0.08] p-4 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400">Full Web App</div>
            <h3 className="text-base font-bold text-white mt-1">CUSTOM PLAN</h3>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              Custom Quote
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
              Bespoke SLA maintenance
            </div>

            <ul className="mt-4 space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> Custom Database & Admin Portal
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> Multi-Role Access & Cloud APIs
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E52D27]">✓</span> Tailored Architecture
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-zinc-500 font-mono text-[11px]">Timeline: 15-20 Days</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => {
              handlePlanSelect('CUSTOM');
              setIsAddOpen(true);
            }}
            className="mt-4 w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white rounded transition-colors"
          >
            Select Custom Plan
          </button>
        </div>
      </div>

      {/* Filter and Quotes Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="p-3 border-b border-white/[0.08] flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotes by client, business, quote ID..."
              className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
            />
          </div>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
          >
            <option value="ALL">All Plans</option>
            <option value="STARTER">Starter</option>
            <option value="BUSINESS">Business</option>
            <option value="PREMIUM">Premium</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-3">Quote ID</th>
                <th className="py-2.5 px-3">Business & Client</th>
                <th className="py-2.5 px-3">Selected Plan</th>
                <th className="py-2.5 px-3">Base Price</th>
                <th className="py-2.5 px-3">Discount</th>
                <th className="py-2.5 px-3">Final Amount</th>
                <th className="py-2.5 px-3">Terms</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-500">
                    No quotations generated yet.
                  </td>
                </tr>
              ) : (
                filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-sky-400">
                      {q.quote_code}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{q.business_name}</div>
                      <div className="text-[11px] text-zinc-400">{q.client_name}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-300">
                      <span className="px-2 py-0.5 bg-zinc-800 rounded text-[11px]">
                        {q.selected_plan}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-400 tabular-nums">
                      {formatINR(q.plan_price || q.development_price || 0)}
                    </td>

                    <td className="py-3 px-3 font-mono text-rose-400 tabular-nums">
                      {q.discount > 0 ? `-${formatINR(q.discount)}` : '—'}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-white tabular-nums">
                      {formatINR(q.final_price)}
                    </td>

                    <td className="py-3 px-3 text-zinc-400 text-[11px]">
                      {q.payment_terms}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={q.status} />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActivePreview(q)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded transition-colors"
                        >
                          Preview Proposal
                        </button>
                        {q.status === 'SENT' && (
                          <button
                            type="button"
                            onClick={() => db.updateQuoteStatus(q.id, 'ACCEPTED')}
                            className="px-2 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/40 rounded text-xs transition-colors"
                            title="Mark Accepted by Client"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quote Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Generate Official Quotation</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="e.g. Apex Hospital"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Client Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="e.g. Dr. K. Sharma"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Select Pricing Plan</label>
                  <select
                    value={formData.selected_plan}
                    onChange={(e) => handlePlanSelect(e.target.value as PlanType)}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="STARTER">Starter Plan (₹9,999)</option>
                    <option value="BUSINESS">Business Plan (₹19,999)</option>
                    <option value="PREMIUM">Premium Plan (₹34,999)</option>
                    <option value="CUSTOM">Custom Plan (Custom)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Plan Base Price (₹)</label>
                  <input
                    type="number"
                    value={formData.plan_price}
                    onChange={(e) => setFormData({ ...formData, plan_price: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Discount Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Final Calculated Quote</label>
                  <div className="h-8 px-2.5 bg-[#202126] border border-white/10 rounded text-emerald-400 font-mono font-bold flex items-center">
                    {formatINR(Math.max(0, formData.plan_price - formData.discount))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Valid Till Date</label>
                  <input
                    type="date"
                    value={formData.valid_till}
                    onChange={(e) => setFormData({ ...formData, valid_till: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Proposal Notes / Inclusions</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
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
                  Issue Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official FINEX Quotation Document Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setActivePreview(null)} />
          <div className="relative w-full max-w-2xl bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-6 z-10">
            {/* Header Document */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <Logo size="md" showTagline={true} />
                <div className="text-[11px] text-zinc-400 mt-2">
                  FINEX WEB Agency · Operating System Quote Proposal
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-amber-400 font-bold block">
                  {activePreview.quote_code}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Date: {activePreview.created_date}
                </span>
                <div className="mt-1">
                  <StatusBadge status={activePreview.status} />
                </div>
              </div>
            </div>

            {/* Recipient details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-white/[0.08] text-xs">
              <div>
                <div className="text-[10px] font-mono uppercase text-zinc-500">Prepared For</div>
                <div className="font-bold text-white text-sm mt-0.5">
                  {activePreview.business_name}
                </div>
                <div className="text-zinc-400">Attention: {activePreview.client_name}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-zinc-500">Terms & Validity</div>
                <div className="text-zinc-300 mt-0.5">{activePreview.payment_terms}</div>
                <div className="text-zinc-400 font-mono text-[11px]">
                  Valid Until: {activePreview.valid_till}
                </div>
              </div>
            </div>

            {/* Plan specifications */}
            <div className="py-4 border-b border-white/[0.08] text-xs">
              <div className="flex items-center justify-between font-semibold text-white mb-2">
                <span>Selected Solution: {activePreview.selected_plan} Website Package</span>
                <span className="font-mono">{formatINR(activePreview.plan_price || activePreview.development_price)}</span>
              </div>

              <div className="bg-[#18191c] p-3 rounded space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  Included Technical Deliverables:
                </div>
                {(activePreview.included_services || []).map((srv: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-zinc-300 text-[11px]">
                    <Check className="w-3 h-3 text-[#E52D27]" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>

              {activePreview.discount > 0 && (
                <div className="flex justify-between text-rose-400 font-mono mt-3">
                  <span>Commercial Agency Courtesy Discount:</span>
                  <span>-{formatINR(activePreview.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-white font-mono mt-3 pt-3 border-t border-white/[0.06]">
                <span>Total Investment:</span>
                <span className="text-emerald-400">{formatINR(activePreview.final_price)}</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 text-zinc-200 hover:text-white text-xs"
              >
                Close Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
