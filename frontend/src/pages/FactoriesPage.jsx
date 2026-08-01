import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { Field } from '../components/ui/Field.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Plus, Factory, Edit3, Trash2 } from 'lucide-react';
import api from '../context/api.js';
import toast from 'react-hot-toast';
import { INDIAN_STATES as STATES } from '../utils/indianStates.js';

export function FactoriesPage() {
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', state: STATES[0], address: '' });

  useEffect(() => {
    fetchFactories();
  }, []);

  const fetchFactories = async () => {
    try {
      const res = await api.get('/factories');
      setFactories(res.data.data);
    } catch (err) {
      toast.error('Failed to load factories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ name: '', state: STATES[0], address: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (f) => {
    setEditingId(f._id);
    setForm({ name: f.name, state: f.state, address: f.address });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.address) {
      toast.error('Name and address are required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/factories/${editingId}`, form);
        toast.success('Factory updated');
      } else {
        await api.post('/factories', form);
        toast.success('Factory added');
      }
      setShowModal(false);
      fetchFactories();
    } catch (err) {
      toast.error('Failed to save factory');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this factory location?')) return;
    try {
      await api.delete(`/factories/${id}`);
      toast.success('Factory deleted');
      fetchFactories();
    } catch (err) {
      toast.error('Failed to delete factory');
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
        <p className="text-xs font-bold uppercase tracking-wider text-y2k-muted">{factories.length} Registered Manufacturing Units</p>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all"
        >
          <Plus size={16} /> Add Factory
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {factories.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center text-xs font-semibold text-y2k-muted bg-white border-2 border-y2k-border">
            No factories added yet. Click Add Factory to create one.
          </div>
        ) : (
          factories.map((f) => (
            <Card key={f._id} hover className="relative group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-y2k-blue border border-y2k-border flex items-center justify-center text-y2k-text shrink-0">
                    <Factory size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-y2k-text">{f.name}</h3>
                    <Pill tone="blue" className="mt-1">{f.state}</Pill>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(f)}
                    className="p-1.5 bg-white border border-y2k-border hover:bg-y2k-yellow text-y2k-text transition-colors"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(f._id)}
                    className="p-1.5 bg-y2k-red/40 hover:bg-y2k-red border border-y2k-redDark text-y2k-redDark transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-y2k-muted font-medium pt-2 border-t border-y2k-border">{f.address}</p>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Factory Unit" : "Add Factory Unit"}
      >
        <div className="space-y-4">
          <Field label="Factory / Unit Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Main Unit"
            />
          </Field>
          <Field label="State">
            <Select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              options={STATES}
            />
          </Field>
          <Field label="Full Address">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. Plot 42, Industrial Area, Sector 5"
            />
          </Field>
          <button
            onClick={handleSave}
            className="w-full py-3 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all mt-2"
          >
            Save Factory Location
          </button>
        </div>
      </Modal>
    </div>
  );
}
