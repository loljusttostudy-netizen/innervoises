import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { Field } from '../components/ui/Field.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { formatCurrency } from '../utils/formatNumber.js';
import { ArrowLeft, FileText, Plus, X } from 'lucide-react';
import api from '../context/api.js';
import toast from 'react-hot-toast';
import { INDIAN_STATES as STATES } from '../utils/indianStates.js';

const PARTY_TABS = ["Details", "Logistics & refs", "Banking", "Ledger", "History"];

export function PartyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [partyData, setPartyData] = useState(null);
  const [form, setForm] = useState(null);
  const [tab, setTab] = useState("Details");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartyDetails();
  }, [id]);

  const fetchPartyDetails = async () => {
    try {
      const res = await api.get(`/parties/${id}`);
      setPartyData(res.data.data);
      setForm(res.data.data.party);
    } catch (err) {
      toast.error('Failed to load party details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/parties/${id}`, form);
      toast.success('Party details saved');
      fetchPartyDetails();
    } catch (err) {
      toast.error('Failed to save party');
    }
  };

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (loading || !form) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-y2k-text border-t-transparent animate-spin" />
      </div>
    );
  }

  const bal = partyData.balance || 0;
  const ledger = partyData.ledger || [];
  const invoices = partyData.invoices || [];

  return (
    <div className="space-y-6 font-sans pb-12">
      <button
        onClick={() => navigate('/parties')}
        className="flex items-center gap-2 px-4 py-2 bg-white text-y2k-text font-bold text-xs border-2 border-y2k-border hover:bg-y2k-yellow transition-all shadow-y2k-sm"
      >
        <ArrowLeft size={16} /> All Parties
      </button>

      <div className="bg-white border-2 border-y2k-border shadow-y2k p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-y2k-text tracking-tight">{form.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <Pill tone={form.category === "Government" ? "blue" : "gray"}>{form.category}</Pill>
            <Pill tone={bal > 0 ? "red" : bal < 0 ? "green" : "gray"}>
              {bal === 0 ? '₹0 Settled' : `${formatCurrency(Math.abs(bal))} ${bal > 0 ? 'receivable' : 'advance'}`}
            </Pill>
          </div>
        </div>
        <button
          onClick={handleUpdate}
          className="px-5 py-2.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all shrink-0"
        >
          Save Changes
        </button>
      </div>

      {/* Y2K Tab Bar */}
      <div className="flex overflow-x-auto max-w-full gap-2 p-1 bg-white border-2 border-y2k-border shadow-y2k-sm w-full sm:w-fit no-scrollbar">
        {PARTY_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-bold transition-all border whitespace-nowrap shrink-0 ${
              tab === t 
                ? 'bg-y2k-text text-y2k-bg border-y2k-text shadow-y2k-sm' 
                : 'bg-transparent text-y2k-text border-transparent hover:bg-y2k-bg'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB 1: DETAILS */}
      {tab === "Details" && (
        <Card className="grid md:grid-cols-2 gap-4">
          <Field label="Party Name">
            <Input value={form.name} onChange={setField("name")} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={form.category} onChange={setField("category")} options={["Government", "Local"]} />
            </Field>
            <Field label="State">
              <Select value={form.state} onChange={setField("state")} options={STATES} />
            </Field>
          </div>

          <Field label="GSTIN">
            <Input value={form.gstin} onChange={setField("gstin")} />
          </Field>
          <Field label="Place of Supply">
            <Select value={form.placeOfSupply} onChange={setField("placeOfSupply")} options={STATES} />
          </Field>

          <Field label="Phone">
            <Input value={form.phone} onChange={setField("phone")} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={setField("email")} />
          </Field>

          <Field label="Billing Address">
            <Input value={form.billingAddress} onChange={setField("billingAddress")} />
          </Field>
          <Field label="Shipping Address">
            <Input value={form.shippingAddress} onChange={setField("shippingAddress")} />
          </Field>

          <Field label="Sales Person">
            <Input value={form.salesBy} onChange={setField("salesBy")} />
          </Field>
          <Field label="Reference Number">
            <Input value={form.referenceNumber} onChange={setField("referenceNumber")} />
          </Field>
        </Card>
      )}

      {/* TAB 2: LOGISTICS */}
      {tab === "Logistics & refs" && (
        <Card className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Vehicle No."><Input value={form.vehicleNo || ''} onChange={setField("vehicleNo")} /></Field>
            <Field label="Transport Name"><Input value={form.transportName || ''} onChange={setField("transportName")} /></Field>
            <Field label="No. of Cases"><Input value={form.noOfCases || ''} onChange={setField("noOfCases")} /></Field>
            <Field label="E-Way Bill No."><Input value={form.eWayBillNo || ''} onChange={setField("eWayBillNo")} /></Field>
            <Field label="S.O. No."><Input value={form.soNo || ''} onChange={setField("soNo")} /></Field>
            <Field label="S.O. Date"><Input type="date" value={form.soDate || ''} onChange={setField("soDate")} /></Field>
            <Field label="Contract No. (GEMC)"><Input value={form.contractNoGEMC || ''} onChange={setField("contractNoGEMC")} /></Field>
            <Field label="C.P. No."><Input value={form.cpNo || ''} onChange={setField("cpNo")} /></Field>
            <Field label="C.P. Date"><Input type="date" value={form.cpDate || ''} onChange={setField("cpDate")} /></Field>
            <Field label="Memo No."><Input value={form.memoNo || ''} onChange={setField("memoNo")} /></Field>
            <Field label="Memo Date"><Input type="date" value={form.memoDate || ''} onChange={setField("memoDate")} /></Field>
          </div>

          <div className="pt-4 border-t border-y2k-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-y2k-text uppercase tracking-wider">Custom Logistics Fields</h4>
              <button
                type="button"
                onClick={() => {
                  const currentCustom = form.customFields || [];
                  setForm({ ...form, customFields: [...currentCustom, { label: '', value: '' }] });
                }}
                className="px-3 py-1 bg-y2k-bg text-y2k-text text-xs font-bold border-2 border-y2k-border flex items-center gap-1 hover:bg-y2k-bg/80 transition-colors"
              >
                <Plus size={14} /> Add Field
              </button>
            </div>

            {(form.customFields || []).map((cf, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={cf.label || ''}
                  onChange={(e) => {
                    const updated = [...(form.customFields || [])];
                    updated[idx].label = e.target.value;
                    setForm({ ...form, customFields: updated });
                  }}
                  placeholder="Field Name (e.g. Driver Phone)"
                  className="w-1/3 text-xs"
                />
                <Input
                  value={cf.value || ''}
                  onChange={(e) => {
                    const updated = [...(form.customFields || [])];
                    updated[idx].value = e.target.value;
                    setForm({ ...form, customFields: updated });
                  }}
                  placeholder="Field Value (e.g. +91 9876543210)"
                  className="flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = (form.customFields || []).filter((_, i) => i !== idx);
                    setForm({ ...form, customFields: updated });
                  }}
                  className="p-2 bg-y2k-red/30 hover:bg-y2k-red text-y2k-redDark border border-y2k-redDark transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: BANKING */}
      {tab === "Banking" && (
        <Card className="grid md:grid-cols-2 gap-4">
          <Field label="Bank Name & Branch"><Input value={form.bankName || ''} onChange={setField("bankName")} /></Field>
          <Field label="Account No."><Input value={form.accountNo || ''} onChange={setField("accountNo")} /></Field>
          <Field label="IFSC Code"><Input value={form.ifsc || ''} onChange={setField("ifsc")} /></Field>
          <Field label="Payment Terms"><Input value={form.paymentTerms || ''} onChange={setField("paymentTerms")} placeholder="30 days from issue" /></Field>
          <div className="md:col-span-2">
            <Field label="Packing Details"><Input value={form.packingDetails || ''} onChange={setField("packingDetails")} /></Field>
          </div>
        </Card>
      )}

      {/* TAB 4: LEDGER */}
      {tab === "Ledger" && (
        <Card className="!p-0 overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-[1fr_120px_120px_130px] gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-y2k-muted border-b-2 border-y2k-border bg-y2k-bg/50">
            <span>Entry / Transaction</span>
            <span className="text-right">Debit (Udhar)</span>
            <span className="text-right">Credit (Naqd/Pay)</span>
            <span className="text-right">Balance</span>
          </div>

          {ledger.length === 0 ? (
            <div className="p-12 text-center text-xs font-semibold text-y2k-muted">No ledger entries recorded for this party</div>
          ) : (
            ledger.map((l, i) => (
              <React.Fragment key={i}>
                {/* Desktop Row */}
                <div className="hidden md:grid grid-cols-[1fr_120px_120px_130px] gap-3 px-5 py-4 text-xs items-center border-b-2 border-y2k-border last:border-none hover:bg-y2k-bg/40 transition-colors">
                  <div>
                    <p className="font-bold text-y2k-text">{l.desc}</p>
                    <p className="text-[10px] text-y2k-muted font-semibold mt-0.5">{l.date}</p>
                  </div>
                  <span className="text-right font-black font-mono text-y2k-redDark">
                    {l.debit ? formatCurrency(l.debit) : '—'}
                  </span>
                  <span className="text-right font-black font-mono text-y2k-greenDark">
                    {l.credit ? formatCurrency(l.credit) : '—'}
                  </span>
                  <span className="text-right font-black font-mono text-y2k-text">
                    {formatCurrency(l.runningBalance)}
                  </span>
                </div>

                {/* Mobile Card */}
                <div className="md:hidden p-4 border-b-2 border-y2k-border last:border-none space-y-2 bg-white">
                  <div>
                    <p className="font-bold text-xs text-y2k-text">{l.desc}</p>
                    <p className="text-[10px] text-y2k-muted">{l.date}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-y2k-border/40">
                    <div className="flex items-center gap-3">
                      {l.debit ? (
                        <span className="font-black font-mono text-y2k-redDark">Dr: {formatCurrency(l.debit)}</span>
                      ) : null}
                      {l.credit ? (
                        <span className="font-black font-mono text-y2k-greenDark">Cr: {formatCurrency(l.credit)}</span>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-y2k-muted block">Bal</span>
                      <span className="font-black font-mono text-y2k-text">{formatCurrency(l.runningBalance)}</span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))
          )}
        </Card>
      )}

      {/* TAB 5: HISTORY */}
      {tab === "History" && (
        <Card className="!p-0 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-12 text-center text-xs font-semibold text-y2k-muted">No invoices found for this party</div>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv._id}
                onClick={() => navigate(`/invoices/${inv._id}`)}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-y2k-bg/40 border-b-2 border-y2k-border last:border-none transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-y2k-yellow border border-y2k-border flex items-center justify-center text-y2k-text font-bold text-xs">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-y2k-text font-mono">{inv.invoiceNo}</p>
                    <p className="text-[10px] text-y2k-muted font-semibold">{inv.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black font-mono text-y2k-text">{formatCurrency(inv.total)}</span>
                  <Pill tone={inv.status === 'paid' ? 'green' : inv.status === 'partial' ? 'amber' : 'red'}>
                    {inv.status}
                  </Pill>
                </div>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
