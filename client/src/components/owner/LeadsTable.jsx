import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Inbox, RefreshCw } from 'lucide-react';
import { fetchLeads } from '../../services/api.js';

const dateFmt = (iso) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const currencyFmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const humanizeKey = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function LeadsTable() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (err) {
      setError('Could not load leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const empty = useMemo(() => leads && leads.length === 0, [leads]);

  return (
    <div className="card p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Captured leads</h2>
          <p className="text-sm text-ink-soft dark:text-mist-soft">Most recent submissions first.</p>
        </div>
        <button onClick={load} className="btn-secondary !px-4 !py-2 text-xs" disabled={loading}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && <p className="text-sm text-copper-600">{error}</p>}

      {!leads && !error && <p className="py-10 text-center text-sm text-ink-soft dark:text-mist-soft">Loading leads…</p>}

      {empty && (
        <div className="flex flex-col items-center gap-2 py-14 text-center text-ink-soft dark:text-mist-soft">
          <Inbox size={26} />
          <p className="text-sm">No leads yet — submissions from the public estimator will show up here.</p>
        </div>
      )}

      {leads && leads.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/[0.08] text-left text-xs uppercase tracking-wide text-ink-soft dark:border-mist/[0.1] dark:text-mist-soft">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Phone</th>
                <th className="pb-3 pr-4 font-medium">Email</th>
                <th className="pb-3 pr-4 font-medium">Submitted</th>
                <th className="pb-3 pr-4 font-medium">Estimate</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const isOpen = expandedId === lead._id;
                return (
                  <React.Fragment key={lead._id}>
                    <tr
                      onClick={() => setExpandedId(isOpen ? null : lead._id)}
                      className="cursor-pointer border-b border-ink/[0.05] transition-colors hover:bg-ink/[0.02] dark:border-mist/[0.06] dark:hover:bg-mist/[0.03]"
                    >
                      <td className="py-3 pr-4 font-medium">{lead.name}</td>
                      <td className="py-3 pr-4 text-ink-soft dark:text-mist-soft">{lead.phone}</td>
                      <td className="py-3 pr-4 text-ink-soft dark:text-mist-soft">{lead.email}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-ink-soft dark:text-mist-soft">{dateFmt(lead.createdAt)}</td>
                      <td className="py-3 pr-4 whitespace-nowrap font-mono text-copper-600 dark:text-copper-300">
                        {currencyFmt(lead.estimate_low)} – {currencyFmt(lead.estimate_high)}
                      </td>
                      <td className="py-3 text-right">
                        <ChevronDown size={16} className={`inline-block transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-ink/[0.05] bg-ink/[0.015] dark:border-mist/[0.06] dark:bg-mist/[0.02]">
                        <td colSpan={6} className="px-2 py-4">
                          <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
                            {Object.entries(lead.answers || {}).map(([key, val]) => (
                              <div key={key}>
                                <span className="text-ink-soft dark:text-mist-soft">{humanizeKey(key)}: </span>
                                <span className="font-mono">{String(val)}</span>
                              </div>
                            ))}
                            <div>
                              <span className="text-ink-soft dark:text-mist-soft">Config version: </span>
                              <span className="font-mono">v{lead.config_version}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
