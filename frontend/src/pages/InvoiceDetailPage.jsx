import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { Field } from '../components/ui/Field.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { formatCurrency } from '../utils/formatNumber.js';
import { ArrowLeft, Download, Printer, DollarSign } from 'lucide-react';
import api, { getApiUrl } from '../context/api.js';
import toast from 'react-hot-toast';

export function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('a4');

  const [paymentForm, setPaymentForm] = useState({
    amount: '', date: new Date().toISOString().split('T')[0], mode: 'bank', reference: '', notes: ''
  });

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await api.get(`/invoices/${id}`);
      setInvoice(res.data.data);
      setPaymentForm(prev => ({ ...prev, amount: res.data.data.total }));
    } catch (err) {
      toast.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || !paymentForm.date) {
      toast.error('Amount and date are required');
      return;
    }
    try {
      await api.post('/payments', {
        partyId: invoice.party._id,
        invoiceId: invoice._id,
        ...paymentForm
      });
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      fetchInvoice();
    } catch (err) {
      toast.error('Failed to record payment');
    }
  };

  if (loading || !invoice) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-y2k-text border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-2 px-4 py-2 bg-y2k-surface text-y2k-text font-bold text-xs border border-y2k-border rounded-lg hover:bg-y2k-bg transition-all"
        >
          <ArrowLeft size={16} /> All Invoices
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {invoice.status !== 'paid' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-y2k-green text-y2k-greenDark font-bold text-xs border border-y2k-greenDark rounded-lg shadow-y2k-sm hover:translate-y-[-1px] transition-all"
            >
              <DollarSign size={16} /> Record Payment
            </button>
          )}

          <a
            href={getApiUrl(`/invoices/${invoice._id}/html?format=${selectedFormat}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-y2k-surface text-y2k-text font-bold text-xs border border-y2k-border rounded-lg shadow-y2k-sm hover:bg-y2k-bg transition-all"
          >
            <Printer size={16} /> Print / Preview ({selectedFormat.toUpperCase()})
          </a>

          <a
            href={getApiUrl(`/invoices/${invoice._id}/pdf?format=${selectedFormat}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-y2k-text text-y2k-bg font-bold text-xs border border-y2k-border rounded-lg shadow-y2k-sm hover:opacity-90 transition-all"
          >
            <Download size={16} /> Download PDF
          </a>
        </div>
      </div>

      {/* Header Info */}
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-y2k-text font-mono">{invoice.invoiceNo}</h2>
            <Pill tone={invoice.status === 'paid' ? 'green' : invoice.status === 'partial' ? 'amber' : 'red'}>
              {invoice.status.toUpperCase()}
            </Pill>
            <Pill tone={invoice.saleType === 'cash' ? 'green' : 'amber'}>
              {invoice.saleType === 'cash' ? 'CASH SALE' : 'CREDIT SALE'}
            </Pill>
          </div>
          <p className="text-xs text-y2k-muted font-medium mt-1">
            Issued on {invoice.date} · Factory: {invoice.factory?.name} ({invoice.factory?.state})
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] font-bold text-y2k-muted uppercase tracking-wider">Total Amount</p>
          <p className="text-2xl font-black text-y2k-text font-mono">{formatCurrency(invoice.total)}</p>
        </div>
      </Card>

      {/* Print Format Selector Toolbar */}
      <Card className="flex flex-wrap items-center justify-between gap-3 bg-y2k-surface border border-y2k-border py-3">
        <span className="text-xs font-bold uppercase tracking-wider text-y2k-muted flex items-center gap-2">
          <Printer size={16} /> Select Printer & Paper Format:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'a4', label: 'A4 Desktop / Laser' },
            { id: 'a5', label: 'A5 Half-Sheet' },
            { id: '80mm', label: '3" (80mm) POS Thermal / KOT' },
            { id: '58mm', label: '2" (58mm) Mobile Thermal' }
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                selectedFormat === fmt.id
                  ? 'bg-y2k-text text-y2k-bg border-y2k-text shadow-y2k-sm'
                  : 'bg-y2k-surface text-y2k-text border-y2k-border hover:bg-y2k-bg'
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Interactive Invoice Document Preview Sheet */}
      <Card className="!p-0 overflow-hidden min-h-[850px] bg-white rounded-2xl shadow-y2k-lg">
        <iframe
          src={getApiUrl(`/invoices/${invoice._id}/html?format=${selectedFormat}`)}
          title={`Invoice ${invoice.invoiceNo}`}
          className="w-full min-h-[850px] border-none bg-white"
        />
      </Card>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Record Payment for ${invoice.invoiceNo}`}
      >
        <div className="space-y-4">
          <Field label="Amount Paid (₹)">
            <Input
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            />
          </Field>

          <Field label="Payment Date">
            <Input
              type="date"
              value={paymentForm.date}
              onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
            />
          </Field>

          <Field label="Mode">
            <Select
              value={paymentForm.mode}
              onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
              options={[
                { label: "Bank Transfer / UTR", value: "bank" },
                { label: "Cash", value: "cash" },
                { label: "Cheque", value: "cheque" }
              ]}
            />
          </Field>

          <Field label="Reference / UTR #">
            <Input
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              placeholder="e.g. UTR987654"
            />
          </Field>

          <button
            onClick={handleRecordPayment}
            className="w-full py-3 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all mt-2"
          >
            Save Payment Record
          </button>
        </div>
      </Modal>
    </div>
  );
}
