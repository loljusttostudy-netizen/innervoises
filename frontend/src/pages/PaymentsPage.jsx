import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { Field } from '../components/ui/Field.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { AutocompleteInput } from '../components/ui/AutocompleteInput.jsx';
import { formatCurrency } from '../utils/formatNumber.js';
import { Plus, Trash2 } from 'lucide-react';
import api from '../context/api.js';
import toast from 'react-hot-toast';

export function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    partyId: '', partyName: '', amount: '', date: new Date().toISOString().split('T')[0],
    mode: 'bank', reference: '', notes: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      setPayments(res.data.data);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartySuggestions = async (q) => {
    const res = await api.get(`/parties/search?q=${encodeURIComponent(q)}`);
    return res.data.data;
  };

  const handleSelectParty = (p) => {
    setForm({ ...form, partyId: p._id, partyName: p.name });
  };

  const handleCreate = async () => {
    if (!form.partyId || !form.amount || !form.date) {
      toast.error('Party, amount, and date are required');
      return;
    }
    try {
      await api.post('/payments', form);
      toast.success('Payment recorded');
      setShowModal(false);
      fetchPayments();
    } catch (err) {
      toast.error('Failed to record payment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await api.delete(`/payments/${id}`);
      toast.success('Payment deleted');
      fetchPayments();
    } catch (err) {
      toast.error('Failed to delete payment');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-y2k-text border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white border-2 border-y2k-border shadow-y2k p-4 flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-wider text-y2k-muted">{payments.length} Payment Receipts Recorded</p>
        <button
          onClick={() => {
            setForm({ partyId: '', partyName: '', amount: '', date: new Date().toISOString().split('T')[0], mode: 'bank', reference: '', notes: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all"
        >
          <Plus size={16} /> Record Payment
        </button>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_60px] gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-y2k-muted border-b-2 border-y2k-border bg-y2k-bg/50">
          <span>Date</span>
          <span>Party</span>
          <span>Mode</span>
          <span>Reference</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Action</span>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-y2k-muted">No payment records found</div>
        ) : (
          payments.map((p) => (
            <div
              key={p._id}
              className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_60px] gap-3 px-5 py-4 text-xs items-center border-b-2 border-y2k-border last:border-none hover:bg-y2k-bg/40 transition-colors"
            >
              <span className="font-semibold text-y2k-muted">{p.date}</span>
              <span className="font-bold text-y2k-text truncate">{p.party?.name || 'N/A'}</span>
              <div>
                <Pill tone="green">{p.mode.toUpperCase()}</Pill>
              </div>
              <span className="font-mono text-y2k-muted truncate">{p.reference || '—'}</span>
              <span className="text-right font-black text-y2k-greenDark font-mono text-sm">{formatCurrency(p.amount)}</span>
              <div className="text-right">
                <button
                  onClick={() => handleDelete(p._id)}
                  className="p-1.5 bg-y2k-red/40 hover:bg-y2k-red border border-y2k-redDark text-y2k-redDark transition-colors ml-auto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Record Payment Receipt"
      >
        <div className="space-y-4">
          <Field label="Party / Buyer Name (Autocomplete)">
            <AutocompleteInput
              value={form.partyName}
              onSelect={handleSelectParty}
              fetchSuggestions={fetchPartySuggestions}
              placeholder="Type party name..."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (₹)">
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 50000"
              />
            </Field>
            <Field label="Payment Date">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mode">
              <Select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                options={[
                  { label: "Bank Transfer / NEFT / UTR", value: "bank" },
                  { label: "Cash Receipt", value: "cash" },
                  { label: "Cheque", value: "cheque" }
                ]}
              />
            </Field>
            <Field label="Ref / UTR / Cheque #">
              <Input
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="e.g. UTR12345678"
              />
            </Field>
          </div>

          <button
            onClick={handleCreate}
            className="w-full py-3 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all mt-2"
          >
            Save Payment Receipt
          </button>
        </div>
      </Modal>
    </div>
  );
}
