import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { formatCurrency } from '../utils/formatNumber.js';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  FileText, 
  Plus, 
  AlertCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import api from '../context/api.js';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      toast.error('Failed to load dashboard metrics');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center gap-3">
        <div className="w-10 h-10 border-4 border-y2k-text border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-y2k-muted uppercase tracking-wider">Loading Dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white border-2 border-y2k-border shadow-y2k p-8 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 bg-y2k-red border-2 border-y2k-redDark text-y2k-redDark flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-black uppercase text-y2k-text">Unable to Load Dashboard</h2>
        <p className="text-xs font-semibold text-y2k-muted">
          Could not fetch metrics from the backend. Make sure MongoDB and backend server are running.
        </p>
        <button
          onClick={fetchDashboard}
          className="px-5 py-2.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k inline-flex items-center gap-2"
        >
          <RefreshCw size={16} /> Retry Now
        </button>
      </div>
    );
  }

  const {
    totalBilled = 0,
    totalReceivable = 0,
    totalCollected = 0,
    totalInvoices = 0,
    recentInvoices = [],
    outstandingParties = []
  } = stats;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Action */}
      <div className="bg-white border-2 border-y2k-border shadow-y2k p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-y2k-text tracking-tight">Billing & Accounts Overview</h1>
          <p className="text-xs font-semibold text-y2k-muted mt-0.5">Real-time revenue metrics, party ledger dues & recent invoices</p>
        </div>
        <button
          onClick={() => navigate('/invoices/create')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!bg-y2k-purple/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-y2k-muted">Total Sales</span>
            <div className="p-1.5 bg-y2k-purple border-2 border-y2k-border text-y2k-purpleDark">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-y2k-text">{formatCurrency(totalBilled)}</p>
          <p className="text-[11px] font-semibold text-y2k-muted mt-1">{totalInvoices} Invoices Billed</p>
        </Card>

        <Card className="!bg-y2k-red/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-y2k-muted">Outstanding Dues</span>
            <div className="p-1.5 bg-y2k-red border-2 border-y2k-redDark text-y2k-redDark">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-y2k-redDark">{formatCurrency(totalReceivable)}</p>
          <p className="text-[11px] font-semibold text-y2k-muted mt-1">{outstandingParties.length} Parties Pending</p>
        </Card>

        <Card className="!bg-y2k-green/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-y2k-muted">Received Payments</span>
            <div className="p-1.5 bg-y2k-green border-2 border-y2k-greenDark text-y2k-greenDark">
              <CheckCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-y2k-greenDark">{formatCurrency(totalCollected)}</p>
          <p className="text-[11px] font-semibold text-y2k-muted mt-1">Total Collected</p>
        </Card>

        <Card className="!bg-y2k-blue/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-y2k-muted">Total Invoices</span>
            <div className="p-1.5 bg-y2k-blue border-2 border-y2k-blueDark text-y2k-blueDark">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-y2k-text">{totalInvoices}</p>
          <p className="text-[11px] font-semibold text-y2k-muted mt-1">Recorded to date</p>
        </Card>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between bg-white border-2 border-y2k-border p-3 shadow-y2k-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-y2k-text">Recent Invoices</h2>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs font-bold text-y2k-text hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <Card className="!p-0 overflow-hidden">
            {recentInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs font-semibold text-y2k-muted">No invoices generated yet</div>
            ) : (
              recentInvoices.map((inv) => (
                <div
                  key={inv._id}
                  onClick={() => navigate(`/invoices/${inv._id}`)}
                  className="flex items-center justify-between p-4 border-b-2 border-y2k-border last:border-none hover:bg-y2k-bg/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-y2k-yellow border border-y2k-border flex items-center justify-center font-bold text-xs">
                      #
                    </div>
                    <div>
                      <p className="text-xs font-bold text-y2k-text font-mono">{inv.invoiceNo}</p>
                      <p className="text-[11px] font-semibold text-y2k-muted truncate max-w-[200px] sm:max-w-[260px]">
                        {inv.party?.name || 'Cash Sale'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-black font-mono text-y2k-text">{formatCurrency(inv.total)}</p>
                      <p className="text-[10px] font-medium text-y2k-muted">{inv.date}</p>
                    </div>
                    <Pill tone={inv.status === 'paid' ? 'green' : inv.status === 'partial' ? 'amber' : 'red'}>
                      {inv.status}
                    </Pill>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Top Dues Sidebar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white border-2 border-y2k-border p-3 shadow-y2k-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-y2k-text flex items-center gap-2">
              <AlertCircle size={16} className="text-y2k-redDark" /> Top Receivables
            </h2>
          </div>

          <Card className="!p-0 overflow-hidden">
            {outstandingParties.length === 0 ? (
              <div className="p-8 text-center text-xs font-semibold text-y2k-muted">All party ledgers settled!</div>
            ) : (
              outstandingParties.map((item, idx) => (
                <div
                  key={item.partyId || idx}
                  onClick={() => navigate(`/parties/${item.partyId}`)}
                  className="flex items-center justify-between p-3.5 border-b-2 border-y2k-border last:border-none hover:bg-y2k-bg/60 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-y2k-text truncate">{item.name}</p>
                    <span className="text-[10px] font-semibold text-y2k-muted uppercase">{item.category}</span>
                  </div>
                  <span className="text-xs font-black font-mono text-y2k-redDark shrink-0">
                    {formatCurrency(item.due)}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
