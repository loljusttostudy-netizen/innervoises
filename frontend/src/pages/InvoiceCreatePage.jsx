import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { Field } from '../components/ui/Field.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { AutocompleteInput } from '../components/ui/AutocompleteInput.jsx';
import { formatCurrency } from '../utils/formatNumber.js';
import { Plus, X, ChevronDown, AlertTriangle } from 'lucide-react';
import api from '../context/api.js';
import toast from 'react-hot-toast';
import { INDIAN_STATES as STATES } from '../utils/indianStates.js';

const GST_SLABS = [0, 5, 12, 18, 28];

export function InvoiceCreatePage() {
  const navigate = useNavigate();

  const [factories, setFactories] = useState([]);
  const [parties, setParties] = useState([]);
  const [itemsList, setItemsList] = useState([]);

  const [factoryId, setFactoryId] = useState('');
  const [selectedParty, setSelectedParty] = useState(null);
  const [placeOfSupply, setPlaceOfSupply] = useState('Uttar Pradesh');
  const [saleType, setSaleType] = useState('credit');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [rows, setRows] = useState([
    { id: 1, itemId: null, name: '', description: '-', hsn: '', qty: 1, unit: 'NOS', rate: 0, gst: 18, rateAnomaly: null }
  ]);

  const [moreOpen, setMoreOpen] = useState(false);
  const [extra, setExtra] = useState({
    vehicleNo: '', transportName: '', memoNo: '', eWayBillNo: '', noOfCases: '',
    soNo: '', soDate: '', contractNoGEMC: '', cpNo: '', cpDate: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      const [facRes, partyRes, itemRes] = await Promise.all([
        api.get('/factories'),
        api.get('/parties'),
        api.get('/items')
      ]);

      const userFactories = facRes.data.data || [];
      setFactories(userFactories);

      let activeFacId = localStorage.getItem('selectedFactoryId');
      if (!activeFacId || !userFactories.some(f => f._id === activeFacId)) {
        activeFacId = userFactories[0]?._id || '';
      }
      setFactoryId(activeFacId);

      setParties(partyRes.data.data || []);
      if (partyRes.data.data && partyRes.data.data.length > 0) {
        handleSelectParty(partyRes.data.data[0]);
      }

      setItemsList(itemRes.data.data);

      fetchNextInvoiceNo();
    } catch (err) {
      toast.error('Failed to initialize form data');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextInvoiceNo = async () => {
    try {
      const res = await api.get('/invoices/next-number?prefix=SH/26-27/');
      setInvoiceNo(res.data.data.suggestedInvoiceNo);
    } catch (err) {
      setInvoiceNo('SH/26-27/1');
    }
  };

  const handleSelectParty = (party) => {
    setSelectedParty(party);
    setPlaceOfSupply(party.state || party.placeOfSupply || 'Uttar Pradesh');
    setExtra({
      vehicleNo: party.vehicleNo || '',
      transportName: party.transportName || '',
      memoNo: party.memoNo || '',
      eWayBillNo: party.eWayBillNo || '',
      noOfCases: party.noOfCases || '',
      soNo: party.soNo || '',
      soDate: party.soDate || '',
      contractNoGEMC: party.contractNoGEMC || '',
      cpNo: party.cpNo || '',
      cpDate: party.cpDate || ''
    });
  };

  const currentFactory = factories.find(f => f._id === factoryId) || factories[0];
  const isIntraState = currentFactory && placeOfSupply && currentFactory.state.toLowerCase() === placeOfSupply.toLowerCase();

  const checkRateAnomaly = async (partyId, itemId, enteredRate) => {
    if (!partyId || !itemId || !enteredRate || enteredRate <= 0) return null;
    try {
      const res = await api.get(`/invoices/rate-check?itemId=${itemId}&partyId=${partyId}&rate=${enteredRate}`);
      if (res.data?.data?.isAnomaly) {
        return {
          message: res.data.data.message,
          avgRate: res.data.data.avgRate,
          percentageDev: res.data.data.percentageDev
        };
      }
    } catch (e) {
      // Silently catch if no rate check history or endpoint parameter mismatch
    }
    return null;
  };

  const handleRowChange = async (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    if (field === 'name' && typeof value === 'string') {
      const match = itemsList.find(i => i.name.toLowerCase() === value.toLowerCase());
      if (match) {
        updated[index].itemId = match._id;
        updated[index].hsn = match.hsn || '';
        updated[index].unit = match.unit || 'NOS';
        updated[index].rate = match.rate || 0;
        updated[index].gst = match.gst || 18;
      }
    }

    if (field === 'rate' && updated[index].itemId && selectedParty) {
      const anomaly = await checkRateAnomaly(selectedParty._id, updated[index].itemId, Number(value));
      updated[index].rateAnomaly = anomaly;
    }

    setRows(updated);
  };

  const handleSelectItemForRow = async (index, item) => {
    const updated = [...rows];
    if (typeof item === 'object') {
      updated[index].itemId = item._id;
      updated[index].name = item.name;
      updated[index].hsn = item.hsn || '';
      updated[index].unit = item.unit || 'NOS';
      updated[index].rate = item.rate || 0;
      updated[index].gst = item.gst || 18;

      if (selectedParty) {
        const anomaly = await checkRateAnomaly(selectedParty._id, item._id, item.rate);
        updated[index].rateAnomaly = anomaly;
      }
    } else {
      updated[index].name = item;
    }
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, {
      id: Date.now(), itemId: null, name: '', description: '-', hsn: '', qty: 1, unit: 'NOS', rate: 0, gst: 18, rateAnomaly: null
    }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const calc = useMemo(() => {
    let subtotal = 0;
    const lines = rows.map((r) => {
      const q = Number(r.qty) || 0;
      const rt = Number(r.rate) || 0;
      const amt = q * rt;
      subtotal += amt;
      return { ...r, qty: q, rate: rt, amount: amt };
    });

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    lines.forEach((l) => {
      const gstPct = Number(l.gst) || 0;
      const taxVal = (l.amount * gstPct) / 100;
      if (isIntraState) {
        cgst += taxVal / 2;
        sgst += taxVal / 2;
      } else {
        igst += taxVal;
      }
    });

    const totalBeforeRound = subtotal + cgst + sgst + igst;
    const roundedTotal = Math.round(totalBeforeRound);
    const roundOff = roundedTotal - totalBeforeRound;

    return { subtotal, cgst, sgst, igst, total: roundedTotal, roundOff, lines };
  }, [rows, isIntraState]);

  const handleSubmit = async () => {
    if (!invoiceNo || !invoiceNo.trim()) {
      toast.error('Invoice Number is required');
      return;
    }
    if (!date || !date.trim()) {
      toast.error('Invoice Date is required');
      return;
    }
    if (!factoryId) {
      toast.error('Please select a Factory Unit. If none exists, create one in Factory Units.');
      return;
    }
    if (!selectedParty) {
      toast.error('Please select a Buyer / Party');
      return;
    }
    if (!placeOfSupply) {
      toast.error('Place of Supply is required');
      return;
    }

    const validRows = calc.lines.filter(l => l.name && l.name.trim());
    if (validRows.length === 0) {
      toast.error('At least 1 item with a valid name is required');
      return;
    }

    for (let i = 0; i < validRows.length; i++) {
      const item = validRows[i];
      if (!item.qty || Number(item.qty) <= 0) {
        toast.error(`Quantity for "${item.name}" must be greater than 0`);
        return;
      }
      if (item.rate === undefined || item.rate === null || Number(item.rate) <= 0) {
        toast.error(`Rate for "${item.name}" must be greater than 0`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        invoiceNo: invoiceNo.trim(),
        date,
        partyId: selectedParty._id,
        factoryId,
        saleType,
        placeOfSupply,
        items: validRows.map((l) => ({
          itemId: l.itemId,
          name: l.name.trim(),
          description: l.description || '-',
          hsn: l.hsn || '',
          qty: l.qty,
          unit: l.unit || 'NOS',
          rate: l.rate,
          gst: l.gst,
          amount: l.amount
        })),
        ...extra
      };

      const res = await api.post('/invoices', payload);
      toast.success('Invoice created successfully!');
      navigate(`/invoices/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
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
      {factories.length === 0 && (
        <div className="p-4 bg-y2k-yellow/30 border border-y2k-yellowDark text-y2k-text rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold">
            <AlertTriangle className="text-y2k-yellowDark shrink-0" size={18} />
            <span>No Factory Units found. Please add a Factory Unit before generating invoices.</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/factories')}
            className="px-3 py-1.5 bg-y2k-text text-y2k-bg text-xs font-bold rounded-lg border border-y2k-border shrink-0 hover:opacity-90"
          >
            + Add Factory Unit
          </button>
        </div>
      )}

      {/* Top Config Card */}
      <Card className="grid md:grid-cols-4 gap-4">
        <Field label="Invoice Number">
          <Input
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            placeholder="e.g. SH/26-27/56"
          />
        </Field>

        <Field label="Invoice Date">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field label="Factory Unit Location">
          <Select
            value={factoryId}
            onChange={(e) => setFactoryId(e.target.value)}
            options={factories.map(f => ({ label: `${f.name} (${f.state})`, value: f._id }))}
          />
        </Field>

        <Field label="Sale Type (Debit / Credit)">
          <div className="flex gap-1 p-1 bg-y2k-bg border-2 border-y2k-border">
            <button
              type="button"
              onClick={() => setSaleType('credit')}
              className={`flex-1 py-1.5 text-xs font-bold transition-all ${
                saleType === 'credit' ? 'bg-y2k-red text-y2k-redDark border border-y2k-redDark' : 'text-y2k-text'
              }`}
            >
              Credit (Udhar)
            </button>
            <button
              type="button"
              onClick={() => setSaleType('cash')}
              className={`flex-1 py-1.5 text-xs font-bold transition-all ${
                saleType === 'cash' ? 'bg-y2k-green text-y2k-greenDark border border-y2k-greenDark' : 'text-y2k-text'
              }`}
            >
              Cash (Naqd)
            </button>
          </div>
        </Field>
      </Card>

      {/* Buyer & Place of Supply */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-y2k-muted mb-2">Buyer / Party (Autocomplete)</p>
          <AutocompleteInput
            value={selectedParty?.name || ''}
            onSelect={handleSelectParty}
            fetchSuggestions={async (q) => {
              const res = await api.get(`/parties/search?q=${encodeURIComponent(q)}`);
              return res.data.data;
            }}
            placeholder="Type party name..."
          />
          {selectedParty && (
            <div className="mt-3 p-3 bg-y2k-bg/40 border-2 border-y2k-border text-xs space-y-1">
              <p className="font-bold text-y2k-text">{selectedParty.name} ({selectedParty.category})</p>
              <p className="text-y2k-muted font-mono">{selectedParty.gstin ? `GSTIN: ${selectedParty.gstin}` : 'No GSTIN'}</p>
              <p className="text-y2k-muted truncate">{selectedParty.billingAddress}</p>
            </div>
          )}
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-y2k-muted mb-2">Place of Supply & Tax Mode</p>
            <Select
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
              options={STATES}
            />
          </div>

          <div className="mt-4 p-3 bg-y2k-bg/40 border-2 border-y2k-border flex items-center justify-between text-xs font-bold">
            <span className="text-y2k-muted">GST Treatment</span>
            <Pill tone={isIntraState ? 'green' : 'blue'}>
              {isIntraState ? 'CGST (9%) + SGST (9%)' : 'IGST (18%) Interstate'}
            </Pill>
          </div>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="grid grid-cols-[2.5fr_1fr_0.8fr_1fr_1fr_0.8fr_1.2fr_40px] gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-y2k-muted border-b-2 border-y2k-border bg-y2k-bg/50">
          <span>Item & Description</span>
          <span>HSN</span>
          <span>Qty</span>
          <span>Unit</span>
          <span className="text-right">Rate (₹)</span>
          <span className="text-center">GST%</span>
          <span className="text-right">Amount (₹)</span>
          <span></span>
        </div>

        {rows.map((r, i) => {
          const amt = (Number(r.qty) || 0) * (Number(r.rate) || 0);
          return (
            <div key={r.id} className="p-3 border-b-2 border-y2k-border last:border-none space-y-2">
              <div className="grid grid-cols-[2.5fr_1fr_0.8fr_1fr_1fr_0.8fr_1.2fr_40px] gap-2 items-center text-xs">
                <AutocompleteInput
                  value={r.name}
                  onChange={(val) => handleRowChange(i, 'name', val)}
                  onSelect={(item) => handleSelectItemForRow(i, item)}
                  fetchSuggestions={async (q) => {
                    const res = await api.get(`/items/search?q=${encodeURIComponent(q)}`);
                    return res.data.data;
                  }}
                  placeholder="Search item..."
                />

                <Input
                  value={r.hsn}
                  onChange={(e) => handleRowChange(i, 'hsn', e.target.value)}
                  placeholder="HSN"
                />

                <Input
                  type="number"
                  value={r.qty}
                  onChange={(e) => handleRowChange(i, 'qty', e.target.value)}
                  placeholder="Qty"
                />

                <Input
                  value={r.unit}
                  onChange={(e) => handleRowChange(i, 'unit', e.target.value)}
                  placeholder="Unit"
                />

                <Input
                  type="number"
                  step="0.00001"
                  value={r.rate}
                  onChange={(e) => handleRowChange(i, 'rate', e.target.value)}
                  placeholder="Rate"
                  className="text-right font-mono"
                />

                <Select
                  value={r.gst}
                  onChange={(e) => handleRowChange(i, 'gst', e.target.value)}
                  options={GST_SLABS.map(g => ({ label: `${g}%`, value: g }))}
                />

                <span className="text-right font-black font-mono text-y2k-text">
                  {formatCurrency(amt)}
                </span>

                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="p-1.5 bg-y2k-red/40 hover:bg-y2k-red border border-y2k-redDark text-y2k-redDark transition-colors ml-auto"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Rate Anomaly Warning Banner */}
              {r.rateAnomaly && (
                <div className="flex items-center gap-2 p-2 bg-y2k-yellow/50 border border-y2k-yellowDark text-xs text-y2k-yellowDark font-bold">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>
                    Rate mismatch detected: Last billed rate for this party was{' '}
                    <strong className="font-mono">₹{r.rateAnomaly.lastRate}</strong> on {r.rateAnomaly.lastDate}. (Diff: ₹{r.rateAnomaly.diff.toFixed(2)})
                  </span>
                </div>
              )}
            </div>
          );
        })}

        <div className="p-3 bg-y2k-bg/30 border-t-2 border-y2k-border">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-white text-y2k-text font-bold text-xs border-2 border-y2k-border hover:bg-y2k-yellow transition-colors"
          >
            <Plus size={15} /> Add Item Row
          </button>
        </div>
      </Card>

      {/* Extra Logistics Details Toggle */}
      <Card className="space-y-4">
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          className="flex items-center justify-between w-full text-xs font-bold text-y2k-text uppercase tracking-wider"
        >
          <span>Logistics & Reference Details (Vehicle, Transport, eWay, GEMC)</span>
          <ChevronDown size={16} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
        </button>

        {moreOpen && (
          <div className="grid md:grid-cols-3 gap-4 pt-2 border-t-2 border-y2k-border">
            <Field label="Vehicle No.">
              <Input value={extra.vehicleNo} onChange={(e) => setExtra({ ...extra, vehicleNo: e.target.value })} placeholder="e.g. DL1LAR9143" />
            </Field>
            <Field label="Transport Name">
              <Input value={extra.transportName} onChange={(e) => setExtra({ ...extra, transportName: e.target.value })} placeholder="e.g. Indian Tempo Service" />
            </Field>
            <Field label="e-Way Bill No.">
              <Input value={extra.eWayBillNo} onChange={(e) => setExtra({ ...extra, eWayBillNo: e.target.value })} placeholder="e.g. 123456789012" />
            </Field>
            <Field label="No. of Cases / Bundles">
              <Input value={extra.noOfCases} onChange={(e) => setExtra({ ...extra, noOfCases: e.target.value })} placeholder="e.g. 4 BUNDLES" />
            </Field>
            <Field label="Memo No.">
              <Input value={extra.memoNo} onChange={(e) => setExtra({ ...extra, memoNo: e.target.value })} />
            </Field>
            <Field label="GEMC Contract No.">
              <Input value={extra.contractNoGEMC} onChange={(e) => setExtra({ ...extra, contractNoGEMC: e.target.value })} />
            </Field>
          </div>
        )}
      </Card>

      {/* Summary Totals & Submit Bar */}
      <Card className="flex flex-wrap items-end justify-between gap-6">
        <div className="text-xs space-y-2 text-y2k-muted min-w-[280px]">
          <div className="flex justify-between gap-8 border-b-2 border-y2k-border pb-1 font-semibold">
            <span>Subtotal</span>
            <span className="font-bold text-y2k-text font-mono">{formatCurrency(calc.subtotal)}</span>
          </div>

          {isIntraState ? (
            <>
              <div className="flex justify-between gap-8 font-semibold">
                <span>CGST ({calc.lines[0]?.gst ? calc.lines[0].gst / 2 : 9}%)</span>
                <span className="font-bold text-y2k-text font-mono">{formatCurrency(calc.cgst)}</span>
              </div>
              <div className="flex justify-between gap-8 border-b-2 border-y2k-border pb-1 font-semibold">
                <span>SGST ({calc.lines[0]?.gst ? calc.lines[0].gst / 2 : 9}%)</span>
                <span className="font-bold text-y2k-text font-mono">{formatCurrency(calc.sgst)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between gap-8 border-b-2 border-y2k-border pb-1 font-semibold">
              <span>IGST</span>
              <span className="font-bold text-y2k-text font-mono">{formatCurrency(calc.igst)}</span>
            </div>
          )}

          <div className="flex justify-between gap-8 font-semibold">
            <span>Round off</span>
            <span className="font-bold text-y2k-text font-mono">₹{calc.roundOff.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[11px] font-bold text-y2k-muted uppercase tracking-wider">Grand Total</p>
            <p className="text-3xl font-black text-y2k-text font-mono tracking-tight">{formatCurrency(calc.total)}</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all disabled:opacity-50 shrink-0"
          >
            {submitting ? 'Generating...' : 'Generate Invoice'}
          </button>
        </div>
      </Card>
    </div>
  );
}
