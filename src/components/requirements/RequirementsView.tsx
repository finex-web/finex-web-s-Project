import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Requirement, WebsiteType } from '../../types';
import {
  Plus,
  Search,
  FileCode,
  Globe,
  CheckCircle2,
  Calendar,
  X,
  Eye,
  Edit2,
  ExternalLink,
} from 'lucide-react';

export const RequirementsView: React.FC = () => {
  const requirements = db.getRequirements();
  const clients = db.getClients();
  const leads = db.getLeads();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<Requirement | null>(null);

  const availableFeatures = [
    'Contact Form',
    'WhatsApp Chat Button',
    'Booking / Appointment',
    'Payment Gateway',
    'Product Catalog',
    'Admin Dashboard',
    'Multi-language',
    'SEO Setup',
    'Google Map Integration',
    'Custom Inquiry Forms',
  ];

  const websiteTypes: WebsiteType[] = [
    'BUSINESS WEBSITE',
    'E-COMMERCE',
    'PORTFOLIO',
    'LANDING PAGE',
    'BLOG / NEWS',
    'REAL ESTATE',
    'CUSTOM WEB APP',
  ];

  const [formData, setFormData] = useState({
    business_name: '',
    client_name: '',
    website_type: 'BUSINESS WEBSITE' as WebsiteType,
    pages_count: 5,
    features: ['Contact Form', 'WhatsApp Chat Button', 'SEO Setup'],
    design_preference: 'Dark, modern, minimal corporate aesthetic',
    reference_websites: 'apple.com, stripe.com',
    domain_needed: true,
    hosting_needed: true,
    logo_needed: false,
    content_provided: true,
    budget_range: '₹25,000 - ₹35,000',
    target_delivery_date: '',
    notes: '',
  });

  const filtered = requirements.filter((r) => {
    const matchesSearch =
      r.business_name.toLowerCase().includes(search.toLowerCase()) ||
      r.client_name.toLowerCase().includes(search.toLowerCase()) ||
      r.req_code.toLowerCase().includes(search.toLowerCase()) ||
      r.features.some((f) => f.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || r.website_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const toggleFeature = (feat: string) => {
    if (formData.features.includes(feat)) {
      setFormData({
        ...formData,
        features: formData.features.filter((f) => f !== feat),
      });
    } else {
      setFormData({
        ...formData,
        features: [...formData.features, feat],
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name || !formData.client_name) {
      alert('Please provide business name and client name.');
      return;
    }

    db.addRequirement({
      ...formData,
      business_type: formData.website_type,
      number_of_pages: formData.pages_count || 5,
      budget: 19999,
      status: 'PENDING',
      date_collected: new Date().toISOString().split('T')[0],
    });

    setIsAddOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Requirement Specifications
          </h2>
          <p className="text-xs text-zinc-400">
            Define website scopes, technical integrations, feature sets, and client delivery expectations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Specification</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121316] border border-white/[0.08] p-3 rounded-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search specs by code, client, feature, or business..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-[#E52D27]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Website Types ({requirements.length})</option>
          {websiteTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-zinc-500 bg-[#121316] border border-white/[0.08] rounded-lg">
            No requirement specs found.
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-4 rounded-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-zinc-400 text-[11px]">{req.req_code}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono font-medium">
                    {req.website_type}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">{req.business_name}</h3>
                <div className="text-xs text-zinc-400 mt-0.5">{req.client_name}</div>

                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Scope:</span>
                    <span className="text-zinc-200 font-mono">{req.pages_count} Pages</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Target Delivery:</span>
                    <span className="text-zinc-200 font-mono">
                      {req.target_delivery_date || 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Budget Range:</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {req.budget_range || 'Quote Pending'}
                    </span>
                  </div>
                </div>

                {/* Features Pill-free Tag Cloud */}
                <div className="mt-3 pt-2 border-t border-white/[0.04]">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1.5">
                    Core Technical Features:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {req.features.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-white/5 rounded text-zinc-300 font-mono"
                      >
                        {f}
                      </span>
                    ))}
                    {req.features.length > 3 && (
                      <span className="text-[10px] px-1 py-0.5 text-zinc-500 font-mono">
                        +{req.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                  <span>DOM: {req.domain_needed ? 'YES' : 'NO'}</span>
                  <span>·</span>
                  <span>HST: {req.hosting_needed ? 'YES' : 'NO'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setViewTarget(req)}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full Spec</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Create Website Requirement Specification</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="e.g. Acme Innovations"
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
                    placeholder="e.g. Ankit Verma"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Website Type</label>
                  <select
                    value={formData.website_type}
                    onChange={(e) => setFormData({ ...formData, website_type: e.target.value as WebsiteType })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    {websiteTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Number of Pages</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pages_count}
                    onChange={(e) => setFormData({ ...formData, pages_count: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Budget Range</label>
                  <input
                    type="text"
                    value={formData.budget_range}
                    onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                    placeholder="₹25,000 - ₹35,000"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              {/* Features required checklist */}
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">
                  Required Technical Modules & Features
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#18191d] border border-white/5 rounded">
                  {availableFeatures.map((feat) => {
                    const isChecked = formData.features.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFeature(feat)}
                        className={`text-left p-2 rounded border text-xs flex items-center gap-2 transition-colors ${
                          isChecked
                            ? 'bg-[#E52D27]/15 border-[#E52D27]/40 text-white'
                            : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[10px] ${
                            isChecked
                              ? 'bg-[#E52D27] border-[#E52D27] text-white'
                              : 'border-zinc-700'
                          }`}
                        >
                          {isChecked && '✓'}
                        </span>
                        <span className="truncate">{feat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Design Style Preferences</label>
                  <input
                    type="text"
                    value={formData.design_preference}
                    onChange={(e) => setFormData({ ...formData, design_preference: e.target.value })}
                    placeholder="e.g. Minimalist, Dark mode, Bold typography"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Reference Website URLs</label>
                  <input
                    type="text"
                    value={formData.reference_websites}
                    onChange={(e) => setFormData({ ...formData, reference_websites: e.target.value })}
                    placeholder="e.g. stripe.com, finexweb.com"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.domain_needed}
                    onChange={(e) => setFormData({ ...formData, domain_needed: e.target.checked })}
                    className="accent-[#E52D27]"
                  />
                  <span>Domain Needed</span>
                </label>

                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hosting_needed}
                    onChange={(e) => setFormData({ ...formData, hosting_needed: e.target.checked })}
                    className="accent-[#E52D27]"
                  />
                  <span>Hosting Needed</span>
                </label>

                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.logo_needed}
                    onChange={(e) => setFormData({ ...formData, logo_needed: e.target.checked })}
                    className="accent-[#E52D27]"
                  />
                  <span>Logo Design</span>
                </label>

                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.content_provided}
                    onChange={(e) => setFormData({ ...formData, content_provided: e.target.checked })}
                    className="accent-[#E52D27]"
                  />
                  <span>Content Provided</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Target Delivery Date</label>
                  <input
                    type="date"
                    value={formData.target_delivery_date}
                    onChange={(e) => setFormData({ ...formData, target_delivery_date: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Additional Client Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Specific requests, third party APIs..."
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
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
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setViewTarget(null)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-6 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="font-mono text-xs text-amber-400">{viewTarget.req_code}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{viewTarget.business_name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewTarget(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-[#191a1d] p-3 rounded">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Client</span>
                  <span className="text-white font-medium">{viewTarget.client_name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Website Model</span>
                  <span className="text-white font-medium">{viewTarget.website_type}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Page Scope</span>
                  <span className="text-white font-mono">{viewTarget.pages_count} Pages</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">Budget Target</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {viewTarget.budget_range}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px] mb-1">Selected Features:</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewTarget.features.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-200 border border-white/5 rounded text-[11px]"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Design Preferences:</span>
                <p className="text-zinc-300 mt-0.5">{viewTarget.design_preference || 'Standard FINEX Modern Design'}</p>
              </div>

              {viewTarget.reference_websites && (
                <div>
                  <span className="text-zinc-500 block text-[11px]">Inspiration / References:</span>
                  <p className="text-zinc-300 font-mono mt-0.5">{viewTarget.reference_websites}</p>
                </div>
              )}

              <div className="flex gap-4 text-zinc-400 font-mono text-[11px] pt-2 border-t border-white/[0.04]">
                <span>Domain: {viewTarget.domain_needed ? 'Needed' : 'Existing'}</span>
                <span>Hosting: {viewTarget.hosting_needed ? 'Needed' : 'Existing'}</span>
                <span>Logo: {viewTarget.logo_needed ? 'Needs Creation' : 'Provided'}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setViewTarget(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 text-zinc-200 hover:text-white"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
