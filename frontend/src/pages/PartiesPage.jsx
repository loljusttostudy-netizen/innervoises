import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { Field } from '../components/ui/Field.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { formatCurrency } from '../utils/formatNumber.js';
import { Search, Plus, UserCheck, Phone, ChevronRight } from 'lucide-react';
import api from '../context/api.js';
import toast from 'react-hot-toast';
import { INDIAN_STATES as STATES } from '../utils/indianStates.js';

export function PartiesPage() {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '', category: 'Government', gstin: '', state: 'Uttar Pradesh', phone: '', email: '', billingAddress: ''
  });

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const res = await api.get('/parties');
      setParties(res.data.data);
    } catch (err) {
      toast.error('Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name) {
      toast.error('Party name is required');
      return;
    }
    try {
      await api.post('/parties', form);
      toast.success('Party created successfully!');
      setShowModal(false);
      fetchParties();
    } catch (err) {
      toast.error('Failed to create party');
    }
  };

  const filtered = parties.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.gstin && p.gstin.toLowerCase().includes(search.toLowerCase())) ||
    (p.phone && p.phone.includes(search))
  );

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-y2k-text border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Search & Header */}
      <div className="bg-white border-2 border-y2k-border shadow-y2k p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-y2k-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search party by name, GSTIN, phone..."
            className="!pl-9"
          />
        </div>

        <button
          onClick={() => {
            setForm({ name: '', category: 'Government', gstin: '', state: 'Uttar Pradesh', phone: '', email: '', billingAddress: '' });
            setShowModal(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all"
        >
          <Plus size={16} /> Add Buyer / Party
        </button>
      </div>

      {/* Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center text-xs font-semibold text-y2k-muted bg-white border-2 border-y2k-border">
            No parties found matching search
          </div>
        ) : (
          filtered.map((p) => (
            <Card
              key={p._id}
              hover
              onClick={() => navigate(`/parties/${p._id}`)}
              className="flex items-start justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-y2k-yellow border border-y2k-border flex items-center justify-center font-bold text-xs shrink-0">
                    {p.name[0]?.toUpperCase()}
                  </div>
                  <h3 className="font-extrabold text-sm text-y2k-text truncate">{p.name}</h3>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <Pill tone={p.category === 'Government' ? 'blue' : 'gray'}>{p.category}</Pill>
                  {p.gstin && <span className="text-[11px] font-mono font-bold text-y2k-muted">GST: {p.gstin}</span>}
                </div>

                <p className="text-xs text-y2k-muted font-medium truncate">{p.billingAddress || p.state}</p>
              </div>

              <div className="text-right shrink-0 flex flex-col justify-between h-full">
                <ChevronRight size={18} className="text-y2k-muted ml-auto" />
                <span className="text-xs font-bold font-mono text-y2k-text mt-4">
                  {p.state}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Party / Buyer"
      >
        <div className="space-y-4">
          <Field label="Party Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Director General Supplies & Disposals"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                options={["Government", "Local"]}
              />
            </Field>
            <Field label="State">
              <Select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                options={STATES}
              />
            </Field>
          </div>

          <Field label="GSTIN Number">
            <Input
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              placeholder="e.g. 09AAAAA0000A1Z5"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </Field>
            <Field label="Email">
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@domain.com"
              />
            </Field>
          </div>

          <Field label="Billing Address">
            <Input
              value={form.billingAddress}
              onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
              placeholder="Street address..."
            />
          </Field>

          <button
            onClick={handleCreate}
            className="w-full py-3 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all mt-2"
          >
            Save Party
          </button>
        </div>
      </Modal>
    </div>
  );
}
