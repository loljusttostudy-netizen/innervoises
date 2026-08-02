import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { formatCurrency } from '../utils/formatNumber.js';
import { Search, Plus, Printer } from 'lucide-react';
import api, { getApiUrl } from '../context/api.js';
import toast from 'react-hot-toast';

export function InvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data.data);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (inv.party?.name && inv.party.name.toLowerCase().includes(search.toLowerCase()));

    const matchStatus =
      statusFilter === 'ALL' || inv.status.toUpperCase() === statusFilter;

    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-y2k-text border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Search & Actions Bar */}
      <div className="bg-white border-2 border-y2k-border shadow-y2k p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-y2k-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice # or party..."
              className="!pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: "All Statuses", value: "ALL" },
              { label: "Unpaid / Due", value: "UNPAID" },
              { label: "Partial", value: "PARTIAL" },
              { label: "Paid", value: "PAID" }
            ]}
            className="w-40"
          />
        </div>

        <button
          onClick={() => navigate('/invoices/create')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all min-h-[44px]"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Table List Container */}
      <Card className="!p-0 overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr_60px] gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-y2k-muted border-b-2 border-y2k-border bg-y2k-bg/50">
          <span>Invoice No</span>
          <span>Party / Buyer</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right">Total Amount</span>
          <span className="text-right">Action</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-y2k-muted">No invoices found matching filter</div>
        ) : (
          filtered.map((inv) => (
            <React.Fragment key={inv._id}>
              {/* Desktop View Row (Whole Line Clickable) */}
              <div
                onClick={() => navigate(`/invoices/${inv._id}`)}
                className="hidden md:grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr_60px] gap-2 px-5 py-4 text-xs items-center border-b-2 border-y2k-border last:border-none hover:bg-y2k-bg/60 cursor-pointer transition-colors"
              >
                <span className="font-bold font-mono text-y2k-text">
                  {inv.invoiceNo}
                </span>
                <span className="font-bold text-y2k-text truncate">
                  {inv.party?.name || 'Party'}
                </span>
                <span className="font-semibold text-y2k-muted">{inv.date}</span>
                <div>
                  <Pill tone={inv.status === 'paid' ? 'green' : inv.status === 'partial' ? 'amber' : 'red'}>
                    {inv.status}
                  </Pill>
                </div>
                <span className="text-right font-black font-mono text-y2k-text text-sm">
                  {formatCurrency(inv.total)}
                </span>
                <div className="flex items-center justify-end">
                  <a
                    href={getApiUrl(`/invoices/${inv._id}/pdf`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 bg-white border border-y2k-border hover:bg-y2k-yellow text-y2k-text transition-colors rounded"
                    title="Print PDF"
                  >
                    <Printer size={15} />
                  </a>
                </div>
              </div>

              {/* Mobile View Card (Whole Card Clickable) */}
              <div
                onClick={() => navigate(`/invoices/${inv._id}`)}
                className="md:hidden p-4 border-b-2 border-y2k-border last:border-none space-y-3 bg-white hover:bg-y2k-bg/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-sm text-y2k-text">
                    {inv.invoiceNo}
                  </span>
                  <Pill tone={inv.status === 'paid' ? 'green' : inv.status === 'partial' ? 'amber' : 'red'}>
                    {inv.status}
                  </Pill>
                </div>

                <div>
                  <p className="font-bold text-xs text-y2k-text">{inv.party?.name || 'Party'}</p>
                  <p className="text-[11px] text-y2k-muted">{inv.date}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-y2k-border/40">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-y2k-muted">Total Amount</p>
                    <p className="font-black font-mono text-sm text-y2k-text">{formatCurrency(inv.total)}</p>
                  </div>

                  <a
                    href={getApiUrl(`/invoices/${inv._id}/pdf`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-y2k-yellow text-y2k-text border border-y2k-border rounded font-bold text-xs flex items-center gap-1"
                    title="Print PDF"
                  >
                    <Printer size={15} />
                  </a>
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </Card>
    </div>
  );
}
