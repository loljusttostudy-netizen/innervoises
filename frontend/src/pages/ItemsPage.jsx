import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { Field } from '../components/ui/Field.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { AutocompleteInput } from '../components/ui/AutocompleteInput.jsx';
import { Search, Plus, Package, Edit3, Trash2 } from 'lucide-react';
import api from '../context/api.js';
import toast from 'react-hot-toast';

const GST_SLABS = [0, 5, 12, 18, 28];

export function ItemsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    name: '', category: 'General', hsn: '', unit: 'NOS', rate: '', gst: 18, rateDecimalPlaces: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data.data);
    } catch (err) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitsList = async (query) => {
    const res = await api.get('/items/units');
    const units = res.data.data;
    if (!query) return units;
    return units.filter(u => u.toLowerCase().includes(query.toLowerCase()));
  };

  const handleOpenAdd = () => {
    setEditingItem({ _id: null });
    setForm({ name: '', category: 'General', hsn: '', unit: 'NOS', rate: '', gst: 18, rateDecimalPlaces: '' });
  };

  const handleOpenEdit = (it) => {
    setEditingItem(it);
    setForm({
      name: it.name,
      category: it.category || 'General',
      hsn: it.hsn || '',
      unit: it.unit || 'NOS',
      rate: it.rate,
      gst: it.gst,
      rateDecimalPlaces: it.rateDecimalPlaces !== null && it.rateDecimalPlaces !== undefined ? it.rateDecimalPlaces : ''
    });
  };

  const handleSave = async () => {
    if (!form.name || form.rate === '') {
      toast.error('Item name and rate are required');
      return;
    }

    const payload = {
      ...form,
      rate: Number(form.rate),
      gst: Number(form.gst),
      rateDecimalPlaces: form.rateDecimalPlaces !== '' ? Number(form.rateDecimalPlaces) : null
    };

    try {
      if (editingItem._id) {
        await api.put(`/items/${editingItem._id}`, payload);
        toast.success('Item updated');
      } else {
        await api.post('/items', payload);
        toast.success('Item added');
      }
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      toast.error('Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      toast.success('Item deleted');
      fetchItems();
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.hsn && i.hsn.includes(search)) ||
    (i.category && i.category.toLowerCase().includes(search.toLowerCase()))
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
      {/* Search & Actions Bar */}
      <div className="bg-white border-2 border-y2k-border shadow-y2k p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-y2k-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, HSN, category..."
            className="!pl-9"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-y2k-muted">No items found matching search</div>
        ) : (
          filtered.map((it) => (
            <div
              key={it._id}
              className="flex items-center justify-between px-5 py-4 border-b-2 border-y2k-border last:border-none hover:bg-y2k-bg/40 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 bg-y2k-purple border border-y2k-border flex items-center justify-center text-y2k-text shrink-0 font-bold">
                  <Package size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-y2k-text truncate">{it.name}</p>
                  <p className="text-[11px] font-semibold text-y2k-muted truncate">
                    {it.category} · HSN {it.hsn || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs font-semibold text-y2k-muted">per {it.unit}</span>
                <span className="text-sm font-black font-mono w-24 text-right text-y2k-text">
                  ₹{Number(it.rate).toLocaleString('en-IN', { maximumFractionDigits: 5 })}
                </span>
                <Pill tone="blue">{it.gst}% GST</Pill>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(it)}
                    className="p-1.5 bg-white border border-y2k-border hover:bg-y2k-yellow text-y2k-text transition-colors"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(it._id)}
                    className="p-1.5 bg-y2k-red/40 hover:bg-y2k-red border border-y2k-redDark text-y2k-redDark transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </Card>

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={editingItem?._id ? "Edit Item" : "Add Item"}
      >
        <div className="space-y-4">
          <Field label="Item Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Industrial Cotton Fabric"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Tape, Steel, Fabric"
              />
            </Field>
            <Field label="HSN / SAC Code">
              <Input
                value={form.hsn}
                onChange={(e) => setForm({ ...form, hsn: e.target.value })}
                placeholder="e.g. 5806"
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Unit">
              <AutocompleteInput
                value={form.unit}
                onChange={(val) => setForm({ ...form, unit: val })}
                onSelect={(val) => setForm({ ...form, unit: typeof val === 'string' ? val : val.unit })}
                fetchSuggestions={fetchUnitsList}
                placeholder="meter, BUNDLE, NOS..."
              />
            </Field>

            <Field label="Default Rate">
              <Input
                type="number"
                step="0.00001"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                placeholder="14.00"
              />
            </Field>

            <Field label="GST Slab %">
              <Select
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value })}
                options={GST_SLABS.map(g => ({ label: `${g}%`, value: g }))}
              />
            </Field>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all mt-2"
          >
            Save Item
          </button>
        </div>
      </Modal>
    </div>
  );
}
