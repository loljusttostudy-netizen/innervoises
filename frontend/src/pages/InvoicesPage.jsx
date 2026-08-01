import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { formatCurrency } from '../utils/formatNumber.js';
import { Search, Plus, Printer, FileText, Download } from 'lucide-react';
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
    <div className="space-y-6 font-sans">
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
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Table List */}
      <Card className="!p-0 overflow-hidden">
        <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr_120px] gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-y2k-muted border-b-2 border-y2k-border bg-y2k-bg/50">
          <span>Invoice No</span>
          <span>Party / Buyer</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right">Total Amount</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-y2k-muted">No invoices found matching filter</div>
        ) : (
          filtered.map((inv) => (
            <div
              key={inv._id}
              className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr_120px] gap-2 px-5 py-4 text-xs items-center border-b-2 border-y2k-border last:border-none hover:bg-y2k-bg/40 transition-colors"
            >
              <span className="font-bold font-mono text-y2k-text cursor-pointer hover:underline" onClick={() => navigate(`/invoices/${inv._id}`)}>
                {inv.invoiceNo}
              </span>
              <span className="font-bold text-y2k-text truncate">
                {inv.party?.name || 'Cash Sale'}
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
              <div className="flex items-center justify-end gap-2">
                <a
                  href={getApiUrl(`/invoices/${inv._id}/pdf`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white border border-y2k-border hover:bg-y2k-yellow text-y2k-text transition-colors"
                  title="Print PDF"
                >
                  <Printer size={15} />
                </a>
                <button
                  onClick={() => navigate(`/invoices/${inv._id}`)}
                  className="p-1.5 bg-y2k-blue border border-y2k-blueDark text-y2k-blueDark transition-colors font-bold text-[10px]"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
